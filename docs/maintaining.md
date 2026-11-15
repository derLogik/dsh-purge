# dsh-purge 维护手册：宿主升级后，自己把它续上

> 面向「仓库不再更新，但我的 DSH 升级了」这种情况。目标不是背下 85 条补丁，
> 而是掌握**一条可重复的流程**：跑诊断 → 看分歧点 → 补 pattern → 干跑验证 → 落地。
>
> 配套文件：
> - `docs/technical-report.md` —— 架构与机制（为什么这么设计）
> - `docs/reference/patch-spec.md` —— 85 条补丁的完整 pattern/replace 原文（脚本生成）
> - `scripts/diagnose-patch.mjs` —— 失配定位器
> - `scripts/export-patch-table.mjs` —— 规格表生成器

---

## 0. 心智模型：pattern 是「宿主代码快照」的函数

补丁不是「改某个功能」，而是「把宿主里某段**逐字文本**换成另一段」。所以只有三种情况会失效：

| 变化 | 失配表现 | 举例（0.2.1 → 0.2.2） |
| --- | --- | --- |
| **搬家**：代码换个包 / 换个文件 | 目标文件存在但内容对不上，或 `missing_file` | `serviceAsk` 从 `dsh-tools/lib/index.js` 搬到 `lib/pipeline.js`（#62） |
| **改形**：函数合并/拆分、分支增删、缩进变化 | 该条 `hits=0`，锚点能找到但第 N 个字符开始分歧 | `editIntent`/`deleteIntent` 合并进 `requirePresent`（#17）；`post-execute` 删掉 `block` 分支（#18） |
| **改名**：错误类型、文案、引号风格 | 分歧点落在标识符或字符串字面量上 | `new Error(msg)` → `new SandboxEscalationError(msg, CODE)`（#13/#35） |

**推论**：升级后不要猜、不要重写整个补丁；**只改那份"逐字文本"**。诊断器会把分歧点精确到字符。

---

## 1. 三十秒体检

```powershell
cd <repo>
node scripts/diagnose-patch.mjs            # 只看没打上的
node scripts/diagnose-patch.mjs --all      # 85 条全看
node scripts/diagnose-patch.mjs --id 62    # 只看某条
node scripts/diagnose-patch.mjs --json     # 给脚本/CI 用
```

输出长这样（真实输出，1.2.4 修 #13 之前）：

```
宿主 ai_base : C:\…\DeepSeek Harness\resources\app\dsh\node_modules\@deepseek-ai
宿主面       : desktop
状态汇总     : applied=70 / pending=5 / na=10

━━ #13 ESCALATION_WIDENING_EXEMPT  [pending]  (Code)
   → 可写  dsh-sandbox\lib\index.js  ✗marker
     rep[0] string ✓ hits=1
     rep[1] string ✗ hits=0
        锚点在宿主第 171 行，第 66 个字符开始分歧：
          pattern: "es(mode)) throw new Error(`sandbox escalation to …
          actual : "es(mode)) throw new SandboxEscalationError(`sandbox escalation to …
```

> `ai_base` 必须是你**正在跑的那个宿主**。脚本按宿主面自动挑（desktop 认
> `DeepSeek Harness\resources\app\…`），挑错了用 `--base` 手指定。诊断器与导出器都不用
> `findAiBase()`：脱离宿主进程运行时会误选 npm 全局装的那份 dsh，两份是不同快照。

---

## 2. 状态 → 动作（决策树）

| 状态 | 含义 | 你该做什么 |
| --- | --- | --- |
| `applied` | 已打上 | 无需动作 |
| `pending` | 有活没干成（pattern 没命中的新版形状，或读失败） | **主要工作**：按 §3 补 pattern |
| `skipped` | 文件在、原文不在、非 strict | 判断是「真失配」（该补）还是「按设计不适用」（该标 `naWhenUnmatched`） |
| `na` | 不适用：可选包未装 / 结构已消失 / 回收型补丁无事可做 | 一般不动；确认不是「该打却标了 na」 |
| `missing_file` | 必需文件不存在 | 要么补 `targetFiles` 候选路径（搬家），要么把 `optional` 打开 |
| `pattern_not_found` | `strictFiles` 且未命中 | 同 `pending`，但会阻断 `--apply`，优先修 |
| `hit_count_mismatch:#N:a/b` | `expect` 与实际命中数不符 | 官方复制了一份代码 → 把 pattern 收窄到只命中原位置，或改 `expect` |

---

## 3. 七步流程

### ① 定位宿主

```powershell
node bin/dsh-purge.js --status --json | Select-String ai_base
```

拿到 `ai_base`（`…\@deepseek-ai`）与 `surface`。

### ② 跑诊断，收失配清单

```powershell
node scripts/diagnose-patch.mjs > work\diag.txt
```

### ③ 读分歧点，判断属于哪一类

看 `pattern:` / `actual:` 两侧**第一个不同的字符**：

| 分歧点长相 | 类型 | 下一步 |
| --- | --- | --- |
| `new Error(` vs `new XxxError(` | 改名 | 直接把新的整行抄成 pattern |
| `if (downstream.kind === "block")` 在 pattern 里有、actual 里没有 | 改形（分支被删） | 删掉那段，用剩下的 accept 形态 |
| `editIntent(` 在 pattern 里、actual 是 `requirePresent(` | 改形（合并） | 找到真正执行的函数，改那里 |
| pattern 整段在 actual 里根本找不到，且目标文件里没有相关函数 | 搬家 | `grep` 整个 `@deepseek-ai` 找字符串，定位新文件 |
| 文件名都不存在 | 搬家（包拆分/合并） | 给 `targetFiles` 加候选路径 |

找搬家目标：

```powershell
$ai = "…\@deepseek-ai"
Get-ChildItem $ai -Recurse -File -Filter *.js |
  Select-String -SimpleMatch 'no approval channel is available' |
  ForEach-Object { "$($_.Path.Replace($ai+'\','')):$($_.LineNumber)" }
```

### ④ 打开宿主文件，读**真实形状**

```powershell
# 用 read 工具读区间最稳；grep 工具默认按 UTF-8
Select-String -Path "$ai\dsh-sandbox\lib\index.js" -Pattern 'WIDER_MODES|escalation to' -Encoding utf8
```

注意三件经常被忽略的东西：
- **缩进**：npm 包是 tab，`lib/types/**` 是 4 空格，同一个语义两套缩进；
- **引号**：`lib/**` 双引号，`lib/types/**` 单引号；
- **`void 0` vs `undefined`**：同上，两套。

### ⑤ 写 patch：**追加**，不要替换老 pattern

老 pattern 保留，新形状追加在后（命中即用）。同一个补丁可以有 2~4 段 `replacements`，
前几段给老宿主，后面给新宿主；都不命中也不会互相干扰。

```js
replacements: [
  { /* 0.2.2 形状 */ pattern: '…new XxxError…', replace: '…' },
  { /* 0.1.x 老形状（保留） */ pattern: '…new Error…', replace: '…' },
],
```

搬家类要同时改 `targetFiles`：

```js
"dsh-tools-pipeline": allExisting([
  ...nestedPkg(aiBase, "dsh-tools", "lib", "pipeline.js"),
]),
```

并用 `file: ["dsh-tools-pipeline", "dsh-tools", "dsh-tools-types"]` 把新键排在最前
（**运行态文件排第一**，`types/**` 只是编译副本）。

### ⑥ 干跑 + 语法验证（绝不能跳过）

```powershell
node -e @'
import("./lib/core.js").then(async (m) => {
  const fs = await import("node:fs");
  const ai = process.env.AI_BASE;                       // 你的 @deepseek-ai
  const files = m.targetFiles(ai);
  for (const id of (process.env.IDS || "13,17,18,35,62").split(",").map(Number)) {
    const p = m.ALL_PATCHES.find((x) => x.id === id);
    for (const key of [].concat(p.file)) {
      const v = files[key]; if (!v) { console.log(`#${id} ${key}: missing`); continue; }
      for (const fp of [].concat(v)) {
        const out = m.applyReplacementsToText(fs.readFileSync(fp, "utf8"), p, fp);
        console.log(`#${id} ${key}: changed=${out.changed} mismatch=${JSON.stringify(out.hitMismatch || null)}`);
      }
    }
  }
});
'@
```

再验语法：把 `out.text` 写进临时 `.mjs` 然后 `node --check`（测试脚本见
`scripts/verify` 思路，或直接照 `work/purge-verify.mjs` 的写法）。这一步能挡住
「pattern 命中却把代码切坏」这种最贵的错误。

### ⑦ 落地

```powershell
node scripts/export-patch-table.mjs     # 重新生成规格表（指纹会变）
node scripts/diagnose-patch.mjs         # 确认状态从 pending 变 applied
node scripts/check-upstream-ports.mjs   # 回归：28 项形状/幂等断言
```

然后才 `package.json` 提版本、写 `release-notes.md`、提交。

---

## 4. 写 pattern 的八条铁律

1. **只锚一段连续代码**，不要跨函数、不要跨 `#region`。官方调整 region 顺序就会整段碎掉。
2. **两套缩进/引号都补**：`lib/**`（tab + 双引号 + `void 0`）与 `lib/types/**`（4 空格 + 单引号 + `undefined`）。
3. **命中数可数就写 `expect`**：同一段代码被复制成两份时，正则会把两处一起改掉 = 无声改坏第二处。
   写成 `expect: 1` 后，官方复制成两份时该条会变成 `hit_count_mismatch:#N:1/2` 而不是乱写。
4. **marker 要「产物必然含、旧产物也含」**。跨版本兼容时取**前缀**：
   `[dsh-purge] observation bypass: edits` 同时是 `…edits are unconditional` 与
   `…edits and deletes are unconditional` 的前缀。
5. **插入型必须幂等**：`skipIfMarked: true` + `insertProbe`，否则每次 Apply 叠一层
   （历史事故：#1 每 Apply +841 字符，永不收敛）。
6. **追加不替换**：一个包要覆盖 0.1.7 → 0.2.2 六个宿主版本，靠的就是 pattern 数组。
7. **命不中要能安全地「不命中」**：`optional` / `naWhenUnmatched` / `strictFiles` 三选一，别让一条
   失效补丁阻断整次 Apply（`--apply` 有 failed 就退出码 1）。
8. **替换产物必须是合法 JS/YAML**：宁可把整行连同缩进一起换，也不要只换半个表达式；
   换完就 `node --check`。

---

## 5. 五种形状变化 × 真实修法

### A. 改名（错误类型 / 文案）

```diff
- if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) throw new Error(`sandbox escalation to "…" mode`);
+ if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode)) throw new SandboxEscalationError(`sandbox escalation to "…" mode`, "SANDBOX_ESCALATION_INVALID_ARGUMENT");
```

改法：整行抄成新 pattern，`replace` 不变（仍把这段换成注释）。
注意同一条补丁里三处 throw 往往是**一起**换的，pattern 要连着写三段。

### B. 合并 / 拆分

`editIntent` + `deleteIntent` 在 0.2.2 里都变成 `return this.requirePresent(target, actor, "edit"|"delete")`。

改法：**改真正干活的那个函数**（`requirePresent`），一处放行两条路径；顺带把 marker 改成前缀。
收益：少一半 pattern，宿主再拆也不会同时失配两处。

### C. 分支被删 / 新增

`tools/post-execute` 里原来有 `if (downstream.kind === "block") return {…}`，0.2.2 删了。

改法：追加一条 **accept-only** pattern（照 actual 原样抄），老的 block 版继续留着。

### D. 搬家 / 包拆分

`serviceAsk` 搬到 `dsh-tools/lib/pipeline.js`；PTC 执行器搬成独立包 `dsh-tool-executor-ptc`。

改法：`targetFiles` 加键/加候选路径。**运行入口排最前**：`lib/index.js` 只 `export`，
真正跑的是 `lib/pipeline.js`（我曾只补了 types 副本，对运行行为零影响 —— 这是典型的假修复）。

### E. 结构彻底消失

`isRewindMarker` / `rewindVisibleEntries` 在 0.2.2 的会话客户端里完全没有（`grep` 0 命中）。

改法：**不要硬造 pattern**，标 `naWhenUnmatched: true`，让它报 `na` 而不是 `skipped`。
搞清楚上游是不是把功能改了实现方式，再决定要不要按新结构重写。

---

## 6. 验收：什么叫「修好了」

| 检查 | 期望 |
| --- | --- |
| `diagnose-patch.mjs` | 目标补丁从 `pending` → `applied`（未应用时是 `pending` 且 `hits=1`） |
| `patchStatus()` 汇总 | `applied` 上升，`pending` 归零；`na` 数量应等于你明确标注的条数 |
| 干跑产物 `node --check` | 全部通过 |
| `check-upstream-ports.mjs` | 28 PASS / 0 FAIL |
| `check-update-transactions.mjs` 等 | ALL PASS（改到 `reapply/update` 时必跑） |
| 面板「应用」 | 成功 → 自动重启一次 → 新开一轮对话注入生效 |

**状态断言参考值（0.2.2-rc.1 / desktop / 1.2.4）**：
`applied 70 / pending 5 / na 10`，应用后 `applied 75 / pending 0 / na 10`。
换宿主版本后这组数字会变，用 `--all` 看全量即可。

---

## 7. 发版 checklist

```text
[ ] package.json  version / dshTarget / dshTargets
[ ] release-notes.md  以 "# <版本>" 开头，中英双段（发布脚本会校验）
[ ] node scripts/export-patch-table.mjs      （规格表指纹更新）
[ ] node scripts/diagnose-patch.mjs          （pending 归零）
[ ] node scripts/check-*.mjs                 （全 PASS）
[ ] README 实测数字 / 安装 URL
[ ] git tag v<版本> && node scripts/publish-release.mjs   （zip + tar.gz + SHA256SUMS）
```

---

## 8. 已知搬家史（照着这张表查最快）

| 时间点 | 变化 |
| --- | --- |
| 0.1.7 | `WORKSPACE_CONTEXT_INTRO` → `AGENT_INSTRUCTIONS_INTRO`；身份进 `personaPrefix` 折叠段 |
| 0.2.0 | Anthropic OAuth 不再插 Claude Code 首段 system prompt（#47/#49） |
| 0.2.2 | `serviceAsk` → `dsh-tools/lib/pipeline.js`；PTC 执行器 → 独立包 `dsh-tool-executor-ptc`；交付物提示词 → `dsh-deliverable-file-references`；`editIntent/deleteIntent` → `requirePresent`；`post-execute` 删 `block` 分支；抛错统一成 `*Error(msg, CODE)`；桌面壳 `#region` 顺序变化 |
| 待观察 | 每次升级先跑 `diagnose --all`，把新分歧记到这张表里，下次更快 |

---

## 9. 排错顺序（症状 → 先看什么）

| 症状 | 先检查 |
| --- | --- |
| 注入完全不生效 | ① `ai_base` 是否选对 ② `patchStatus` 是否 applied ③ `%TEMP%\dsh-purge-desktop.log` 里的 `guard.wrap` ④ 预设是否 `complete: true`（#40） |
| 第一轮正常、第二轮 `gateway/internal` | #66/#67/#68 是否 applied（`decision.messages` / `section.text` / `system.nodes.content` 兜底） |
| 「只截取了部分」 | 注入被宿主按 token 预算裁掉：确认 `dsh-purge` 段 order=-100000、`stripMnemon`、#19/#22 |
| 重启后注入没了 | 预设的 `complete` 覆盖了段（#40），或 `prompt-inject.md` 被判成「用户手改」不再更新（看 `override-state.json` 的 `customized`） |
| 桌面点应用没反应 | `app.asar` 是否 sealed（看 `unpacked-asar.json`）；`operations/<id>/journal.json` 的 `phase` |
| 应用后宿主起不来 | 按 `journal.json` 回滚：`failed` 阶段会列出已改文件；`.dshpurge.bak` 可直接覆盖回去 |
| 状态一会儿 applied 一会儿 pending | 戳不一致：`installed-rev` / `applied.json` 的 `sha` 与 `version`（1.2.4 起有 `syncDistStamp()` 归一） |

---

## 10. 工具与脚本清单

| 命令 | 用途 |
| --- | --- |
| `node bin/dsh-purge.js --status --json` | 状态（含 `ai_base` / 戳 / 补丁表） |
| `node bin/dsh-purge.js --doctor --json` | 体检（Node、SQLite、宿主版本、包解析） |
| `node bin/dsh-purge.js --apply / --revert` | 应用 / 还原（CLI 不自动重启） |
| `node scripts/diagnose-patch.mjs` | **失配定位**（本手册主工具） |
| `node scripts/export-patch-table.mjs` | 生成 `docs/reference/patch-spec.md` |
| `node scripts/check-upstream-ports.mjs` | 形状/幂等回归（28 项） |
| `node scripts/check-update-transactions.mjs` | 更新事务回归（20 组） |
| `node scripts/check-evidence-rewind.mjs` | 回退回归（10 组） |
| `node scripts/check-community-update.mjs` | 更新链回归（6 组） |
| `node scripts/publish-release.mjs` | 发版（zip + tar.gz + SHA256SUMS） |

---

## 附：一条命令的「升级后自查」

```powershell
cd <repo>
node scripts/diagnose-patch.mjs --all `
  | Tee-Object -FilePath work\diag-$(Get-Date -f yyyyMMdd).txt
```

看最后一行 `共 N 条需要处理`。`N = 0` 就什么都不用做；否则按 §3 走一遍，通常一小时内能收干净
（0.2.2 那次是 5 条形状变化，逐条对着宿主源码改，全程约 40 分钟）。
