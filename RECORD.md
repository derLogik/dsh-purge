# 版本 / 来源 / 安装记录

> 记录时间：2026-11-15
> 宿主：DeepSeek Harness **0.2.2-rc.1**（Desktop，profile `desktop`）
> 本仓库：`derLogik/dsh-purge`

## 一、我的这份

| 项 | 值 |
|---|---|
| fork 自 | `realMisakaMikoto/dsh-purge` |
| 当前 HEAD | `ec54afb` |
| version | **1.2.4** |
| dshTarget | **0.2.2-rc.1** |
| 已发布 release tag | `v1.2.3`（1.2.4 未打 tag） |
| 本地开发副本 | `~/.dsh/plugins/dsh-purge` |
| 本地运行副本 | `~/.dsh/profiles/desktop/node_modules/dsh-purge` |
| 运行版本 | **1.2.3 → 待升 1.2.4** |

1.2.3 → 1.2.4 的两个 commit 是关键：

```
d7e362e  fix: 0.2.2 上五条补丁恒 skipped 修到 applied
a90bd3b  release: 1.2.4 — 补丁补齐 + 发布链补 tar.gz
```

改动集中在 `lib/core.js`（+157 行）、`lib/reapply.js`（+39 行）。运行环境如果还停在 1.2.3，那 5 条补丁点就是白丢的。

## 二、上游四条线（社区现状）

| 仓库 | 最新版本 | 时间 | 状态 | dshTarget |
|---|---|---|---|---|
| `YuJunZhiXue/dsh-purge` | — | — | **原仓库，已停更（作者弃坑）** | 旧 |
| `realMisakaMikoto/dsh-purge` | v1.2.3 release / master 1.2.4 | 2026-11-10 / 11-14 | 我的 fork 源，仍在推进 0.2.2 兼容 | 0.2.2-rc.1 |
| `kingcharleslzy-ai/dsh-purge`（`dsh-purge-community`） | **1.7.14** | 2026-11-13 | **社区接手维护，最活跃**，下载 1.7 万次 | 0.2.1-rc.1 |
| `derLogik/dsh-purge` | 1.2.4 (`ec54afb`) | 2026-11-15 | **本仓库** | 0.2.2-rc.1 |

社区版说明：原名 `dsh-purge` 因 Anthropic/DeepSeek 命名或仓库归属问题不可用后，由 `kingcharleslzy-ai` 接手，包名改为 `dsh-purge-community`，版本号跳到 1.7.x（两段补丁号），补丁数扩到 **86 条** + 25 层状态自检 + 侧栏整页设置。发布产物：`dsh-purge-community-1.7.14.tgz`（2.2 MB）。

**但它只声明 `dshTarget: 0.2.1-rc.1`，而本机跑 0.2.2-rc.1。** 跨 rc 升级宿主补丁普遍需要重新对齐 pattern，直接换上去大概率大面积 skipped。所以本仓库继续走 `realMisakaMikoto` 的 0.2.2 线。

## 三、为什么 `dsh` CLI 装不了

```
$ dsh plugin --profile desktop add <spec>
error: profile "desktop" is managed exclusively by the Electron application
```

守卫位置：`resources/app/dsh/node_modules/@deepseek-ai/dsh/lib/bin-*.js` 第 35 行

```js
function rejectElectronProfile(program, profile) {
  if (profile.toLowerCase() === "desktop")
    program.error('error: profile "desktop" is managed exclusively by the Electron application');
}
```

结论：**只要 profile 名叫 `desktop`，CLI 一律拒绝，没有 flag、没有 env 可绕。** 连 `dsh plugin --profile desktop list` 都报同一句。

对照实测：
- `dsh plugin --profile web add <tgz>` → 成功，`dsh-purge 1.2.3 → 1.2.4`
- `dsh plugin --profile purgebuild add <tgz>` → 自动初始化新 profile 并装成功

## 四、手工安装（实测可行）

desktop profile 是 `nodeLinker: hoisted`，`node_modules/dsh-purge` 是普通实目录而不是 symlink，所以可以直接用 pnpm 操作 —— 守卫只在 dsh CLI 那一层。

### 方法 A：在 profile 目录直接跑 pnpm（推荐）

```powershell
$b = "$env:USERPROFILE\.dsh\profiles\desktop"
Copy-Item "$b\package.json" "$b\package.json.bak" -Force
Copy-Item "$b\pnpm-lock.yaml" "$b\pnpm-lock.yaml.bak" -Force

Push-Location $b
pnpm add "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
Pop-Location
```

pnpm 自己处理依赖解析、peer、lockfile，产物和 GUI 装出来的完全一致。

### 方法 B：用临时 profile 编译，再搬产物

```powershell
dsh plugin --profile purgebuild add "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
robocopy "$env:USERPROFILE\.dsh\profiles\purgebuild\node_modules\dsh-purge" `
         "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-purge" /MIR
```

### 方法 C：纯手工解压（无 pnpm 可用时）

```powershell
Invoke-WebRequest "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz" -OutFile "$env:TEMP\p.tgz"
tar --force-local -xzf "$env:TEMP\p.tgz" -C "$env:TEMP"      # Windows 上必须 --force-local
robocopy "$env:TEMP\dsh-purge-master" "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-purge" /MIR
```

注意 GNU tar 在 Windows 上会把 `C:\...` 的盘符冒号当远程主机名，`--force-local` 是必须的。

### 装完必须确认的三处接线

**1. `package.json` → `dependencies`**

```jsonc
"dsh-purge": "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
```
指向本地 `file:` 或旧 tag，下次 pnpm install 会把你手装的版本换回去。

**2. `package.json` → `dsh.profile.bundles`**

```jsonc
"bundles": [ ..., "dsh-purge" ]   // 少这一行，装完也不加载
```

**3. `cordis.patch.yml`**

```yaml
- id: dsh-purge
  disabled: true              # 禁掉 bundle 自带默认条目

- insert:
    - id: dsh-purge
      name: dsh-purge
      inject: [ systemPrompt, tools ]
      config:
        enabled: true
        stripMnemon: true
        capabilityProtocol: true
        hooksDenyBypass: true

- id: dsh-purge-redteam
  disabled: true
- id: dsh-purge-redteam-store
  disabled: true
- id: dsh-purge-redteam-ui
  disabled: true
```

### 验证（无 agent 时只能读文件）

```powershell
# 版本
(Get-Content "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-purge\package.json" -Raw | ConvertFrom-Json).version
# bundles
(Get-Content "$env:USERPROFILE\.dsh\profiles\desktop\package.json" -Raw | ConvertFrom-Json).dsh.profile.bundles -contains 'dsh-purge'
# 补丁接线
Select-String -Path "$env:USERPROFILE\.dsh\profiles\desktop\cordis.patch.yml" -Pattern "id: dsh-purge" -Context 1,1
```

### 回滚

```powershell
$p = "$env:USERPROFILE\.dsh\profiles"
Remove-Item "$p\desktop" -Recurse -Force
Move-Item "$p\desktop.bak-<时间戳>" "$p\desktop"
```

已有回滚点：`desktop.bak-20261025`、`backup-20261103-1005`、`backup-before-dsh-purge-20261114`。

## 五、备份

打包时间 2026-11-15 12:03，位置 `C:\Users\lians\work\dsh-purge-backup\20261115-120334\`

| 文件 | 大小 | 内容 |
|---|---|---|
| `dsh-purge-git-1.2.4.tar.gz` | 4.71 MB | git 副本含 `.git`，1.2.4 |
| `dsh-purge-runtime-1.2.3.tar.gz` | 1.73 MB | 运行副本，1.2.3 |
| `profile-wiring/package.json` | — | profile 依赖 + bundles |
| `profile-wiring/cordis.patch.yml` | — | 插件接线 |
| `profile-wiring/pnpm-lock.yaml` | 98 KB | 锁文件 |
| `profile-wiring/pnpm-workspace.yaml` | — | nodeLinker: hoisted |

另有 tarball `~/.dsh/plugins/dsh-purge/dsh-purge-1.2.4.tgz`（1.76 MB，132 个文件）。

## 六、宿主升级后怎么办

`docs/maintaining.md` 有完整流程。核心是三步：

```powershell
node scripts/diagnose-patch.mjs               # 只列没打上的
node scripts/diagnose-patch.mjs --id 62,18    # 定位具体补丁
node scripts/export-patch-table.mjs           # 导出 85 条完整规格对照
```

`docs/reference/patch-spec.md`（351 KB）是全部补丁的 pattern/replace 原文，宿主升级后可以直接 diff 找失配点。
