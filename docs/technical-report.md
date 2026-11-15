# dsh-purge 技术报告

| 项 | 值 |
| --- | --- |
| 插件版本 | `dsh-purge 1.2.4`（本仓库 HEAD；已发布 release 为 1.2.3） |
| 宿主 | DeepSeek Harness **0.2.2-rc.1**（官方桌面 EXE，profile `desktop`） |
| 运行面 | `desktop`（`resources/app`，由 `app.asar` 解包而来）；Web 面 `dsh web` 同一份包支持 |
| 报告基线 | 本机实测：补丁 85 条 / 目标键 57 个 / 加密槽 21 194 字符 |
| 代码规模 | `lib/**` 58 文件 1 963 KB；`client.js` 499 KB（预构建）；`scripts/**` 15 文件 152 KB；仓库 3.9 MB（不含 `.git`） |
| 运行时要求 | Node **>= 22.13.0**，且 `node:sqlite` 可用（演练台事实库） |

本文所有结论均来自对**本机已安装的官方宿主**与**本仓库源码**的实测：`core.patchStatus()`、
`core.applyReplacementsToText()` 干跑、`scripts/check-*.mjs`、以及宿主文件逐个比对。行号与键名
随宿主版本漂移，形状以「补丁描述符 + pattern」为准。

---

## 1. 摘要

`dsh-purge` 不是提示词文件，也不是模型侧的越狱模板。它是**装在本机官方 Harness 上的三层装置**：

1. **Cordis 插件**：挂进宿主进程，接管 `systemPrompt` 装配、注册命令/工具/HTTP 路由、订阅
   `session/created`、`agent/pre-step`、`agent-preset/selected` 等事件；
2. **宿主文件改写器**：对已安装的 `@deepseek-ai/*` 包做**声明式文本补丁**（85 条，57 个目标键），
   改的是审批门、沙箱策略、观察策略、结果裁剪、提示词文案与若干宿主正确性缺陷；
3. **桌面密封包解包器**：官方 EXE 把全部代码封在 `app.asar` 里，插件把它改名让位、解包成可写目录，
   否则第 2 层无从下手；升级后按 journal 回滚或重打。

它解决的问题是**归因**：Harness 会在运行时改提示词、拦审批、收沙箱、裁结果。只看「模型答不答」
会把宿主拦截误算成模型拒绝。dsh-purge 把这两层拆开，让「宿主允许什么」变成可开关、可回滚的配置。

---

## 2. 定位与设计约束

| 约束 | 实现方式 |
| --- | --- |
| 不改 Harness 源码仓库 | 只写**已安装**的 `@deepseek-ai/*`；源码 checkout 仅在 `doctor --repo` 校验时读 |
| 不写死盘符 | `DSH_HOME` → 启动器旁 `.dsh` → `npm prefix/root -g` → 嵌套包 → `~/.dsh` 逐级探测 |
| 幂等 | 每条补丁带 `marker`，命中即 `already`；插入型带 `skipIfMarked`/`insertProbe` |
| 可回滚 | 每个被改文件一份 `<file>.dshpurge.bak`；桌面侧另有 asar 改名记录 |
| 失败不半改 | `expect` 校验命中数，不符**整条拒写**（`hitMismatch`） |
| 版本漂移可见 | 命不中记 `pending`/`skipped`/`na`，不猜、不覆盖 |
| 启动不写宿主 | 默认 `autoApplyOnStart: false`：只有点「应用」才动宿主文件 |

---

## 3. 部署拓扑

### 3.1 安装面

```powershell
# Web（官方 dsh web，profile=web）
dsh plugin --profile web add https://github.com/<repo>/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
# 桌面（官方 EXE，profile=desktop）
dsh plugin --profile desktop add https://github.com/<repo>/releases/download/v1.2.4/dsh-purge-1.2.4.tar.gz
```

两边**分开装、分开应用**：Web 的包进不了桌面端，反之亦然。安装只把插件写进 profile，
**不会**改宿主；必须在该宿主里点「清洗 → 应用」。

### 3.2 profile → bundle → 插件实例

```
$DSH_HOME/profiles/desktop/package.json
├─ dependencies:        "dsh-purge": "<tarball 或 file:...>"
└─ dsh.profile.bundles: [ "@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", … , "dsh-purge" ]
                                   │
                    node_modules/dsh-purge/cordis.patch.yml
                                   │
        ┌──────────────────────────┼───────────────────────────┐
        ▼                          ▼                           ▼
  id: dsh-purge            dsh-purge/redteam          dsh-purge/redteam/store
  inject:[systemPrompt,    （预设/技能落地）            （SQLite 事实库）
   tools]                  dsh-purge/redteam/ui（HTTP 桥）
```

`cordis.patch.yml` 同时做三件事：

- **关掉旧独立红队包**（`dsh-redteam-mode` 等 5 条 `disabled: true`），避免两套抢注册；
- **改官方 `system-prompt` 配置**：`includeHarnessIdentity: false`、`personaPrefix/Suffix: ""`；
- **插入本插件 4 个实例**，并给出默认配置：

```yaml
- insert:
    - id: dsh-purge
      name: 'dsh-purge'
      inject: [systemPrompt, tools]
      config:
        enabled: true
        autoApplyOnStart: false      # 启动不写宿主
        autoUpdateOnStart: false
        autoRevertOnMissing: false
        injectOnce: false
        stripMnemon: true
        postPrompt: ""
        postPromptOrder: 5100
        autoRetry: true
        retryMax: 3
        autoContinue: false
        continueMax: 3
        continueText: "继续"
        capabilityProtocol: true
        hooksDenyBypass: true
```

### 3.3 桌面密封包

```
resources/
├─ app.asar.dshpurge-<opId>   209 MB   原归档（改名前 + 记 hash，回滚用）
├─ app/                                解包产物 = 真正被加载的代码
│   ├─ lib/main.js                     desktop-shell（被 #45/#46/#82/#83/#84/#91 改）
│   ├─ dsh/…                           官方 CLI 侧
│   └─ dsh/node_modules/@deepseek-ai/  ← ai_base：所有补丁写在这里
└─ runtime/primary-runtime/…           Node 运行时
```

`desktopAsarStillSealed()` 判定「还没解包」；此时点「应用」走 `openSealedDesktopHost()`：
改名 → 解包 → 打补丁 → `scheduleSealedDesktopRestart()` 重启一次。记录落在
`$DSH_HOME/dsh-purge/unpacked-asar.json`（`{size, mtimeMs}`）与 `operations/<id>/journal.json`。

---

## 4. 代码结构

| 文件 | 行数 | 职责 |
| --- | ---: | --- |
| `bin/dsh-purge.js` | 233 | CLI：`--status/--apply/--revert/--uninstall/--doctor/--edit`，`--json` 仅限 status/doctor |
| `lib/index.js` | 2 638 | Cordis 入口 `apply(ctx, config)`：注入、钩子、命令、工具、HTTP 路由接线 |
| `lib/core.js` | 8 808 | **补丁引擎**：`ALL_PATCHES`、`targetFiles()`、`applyPatches()`、备份/回滚、主目录与 `ai_base` 探测、shim 注入 |
| `lib/identity.js` | 987 | 提示词装配重写：`rewritePromptAssembly`、`overlayOfficialIdentity`、`installAssembleGuard`、`modePromptText` |
| `lib/anchor.js` | 132 | 尾部锚点：主 section（order 10150）+ 子会话 context（order 235） |
| `lib/capability-protocol.js` | 48 | 三套「能力选用协议」正文（官方 / 红队 lead / 红队 executor） |
| `lib/asset-table.js` `table-key.js` `table-read.js` | 169 / 27 / 18 | 加密槽常量 + AES-256-GCM 封/开 |
| `lib/rules.js` | 560 | 规则集：多套 `AGENTS.md`/`CLAUDE.md`，`fallback/strict/always` 策略 |
| `lib/skills.js` | 747 | Skill 导入 `$DSH_HOME/skills/<id>/SKILL.md`（zip/文件夹） |
| `lib/rewind.js` | 644 | 回退：基于 `session.fork({atSeq})` 的 once / round |
| `lib/continue-retry.js` | 360 | 自动继续与异常重试（`continueMax` / `retryMax`） |
| `lib/hooks-deny.js` | 224 | #30/#31/#64/#65 组补丁的运行时开关与还原 |
| `lib/subagent-control.js` | 67 | 接管子代理审批 |
| `lib/desktop.js` `extract-asar.js` | 1 857 / 450 | 官方桌面定位、asar 改名/解包/回滚 |
| `lib/reapply.js` `reapply-transaction.js` | 511 / 60 | 启动自愈：`installed-rev`、`applied.json`、settle 冷却 |
| `lib/update*.js` `operation-boot.js` `file-journal.js` | 1 021 + 12 KB + 3 KB | 可恢复更新事务：备份 → 换文件 → 重启 → boot-report 校验 → 失败还原 |
| `lib/redteam/**` | 19 文件 | 演练台：schema/评分/工具/UI/预设组合/技能可用性 |
| `client.js` | 499 KB（预构建） | 会话标题旁侧栏（DSH client plugin，`inject: [slots, locale]`） |
| `presets/redteam/**` | 3 文件 | 红队预设：5 执行角色 + anchor-gate |
| `skills/redteam/**` | 23 个 `.md` | 随包技能（侦察/打点/隧道/凭据/横向/webshell 等） |

---

## 5. 补丁引擎

### 5.1 补丁描述符

```js
{
  id: 6, name: "SANDBOX_DENY_FILE_WRITE",
  layer: "代码", layer_en: "Code",
  desc: "沙箱 deny file-write / sandbox deny",
  file: "sandbox-local",              // targetFiles() 的键，可为数组
  rel:  ["lib", "index.js"],          // 拼接相对路径
  patterns: ['"(deny file-write*)"'],
  replace:  '"(allow file-write*)"',
  marker:   "(allow file-write*)"     // 幂等判据
}
```

| 字段 | 语义 |
| --- | --- |
| `replacements[]` | 多段顺序替换，每段 `{pattern, replace, expect?, insertProbe?}` |
| `pattern` | 字符串或正则；字符串走 `split/join`（全量替换），正则走 `replace`（可回填 `$1`） |
| `expect` | 声明命中数；实际不符 → `hitMismatch` → **整条拒写** |
| `marker` / `markers[]` / `markersAny` | 完成判据；`markersAny` 为「任一命中即完成」 |
| `skipIfMarked` | 插入型：产物已在则不再 `replaceAll`（防重复叠加，例如 #1 曾每次 Apply 叠 +841 字符） |
| `optional` | 目标文件缺失时记 `na` 而非 `missing_file`，且不阻断 `--apply` |
| `strictFiles` | 未命中时报 `pattern_not_found`，而不是静默跳过 |
| `naWhenUnmatched` | 目标形状在本宿主已不存在 → 记 `na`（1.2.4 新增） |
| `surfaces` | 限定 Web / desktop |
| `softSettle` | 启动自愈时允许「软完成」 |

### 5.2 目标文件解析

`targetFiles(aiBase, dshHome, surface)` 返回「键 → 真实路径（可多条）」映射。本机 57 个键全部解析成功，
覆盖 30+ 个宿主包。代表性键：

| 键 | 指向（0.2.2-rc.1） |
| --- | --- |
| `agent-instructions` | `dsh-agent-instructions/lib/index.js` |
| `escalation` | `dsh-sandbox/lib/index.js`（+ `lib/types/escalation.js`） |
| `sandbox-local` `fs-sandbox` | 沙箱执行面 / 进程内围栏 |
| `user-approval` `user-approval-code` `user-approval-invariant` | 审批门（类型/实现/不变量） |
| `fs-observation-policy` | 观察策略（读写删除意图） |
| `dsh-tools` `dsh-tools-pipeline` `dsh-tools-types` | 工具运行时（`serviceAsk` 在 **pipeline.js**） |
| `base` `web-app` `headless` | 各 bundle 的 `cordis.patch.yml` |
| `preset-*`（standard/cordis/minimal/ptc/…) | 内置与用户预设 yml |
| `desktop-shell` | `resources/app/lib/main.js` |
| `agent-loop` `system-prompt` `llm-deepseek` `session` `api-session-controller` | 各宿主内核包 |
| `conversation-client` | `dsh-client-ui-conversation/lib/client.js`（前端 bundle） |

解析规则：每个键给出**候选路径数组**，npm 平铺 / `dsh/node_modules` 嵌套 / 源码 checkout 三种布局都能命中；
末尾统一过 `filterTargetFiles()`（剔除用户 profile 覆盖层，避免自愈盖掉用户 patch，见 #43 注释）。

### 5.3 应用流程

```text
applyPatchesAllHosts(ALL_PATCHES, opts)
├─ enumeratePatchAiBases()              枚举所有 @deepseek-ai 根（多宿主一次打）
└─ for each host:
    applyPatches(aiBase, patches, opts)
    ├─ restoreMissingOriginalsFromBak()   声明过但文件丢了 → 从 .bak 拷回（#78）
    ├─ refreshStaleBaksForUpgrade()       宿主升级后 .bak 已过期 → 重新备份
    ├─ repairPluginCordisYaml()
    ├─ files = targetFiles(aiBase)
    └─ for patch:
        ├─ patchAppliesHere()? 否 → na
        └─ for key → for path:
            ├─ read text
            ├─ preserveClientBundles 且是前端 bundle → 只判状态，不写
            ├─ applyReplacementsToText(text, patch, fp)
            │   ├─ skipIfMarked 且已标记 → changed=false
            │   ├─ expect 命中数不符 → hitMismatch → 整条拒写
            │   └─ 逐段替换（LF 归一；YAML 走 yamlJsCommentsToHash）
            ├─ changed → 备份 .dshpurge.bak（不存在才建）→ 原子写 → applied++
            ├─ marker 命中 → already++
            └─ 否则 → notFound/skipped
        └─ rollupPatchStatus() → applyNaGate() → report[]
```

### 5.4 状态语义

| 状态 | 含义 | 是否阻断 Apply |
| --- | --- | --- |
| `applied` | 本次写成功 | 否 |
| `already` | 原文已是目标形状（marker 命中） | 否 |
| `pending` | 有剩余工作但没写成功（读失败等） | **是** |
| `skipped` | 文件在、原文不在、非 strict | 否 |
| `na` | 不适用（可选包未装 / 结构已消失 / 回收型补丁无事可做） | 否 |
| `missing_file` | 必需文件不存在 | 是 |
| `pattern_not_found` | `strictFiles` 且未命中 | 是 |
| `hit_count_mismatch:#N:a/b` | `expect` 与实际命中数不符 | 是（该条） |

### 5.5 备份与回滚

- 每个被改文件旁 `<file>.dshpurge.bak`，写前建、`revert` 时覆盖回去并删备份；
- 无备份时只剥掉 shim 里由本插件写入的行；`prompt-inject.md` 是用户文件，`revert` 保留；
- 桌面密封包回滚 = 把 `app.asar.dshpurge-<opId>` 改名回 `app.asar`；
- `uninstall` = 先还原（若已应用）→ 删注入文件/规则库/插件本体 → 从 profile 的 `bundles` 摘除。

---

## 6. 补丁清单（85 条）

### 6.1 分层

| 层 | 条数 |
| --- | ---: |
| Prompt（提示词文案） | 27 |
| Code（宿主执行逻辑） | 47 |
| Tools（工具描述/协议） | 8 |
| 版本兼容（0.1.5 ×1 / 0.2.0 ×2） | 3 |

### 6.2 按功能域

**A. 审批与沙箱（让「拦截」变成可配置）**

| id | 名称 | 作用 |
| --- | --- | --- |
| 5 | APPROVAL_NEVER_SENTENCE | 审批提示句 |
| 8 | APPROVAL_POLICY_DEFAULT | `danger-full-access` 时 policy 合成 `never`（不写死 env） |
| 9 | APPROVAL_AUTO_GRANT | 审批门直接 `allowed-once`，不走 waterfall |
| 10 | APPROVAL_CONFIG_DEFAULT_NEVER | 审批配置默认 never |
| 11 / 12 | APPROVAL_*_SENTENCE_BYPASS | never / ask 提示句 → 自动放行 |
| 7 | SANDBOX_MODE_DEFAULT | 默认模式改 `danger-full-access`（UI 仍可切） |
| 6 | SANDBOX_DENY_FILE_WRITE | `(deny file-write*)` → `(allow file-write*)` |
| 15 | SANDBOX_CONFINE_PASSTHROUGH | confine 直通 |
| 16 | FS_FENCE_DISABLED | 进程内文件围栏取消 |
| 13 | ESCALATION_WIDENING_EXEMPT | 豁免严格升级阶梯 |
| 14 | ESCALATION_GRANT_UNCONDITIONAL | 升级无条件授信 |
| 35 | ESCALATION_NEVER_REJECT | rejected/cancelled/unavailable 仍授信 |
| 51 | FRESH_SESSION_FULL_ACCESS | 新会话不被钉回 `workspace-write`（运行时另有一道 `permissionPresets.set`） |
| 61 / 63 / 89 | SANDBOX_POLICY_* / PLAN_MODE_NEUTRAL | 只读策略、计划模式、品牌词中立 |
| 62 | OFFICIAL_TOOL_ASK_FAILOPEN | 无审批通道 → allow；用户点拒绝仍 deny |

**B. 观察策略与工具行为**

| id | 名称 | 作用 |
| --- | --- | --- |
| 17 | FS_OBSERVATION_INTENT_FREE | 写/编辑/删除意图放行（0.2.2 合并进 `requirePresent`） |
| 18 | REPEAT_TOOL_REMINDER_DISABLED | 重复调用守卫失效 |
| 19 | TOOL_RESULT_PRUNER_DISABLED | 工具结果裁剪关闭 |
| 21 | BASH_TIMEOUT_RESTORE | 把插件旧版抬到 10 min 的前台等待恢复成官方 60 s |
| 22 | READ_CAPS_RAISED | read 上限放宽 |
| 23 | SUBAGENT_MAXDEPTH_RAISED | 子代理深度 3 → 10 |
| 29 / 33 / 36 / 37 / 48 | 工具描述中立化 | web untrusted 框、shell 拒绝话术、升级字段、子代理 scope lock、删除/移动告诫 |
| 24 | PRESET_FETCH_ENABLED | 预设 `tool-web fetch: true` |
| 30 / 31 / 64 / 65 | HOOKS_* | hooks deny/steer 组（`hooksDenyBypass` 控制，可整体还原） |
| 59 / 60 | AUTO_REVIEW / RUN_CODE | 官方 Auto Review、PTC `run_code` 审批中立 |
| 28 / 38 / 39 / 42 | 插件兼容 | 梁神 phase-1、`persona.text` 别名、v0 会话 summary、settings 旧 API |

**C. 提示词与身份（宿主层文案）**

| id | 名称 | 作用 |
| --- | --- | --- |
| 1 / 2 / 3 | WORKSPACE_CONTEXT / REPLACEMENT / SCOPE | 全局免责、替换稿与作用域不压 system（原文本身就是官方措辞，故多为 `already`） |
| 4 / 25 / 32 / 43 / 53 / 76 | 身份剥离族 | 去掉官方 persona 与自我称呼，只删身份句、不另写人设 |
| 26 / 70 / 73 / 80 | minimal 预设族 | 去身份、开 complete、终端不再写「无网络」、恢复官方工具表 |
| 44 / 54 / 50 / 90 | 交叉引用/交付物/技能徽章 | 中立化品牌与禁令 |
| 71 | LIANGSHEN_IDENTITY_LINE | 梁神自定义预设只去官方身份句（可选包，未安装时 `na`） |

**D. 宿主正确性（不是「放宽」，而是修 bug）**

| id | 名称 | 修的什么 |
| --- | --- | --- |
| 55 | SYSTEM_PROMPT_REPLACE_HEAD | 每步用当前整段系统提示替换第一条，避免旧提示被钉住 |
| 57 | DEEPSEEK_SYSTEM_ROLE | `developer` role 仅限 openai/azure 原生，第三方网关回退 `system` |
| 58 | REWIND_SKIP_DERIVE | 回退标记不进模型 transcript |
| 66 / 67 / 68 | *_GUARD | `section.text` / `decision.messages` / `systemNodes.content` 兜底，修掉第二轮 `gateway/internal` |
| 69 / 72 | MODEL_STREAM_RELEASE / MESSAGES_SYSTEM_CURRENT | deepseek-flash 恢复官方 in-history；Messages 的 system 用当前提示 |
| 74 | ASSEMBLE_BEFORE_PRESTEP | 每个模式第一次发送前先挂默认提示词 |
| 75 / 77 / 78 | REWIND_* / OVERLAY_RESTORE | 回退重置 todo、回退即时清理已发消息、声明文件缺失时从 `.bak` 恢复 |
| 82 / 83 / 84 / 91 | DESKTOP_* | `DSH_PROFILE` 兜底（双击 exe 时 env 缺失 → 插件不 activate → 注入全断）、信号杀不弹框、code=0 不报错、信号退出写日志 |
| 85 / 86 / 87 / 88 | SESSION_* | UI 发消息一律 followup（消 steer→next-step 竞态）；空白宿主先挂全文，再按 LF/ChatML 头尾严格比对 |
| 45 / 46 | OFFICIAL_DESKTOP_UPDATE_* | 官方桌面升级 handoff：CWD 搬到 TEMP（修 `MoveFileExW error 32`）、脚本改 ASCII |

**E. 0.2.2 适配（1.2.3 / 1.2.4）**

| id | 0.2.2 的形状 | 处理 |
| --- | --- | --- |
| 17 | `editIntent`/`deleteIntent` 合并进 `requirePresent(target, actor, verb)` | 1.2.4 改写 `requirePresent` |
| 18 | `tools/post-execute` 的 `block` 分支被删 | 1.2.4 追加 accept-only pattern |
| 13 / 35 | `new Error(msg)` → `SandboxEscalationError(msg, CODE)`；`cancelled` 先 `throwIfAborted()` | 1.2.4 追加 pattern |
| 62 | `serviceAsk` 搬到 `dsh-tools/lib/pipeline.js`（`index.js` 只转出） | 1.2.4 新增 `dsh-tools-pipeline` 键 |
| 12 / 14 / 67 / 74 / 82 | 文案/缩进/锚点顺序变化 | 1.2.3 补双版本 pattern（老 pattern 全部保留） |
| 56 / 77 / 80 | 目标结构在 0.2.2 已不存在 / 回收型补丁 | 1.2.4 记 `na` |

> 全表见附录 A。

---

## 7. 提示词注入子系统

### 7.1 加密槽

```
lib/asset-table.js   SLOT（162 段 base64 拼接）、MASK、TAG、IV
        │
        │  key = SHA-256( "cordis.slot.v2" ␞ "dsh-purge" ␞ "surface:web|desktop" ␞ "ov.table.1" ␞ MASK )
        ▼
lib/table-read.openSlot()
        │  AES-256-GCM(SLOT, key, IV, TAG) → inflateSync → utf8
        ▼
   21 194 字符正文（= 本机 prompt-inject.md 的字符数；盘上 25 128 字节 UTF-8）
```

封槽走 `lib/table-key.sealSlot()`（`deflate level 9` + 随机 MASK/IV），默认正文由
`scripts/embed-default-prompt.mjs` 在构建时嵌入。文本形态是 ChatML 包裹
（`<|im_start|>system:<project_instructions>` …），注入前由 `peelChatmlEnvelope()` 剥壳。

### 7.2 落盘与「用户改写」判定

```
seedPromptInjectAtBoot(home)
└─ syncPromptInjectOnDiskSync()
   ├─ 盘上为空 / 等于内置 → 原子写 $DSH_HOME/prompt-inject.md，记 override-state
   ├─ 盘上是我们上次写的那份（hash/seedHash 命中）→ 刷新到当前槽
   └─ 盘上是用户自己写的 → keep，不再覆盖（除非显式「恢复默认」）
```

`override-state.json = {customized, hash, seedHash}`。判定顺序很关键：**先比「是不是我们写的」，
再比「是不是内置默认」** —— 否则重新 embed 之后，盘上的旧默认会被误判成用户手改，从此永不更新。

### 7.3 每轮注入的三段

| 段 | order | 内容 |
| --- | ---: | --- |
| `dsh-purge` | **-100000** | 加密槽正文（红队会话切掉 `CTF CORE CONTRACT` 段与禁区说明） |
| `dshpg-capabilities` | -99999 | 能力选用协议（官方 / 红队 lead / 红队 executor 三套） |
| `dsh-purge:anchor` | 10150 | 尾部锚点（`[OPERATOR ANCHOR — ACTIVE]`，把身份与格式锁放回 recency 位） |
| `dsh-purge:child-anchor` | 235（context） | 子会话锚点，排在宿主 `subagent:delegation`(120) 之后 |
| `dsh-purge:post` | 5100（可配） | `postPrompt`，默认空 |

两个反直觉细节：

1. capability 段名**故意不带** `dsh-purge` 前缀 —— 宿主 `renderPrompt` 会把以该前缀开头的段按插入序
   整体前移，带前缀会让 capability 跑到注入正文之前，反而制造「cap 在前、inject 在后」的反转；
2. 主锚点必须是 `section` 不能是 `context`：agent-loop 的 RuntimeContextProjection 只在快照文本变化时
   追加消息，静态锚点做成 context 只出现一次就被历史埋掉；子锚点反过来必须是 context，才能压过
   delegation 那句「需要审批的操作会被自动拒绝」。

### 7.4 装配劫持（`installAssembleGuard`）

```js
// 稳态：两次挂载点，缺一不可
ctx.on("system-prompt/assemble", handler, { global: true, prepend: true })
   // handler: await next()（下游抛错就吞掉用上游装配兜底）→ rewriteLiveAssembly()
setInterval(() => wrapAssemble("interval"), 400)   // 幂等包住宿主 systemPrompt 对象
   // 切预设 / 派子代理 / live-mount 会换 systemPrompt 代理对象，包不住第二轮就塌
+ session/created / agent-preset/selected / agent/pre-step 各补一次 wrapAssemble
```

`rewriteLiveAssembly()` 的固定动作：

1. 读注入源：`prompt-inject.md` → 框里正在显示的字 → 勾选的本地 `AGENTS.md`/`CLAUDE.md`
   → 内置槽默认（三级兜底）；
2. 红线策略：`strict` 恒丢 workspace baseline / `fallback`（默认）有注入才丢 / `always` 保留；
3. `rewritePromptAssembly()`：
   - 删 `harness:identity`、`dsh-purge:identity`；按 `stripMnemon` 删 mnemon 段；
   - 其余段 `stripChatmlTags(stripHarnessPersona())`（去掉宿主人设，保留功能提示词）；
   - `overlayOfficialIdentity()` 把注入正文**重新置顶**；
   - 去掉硬编码执行规则、按红队模式插入角色段；
   - 返回**新对象**（宿主会复用 `assembled`，原地改会让下一轮带残留）。

### 7.5 为什么这么绕

| 现象 | 机制 |
| --- | --- |
| 「注入只生效第一轮」 | 重设预设换了 `systemPrompt` 代理 → guard 没包上 → 宿主原生装配按 token 预算裁剪 |
| 「只截取了部分」 | 22 k 字符注入 + 工具描述 + 运行上下文；注入在最前，模型最后读到的不是它 |
| 「重启后注入没了」 | 注入段被 `complete: true` 的预设盖掉（#40 专治 0.1.5 的收尾块） |
| 「二轮必报 gateway/internal」 | 缺 `decision.messages` / `section.text` / `system.nodes.content` 兜底（#66/#67/#68） |

因此插件同时做三件事：**置顶**（order -100000）、**尾部复述**（anchor 10150）、**关掉裁剪与提纯**
（#19/#22/#23 + stripMnemon）。

---

## 8. 运行时钩子与状态改写

| 钩子 | 位置 | 作用 |
| --- | --- | --- |
| `system-prompt/assemble` | index.js | 装配重写（前文 7.4） |
| `agent/pre-step` | index.js | ① 补 wrapAssemble ② 过滤 mnemon 消息 ③ 自动继续/重试检查 |
| `session/created` | index.js | 刷新注入缓存、补 wrap、`queueMicrotask` 里把新会话权限钉到 `danger-full-access` |
| `session/event` / `session/created` | index.js | 记录 cwd → `$DSH_HOME/dsh-purge/last-cwd.txt`（供本地规则兜底） |
| `agent-preset/selected` | index.js | 切预设后重挂 guard |
| 命令注册 | index.js | `/purge` `/rules` `/skills` `/rewind` |
| 工具注册 | index.js | `purge_status` / `purge_apply` / `purge_revert` |
| webServer 路由 | index.js | 侧栏的 HTTP 桥（见 §12） |
| 子代理审批接管 | subagent-control.js | 子会话的 `ask` 直接放行一次 |

权限钉住只在「新会话且历史里没有手动 pin」时生效（`shouldKeepFreshFullAccess`）：
`danger-full-access` / `auto` / `custom` 不动，`permission/preset` 事件多于 1 次视为用户手动选择，也不动。

---

## 9. 更新、事务与自愈

### 9.1 启动自愈（settle）

启动约 4 s（桌面）后 `settleInstalledPatches()`：

```
if (!autoApplyOnStart)                  # 默认
    → 只校验戳：patchesMatchInstallStrict() || hostCleanEnoughToKeep()
      → markPatchesApplied() 或什么都不做（绝不写宿主文件）
else
    → 与安装 rev 不一致？
        ├─ 密封桌面 → 等用户点应用
        ├─ 官方刚升级（upgradeMarker）→ reapply + 清陈旧解包目录 + 重启一次
        └─ 其他 → reapplyInstalled({scheduleSwap:false}) → 需要整退重启则标记
    → 一致 → autoApply(config)（可选 autoUpdateOnStart）
```

### 9.2 戳

| 文件 | 内容 |
| --- | --- |
| `installed-rev` | 已安装插件修订（git sha 或 `apply:<版本>`） |
| `applied.json` | `{version, sha, at}` —— 宿主补丁对应的插件版本 |
| `settle-restart.guard` | settle 重启冷却（默认 180 s 窗口） |
| `version-history.json` | 更新流水（`ref/sha/version/channel/at`） |
| `auto-update-guard.json` | 自动更新去重 |
| `channel.json` | `stable`/`beta` + pin |

`stampMatches()` 的判据顺序：版本一致 → sha 非空 → 占位戳互认 → `sameRev`。
1.2.4 起 `resolveApplySha()` 对**包安装副本**（无 `.git`、无 `.dsh-purge-revision`）一律用
`apply:<版本>`，并在启动时 `syncDistStamp()` 把孤儿 sha 归一，避免「戳对不齐 → 白跑一次 reapply + 重启」。

### 9.3 更新事务

```
update.js       取目标（稳定通道只认附件完整的已发布 Release，一次钉一个提交）
   ↓
update-transaction.js   createTransaction → lockInstall → capture（host/skills/scripts）
   ↓                    PAYLOAD_NAMES 白名单：lib bin docs presets skills scripts client.js …
update-worker.js        stopHost → 换文件 → startHost → waitForBoot（最长 120 s）
   ↓
operation-boot.js       reportBoot → bootMatches(nonce, report) → phase=verified
   ↓ 失败
file-journal.js         按 journal 逐条回滚；最多重启恢复一次
```

`operations/<uuid>/journal.json` 记 `phase`、`engine_hashes`、`restart`（exe/argv/cwd/asar）、
`asar_move`（from/to/hash）、新旧 pid；`boot-report.json` 是宿主启动后自报的
`{patches_active, activation_pending, patches_pending}`。

---

## 10. 规则集 / Skill / Rewind

| 能力 | 落点 | 说明 |
| --- | --- | --- |
| 规则集 | `$DSH_HOME/rules/<id>.md` + `state.json` | 多套 `AGENTS.md`/`CLAUDE.md`，`use` 时写入 `$DSH_HOME` 或工作区；空白注入时才作为兜底 |
| 工作区策略 | `$DSH_HOME/dsh-purge/*` | `strict` / `fallback` / `always` 决定是否丢弃 DSH workspace baseline 段 |
| Skill | `$DSH_HOME/skills/<id>/SKILL.md` | 导入 zip/文件夹；不进注入段，命中与加载由 DSH 自己负责；卸载插件不删用户 Skill |
| Rewind | 宿主 `session.fork({atSeq})` | `once` 回退一次 / `round` 回退上一轮（含该轮子代理）；旧会话归档，提示词回填输入框 |

---

## 11. 演练台（redteam）

| 组件 | 规模 |
| --- | --- |
| 预设 | `presets/redteam/preset.yml`（模式名「红队模式」）+ `agent.cordis.yml`（28.8 KB）+ `anchor-gate.mjs` |
| 执行角色 | 5 个：`recon` / `assess` / `vuln-scan` / `exploit` / `internal`（并发上限 3） |
| 工具 | **64** 个 `redteam_*`（engagement / 资产 / 漏洞 / 凭据 / 据点 / webshell / 隧道 / 截图 / 报告回放） |
| 技能 | **23** 个随包 `.md`：passive-recon、fofa-recon、recon-pipeline、active-scan、web-fingerprint、nuclei-scan、dir-bruteforce、unauth-exploit、credential-attack、lateral-movement、fscan-intranet、gogo-intranet、chisel/frp/suo5 隧道、vps-reverse-shell、shell-handler、webshell-toolkit、cn-proxy-pool、browser-automation、asset-correlation、kimi-webbridge、redteam-setup |
| 事实库 | `$DSH_HOME/redteam`（`node:sqlite`）：engagement / asset / stage / vuln / credential / shot / access / webshell / tunnel |
| 授权门 | `$DSH_HOME/dsh-purge/drill-grant.json`，未授权时 UI 显示「未授权」 |
| 装配 | 主会话 + 子代理角色稿（`redteamRole: <code>` 必须写在 `subagent.prompt` 第一行） |

演练台与「清洗」互不影响：不点「应用」也能只看资产库；清洗不需要授权。

---

## 12. 接口面

**HTTP（webServer，带 Origin 校验 + `allowPluginRequest`）**

```
/dsh-purge/status          /dsh-purge/hooks-deny       /dsh-purge/last-user
/dsh-purge/rewind          /dsh-purge/rewind/options   /dsh-purge/update
/dsh-purge/apply           /dsh-purge/revert           /dsh-purge/uninstall
/dsh-purge/override        /dsh-purge/restart          /dsh-purge/restart-dismiss
/dsh-purge/drill-grant     /dsh-purge/rules*           /dsh-purge/skill(s)*
/redteam/api               （演练台 POST 桥）
```

**聊天命令**：`/purge status|apply|revert|uninstall|edit|help`、`/rules list|use|create|delete|reset|help`、
`/skills list|import|create|delete|help`、`/rewind once|round`

**模型工具**：`purge_status`、`purge_apply`、`purge_revert`

**CLI**

```powershell
node bin/dsh-purge.js --status [--json] [--surface web|desktop] [--base DIR]
node bin/dsh-purge.js --doctor [--json] [--repo DIR] [--save-baseline]
node bin/dsh-purge.js --apply | --revert | --uninstall | --edit
```

`--json` 仅支持 status / doctor；`--apply` 有失败项时退出码 1；`--doctor` 失败退出码 1。

---

## 13. 数据与状态落点

```text
$DSH_HOME/                         （本机 C:\Users\lians\.dsh）
├─ prompt-inject.md                注入正文（用户文件，revert 不删）
├─ rules/                          规则集
├─ skills/<id>/SKILL.md            用户 Skill
├─ redteam/                        演练台 SQLite 与证据
└─ dsh-purge/
   ├─ applied.json                 {version, sha, at}
   ├─ installed-rev                安装修订
   ├─ override-state.json          {customized, hash, seedHash}
   ├─ channel.json / version-history.json / auto-update-guard.json
   ├─ drill-grant.json             演练台授权
   ├─ unpacked-asar.json           归档 identity
   ├─ settle-restart.guard         重启冷却
   ├─ last-cwd.txt
   ├─ host-backups/<sha>.bak|.json 每个被改宿主文件的原文
   └─ operations/<uuid>/{journal.json, boot-report.json, *.log}
宿主侧：<每个被改文件>.dshpurge.bak
```

---

## 14. 安全边界与可回滚性

| 项 | 结论 |
| --- | --- |
| 作用对象 | 本机已安装的官方 `@deepseek-ai/*` 与本机 `$DSH_HOME`；不联网扫描、不含对外载荷 |
| 联网行为 | 只可能访问本插件自己的 GitHub 仓库（核对版本 / 下载更新） |
| 半改保护 | `expect` 命中数不符整条拒写；原子写避免半截文件 |
| 回滚粒度 | 单文件 `.bak`；桌面 asar 改名；更新事务 journal 逐条还原 |
| 幂等 | marker / skipIfMarked / insertProbe 三重 |
| 用户数据 | `prompt-inject.md`、`rules/`、`skills/`、`redteam/` 均不在 revert 删除范围（uninstall 也保留用户 Skill） |
| 可关闭 | `hooksDenyBypass: false` 可整组还原 hooks 类补丁；`enabled: false` 整体停用 |

---

## 15. 本机实测状态（0.2.2-rc.1 / desktop）

```
surface        desktop
ai_base        …\DeepSeek Harness\resources\app\dsh\node_modules\@deepseek-ai
Activation     active（patches_active=true, activation_pending=false, patches_pending=0）
补丁            85 条 = applied 70 / pending 5 / na 10   （1.2.4 修完待应用；1.2.3 时是 70/8 skipped/1 missing_file/6 na）
目标键          57 个，全部解析成功
加密槽          21 194 字符；prompt-inject.md 25 128 字节，与槽逐字节一致（customized=false）
桌面密封包      已解包：app.asar.dshpurge-1ecf2fc5-…（209 MB）在位，unpacked-asar.json 记 identity
shim            dsh.cmd=original，dsh.ps1/dsh 缺失（桌面宿主不需要 Web shim）
演练台          drill-grant.json = granted:true
operations      journal phase=verified，boot-report patches_active=true
```

`na` 的 10 条：#28（梁神 bootstrap）、#30/#31/#64/#65（hooks 组，`hooksDenyBypass` 配置口径不同）、
#56/#77（rewind 结构在 0.2.2 已不存在）、#71（梁神未安装）、#76（可选预设）、#80（回收型补丁无事可做）。

---

## 16. 1.2.4 变更与验证

| 补丁 | 0.2.2 的实际形状 | 处理 |
| --- | --- | --- |
| #17 | `editIntent`/`deleteIntent` → `requirePresent(target, actor, verb)` | 改写 `requirePresent`；marker 取 `[dsh-purge] observation bypass: edits` 前缀 |
| #18 | `tools/post-execute` 的 `block` 分支被删 | 追加 accept-only pattern |
| #13 | `new Error(msg)` → `new SandboxEscalationError(msg, CODE)` | 追加三 throw 一并的 pattern |
| #35 | `cancelled` 分支多了 `throwIfAborted()` | 追加整块 switch pattern |
| #62 | `serviceAsk` 在 `dsh-tools/lib/pipeline.js` | 新增 `dsh-tools-pipeline` 键 + 运行态/types 两套 pattern |

配套：`naWhenUnmatched` 状态门、`syncDistStamp()` 戳归一、发布链补 `tar.gz` 并让 `SHA256SUMS`
覆盖两个归档、`dsh.install.tarball` 指向 release 资产。

**验证**

```text
patchStatus()                    85 = applied 70 / pending 5 / na 10
新 pattern 干跑产物              node --check 全部通过（改动行 171-173 / 68-75 / 2359-2367 / 183-190 / 620-627）
check-upstream-ports.mjs         28 PASS / 0 FAIL
check-update-transactions.mjs    ALL PASS（20 组）
check-evidence-rewind.mjs        ALL PASS（10 组）
check-community-update.mjs       ALL PASS（6 组）
check-preset-plugins.mjs         PASS（2 预设 / 28 条插件声明）
check-40-and-hostfs.mjs          ALL PASS
check-status-doctor.mjs          symlink 用例 EPERM（本机账户不能建符号链接），其余通过
```

---

## 17. 已知限制

1. **补丁与宿主版本强耦合**：宿主升级后 pattern 可能失配；此时状态是 `pending`/`skipped`/`pattern_not_found`，
   不会误改，但也意味着对应能力缺失。新增主机版本时必须补形状（见附录 A 的 0.2.2 一节）。
2. **`skipped` 与 `na` 的语义差异很重要**：`skipped` = 文件在、原文不在（可能是没适配）；
   `na` = 按设计不适用。1.2.4 前两者混用，容易被误读成「没打上」。
3. **密封桌面必须重启一次**：补丁写在解包目录，但宿主进程已加载旧模块；不重启不生效。
4. **`asar` 解包体积**：`resources/app` 会额外占约 200 MB+，归档改名文件同样保留（回滚用）。
5. **客户端 bundle 补丁（#56/#77 类）** 依赖前端构建产物结构，宿主改打包方式即失效。
6. **演练台依赖 `node:sqlite`**（Node ≥ 22.13）；旧运行时下不可用。
7. **多宿主**：Web 与桌面各有一份 `$DSH_HOME`，互不可见；「应用」只作用于当前宿主。
8. **本项目只做本机层**：不改变模型权重/服务端策略，也不把宿主拦截解释成模型行为。

---

## 18. 复现与校验命令

```powershell
# 状态 / 体检（只读）
node bin/dsh-purge.js --status --json
node bin/dsh-purge.js --status --surface desktop --base "<…>/node_modules/@deepseek-ai"
node bin/dsh-purge.js --doctor --json

# 语法与回归
node --check lib/core.js; node --check lib/index.js; node --check lib/rewind.js; node --check client.js
node scripts/check-upstream-ports.mjs
node scripts/check-update-transactions.mjs
node scripts/check-evidence-rewind.mjs

# 失配定位（宿主升级后先跑这个）
node scripts/diagnose-patch.mjs            # 只看非 applied
node scripts/diagnose-patch.mjs --all --json

# 生成补丁原文表（85 条 pattern/replace）
node scripts/export-patch-table.mjs

# 干跑某条补丁（不写盘）
node -e "import('./lib/core.js').then(async m=>{const ai='<…>/@deepseek-ai';const st=await m.patchStatus(ai,m.ALL_PATCHES,'desktop');console.log(Object.entries(st).filter(([,v])=>v!=='applied'))})"
```

---

## 附录 A：85 条补丁全表

| id | 名称 | 层 | 目标键 |
| ---: | --- | --- | --- |
| 1 | WORKSPACE_CONTEXT_INTRO | Prompt | agent-instructions |
| 2 | REPLACEMENT_WORKSPACE_CONTEXT_INTRO | Prompt | agent-instructions |
| 3 | SCOPE_INTRO | Prompt | agent-instructions |
| 4 | SYSTEM_PROMPT_PERSONA | Prompt | agent-preset, web-app, headless, preset-acp-app, preset-sdk-app |
| 5 | APPROVAL_NEVER_SENTENCE | Prompt | user-approval, user-approval-invariant |
| 6 | SANDBOX_DENY_FILE_WRITE | Code | sandbox-local |
| 7 | SANDBOX_MODE_DEFAULT | Code | base |
| 8 | APPROVAL_POLICY_DEFAULT | Code | base |
| 9 | APPROVAL_AUTO_GRANT | Code | user-approval-code, user-approval-invariant, user-approval |
| 10 | APPROVAL_CONFIG_DEFAULT_NEVER | Code | user-approval-code |
| 11 | APPROVAL_NEVER_SENTENCE_BYPASS | Prompt | user-approval-code |
| 12 | APPROVAL_ASK_SENTENCE_BYPASS | Prompt | user-approval-code, user-approval, user-approval-invariant |
| 13 | ESCALATION_WIDENING_EXEMPT | Code | escalation |
| 14 | ESCALATION_GRANT_UNCONDITIONAL | Code | escalation |
| 15 | SANDBOX_CONFINE_PASSTHROUGH | Code | sandbox-local |
| 16 | FS_FENCE_DISABLED | Code | fs-sandbox |
| 17 | FS_OBSERVATION_INTENT_FREE | Code | fs-observation-policy |
| 18 | REPEAT_TOOL_REMINDER_DISABLED | Code | repeat-tool-reminder |
| 19 | TOOL_RESULT_PRUNER_DISABLED | Code | compaction-tool-result-pruner |
| 21 | BASH_TIMEOUT_RESTORE | Code | base |
| 22 | READ_CAPS_RAISED | Code | tool-fs |
| 23 | SUBAGENT_MAXDEPTH_RAISED | Code | subagent, tool-subagent |
| 24 | PRESET_FETCH_ENABLED | Code | preset-unrestricted, preset-standard, preset-cordis, preset-ptc, preset-liangshen |
| 25 | HARNESS_IDENTITY_STRIP | Prompt | system-prompt |
| 26 | MINIMAL_PERSONA_PURGE | Prompt | preset-minimal, preset-sdk-minimal |
| 28 | LIANGSHEN_PHASE1_KEEP_INJECT | Prompt | liangshen-tool-bootstrap |
| 29 | TOOL_WEB_UNTRUSTED_NEUTRAL | Tools | tool-web, tool-web-nested |
| 30 | HOOKS_CLAUDE_DENY_ALLOW | Tools | hooks-claude-code |
| 31 | HOOKS_CODEX_DENY_ALLOW | Tools | hooks-codex |
| 32 | WEB_SURFACE_IDENTITY_NEUTRAL | Prompt | web-app-lib, harness-dev-context |
| 33 | TOOL_SHELL_DENIAL_PROMPT | Prompt | tool-bash, tool-pwsh |
| 34 | SANDBOX_HINT_NEUTRAL | Prompt | escalation |
| 35 | ESCALATION_NEVER_REJECT | Code | escalation |
| 36 | TOOL_FS_ESCALATION_SCHEMA | Prompt | tool-fs, escalation, tool-bash, tool-pwsh |
| 37 | SUBAGENT_SCOPE_LOCK_NEUTRAL | Prompt | subagent, subagent-types |
| 38 | PERSONA_TEXT_PREFIX_ALIAS | Code | persona |
| 39 | SESSION_V0_PLUGIN_SUMMARY_ALIAS | Code | session-format-v0 |
| 40 | COMPLETE_PROMPT_KEEP_INJECT | 0.1.5 | system-prompt |
| 42 | SETTINGS_LEGACY_API | Code | settings |
| 43 | WEB_PRESET_IDENTITY_STRIP | Prompt | preset-standard, preset-ptc, preset-cordis, preset-minimal |
| 45 | OFFICIAL_DESKTOP_UPDATE_HANDOFF | Code | desktop-shell |
| 46 | OFFICIAL_DESKTOP_UPDATE_ASCII | Code | desktop-shell |
| 47 | ANTHROPIC_OAUTH_NO_CLAUDE_IDENTITY | 0.2.0 | pi-ai-anthropic-messages |
| 48 | TOOL_SHELL_DELETE_MOVE_NEUTRAL | Tools | tool-bash, tool-pwsh |
| 49 | ANTHROPIC_OAUTH_CLI_NEUTRAL | 0.2.0 | pi-ai-anthropic-messages |
| 50 | SESSION_REFERENCE_FRAMING_NEUTRAL | Prompt | session-reference |
| 51 | FRESH_SESSION_FULL_ACCESS | Code | permission-presets |
| 52 | SESSION_LOG_UPLOAD_DEFAULT_OFF | Code | session-log-deepseek |
| 53 | WEB_SURFACE_PROHIBITION | Prompt | web-app-lib, harness-dev-context |
| 54 | DELIVERABLE_DO_NOT | Prompt | deliverables-prompt |
| 55 | SYSTEM_PROMPT_REPLACE_HEAD | Code | agent-loop |
| 56 | REWIND_HIDE_CUT_ONLY | Code | conversation-client（0.2.2 na） |
| 57 | DEEPSEEK_SYSTEM_ROLE | Code | pi-ai-completions, pi-ai-responses-shared |
| 58 | REWIND_SKIP_DERIVE | Code | session |
| 59 | OFFICIAL_AUTO_REVIEW_PASSTHROUGH | Code | auto-review |
| 60 | OFFICIAL_RUN_CODE_APPROVAL_NEUTRAL | Tools | dsh-tools, dsh-tools-ptc |
| 61 | OFFICIAL_SANDBOX_POLICY_NEUTRAL | Prompt | sandbox-policy |
| 62 | OFFICIAL_TOOL_ASK_FAILOPEN | Code | dsh-tools-pipeline, dsh-tools, dsh-tools-types |
| 63 | OFFICIAL_PLAN_MODE_NEUTRAL | Prompt | base, preset-ptc, preset-standard, preset-cordis |
| 64 | HOOKS_STOP_STEER_NEUTRAL | Tools | hooks-claude-code, hooks-codex |
| 65 | HOOKS_PRESTEP_REJECT_NEUTRAL | Tools | hooks-claude-code, hooks-codex |
| 66 | SYSTEM_PROMPT_RENDER_GUARD | Code | system-prompt |
| 67 | AGENT_LOOP_MESSAGES_GUARD | Code | agent-loop |
| 68 | SYSTEM_NODES_CONTENT_GUARD | Code | agent-loop, session |
| 69 | MODEL_STREAM_RELEASE | Code | llm-deepseek |
| 70 | PRESET_SHELL_NETWORK | Prompt | preset-minimal, preset-sdk-minimal |
| 71 | LIANGSHEN_IDENTITY_LINE | Prompt | preset-liangshen（未装时 na） |
| 72 | MESSAGES_SYSTEM_CURRENT | Code | llm-deepseek |
| 73 | PRESET_BASH_MIRROR_LINE | Prompt | preset-minimal, preset-sdk-minimal |
| 74 | ASSEMBLE_BEFORE_PRESTEP | Code | agent-loop |
| 75 | REWIND_RESET_TODOS | Code | tool-todo |
| 76 | PRESET_UNRESTRICTED_IDENTITY_STRIP | Prompt | preset-unrestricted（可选） |
| 77 | REWIND_DROP_SENT_ON_APPEND | Code | conversation-client（0.2.2 na） |
| 78 | OVERLAY_RESTORE_FROM_BAK | Code | app-boot |
| 80 | MINIMAL_OFFICIAL_TOOLSET | Tools | preset-minimal, preset-sdk-minimal（回收型，0.2.2 na） |
| 82 | DESKTOP_SHELL_PROFILE_FALLBACK | Code | desktop-shell |
| 83 | DESKTOP_HOST_CLOSE_NO_FATAL | Code | desktop-shell |
| 84 | DESKTOP_HOST_CLOSE_CODE0_NO_FAIL | Code | desktop-shell |
| 85 | SESSION_PROMPT_ALWAYS_FOLLOWUP | Code | api-session-controller |
| 86 | SESSION_STEER_ALWAYS_FOLLOWUP | Code | api-session-controller, agent-loop |
| 87 | HUNG_PROMPT_LF_NEEDLE | Code | agent-loop |
| 88 | HUNG_PROMPT_STRICT_NEEDLE | Code | agent-loop |
| 89 | SANDBOX_POLICY_BRAND_NEUTRAL | Prompt | sandbox-policy |
| 90 | SKILL_BADGE_DESCRIPTION_NEUTRAL | Prompt | skill-badge |
| 91 | DESKTOP_HOST_SIGNAL_EXIT_LOG | Code | desktop-shell |

> 空号只有 6 个：**20 / 27 / 41 / 44 / 79 / 81**，都是历史合并里撤掉的条目。`ALL_PATCHES` 以数组顺序执行，
> 数字只作标识，不表达优先级。

## 附录 B：关键事件与顺序常量

| 名称 | 值 | 位置 |
| --- | ---: | --- |
| `GLOBAL_PROMPT_ORDER` | -100000 | identity.js |
| `CAPABILITY_SECTION` order | -99999 | index.js（`GLOBAL_PROMPT_ORDER + 1`） |
| `ANCHOR_ORDER` | 10150 | anchor.js（需 > `WEB_SURFACE` 10100、< `DEPLOYMENT_PERSONA_SUFFIX` 10200） |
| `CHILD_ORDER` | 235 | anchor.js（需 > `WEB_SURFACE` 210、> `subagent:delegation` 120） |
| `postPromptOrder` 默认 | 5100 | cordis.patch.yml |
| guard 心跳 | 400 ms | index.js `wrapAssemble` |
| 桌面 settle 延迟 | 4 000 ms | settle-policy.js |
| settle 重启冷却 | 180 000 ms | reapply.js |
| 更新 boot 等待 | 120 000 ms | update-worker.js |
