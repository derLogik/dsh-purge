# 下次装了 DSH 之后，怎么把 dsh-purge 装上

> 适用：全新机器 / 重装 DSH Desktop / 换了系统。
> 前提：DSH **0.2.2-rc.1**（换版本先看本文最后一节）。

## 为什么不能 `dsh plugin add`

`dsh` CLI 里有一道硬守卫，`@deepseek-ai/dsh/lib/bin-*.js`：

```js
function rejectElectronProfile(program, profile) {
  if (profile.toLowerCase() === "desktop")
    program.error('error: profile "desktop" is managed exclusively by the Electron application');
}
```

profile 名叫 `desktop` 就一律拒绝，`add` / `list` / 任何子命令都一样。没有 flag、没有 env 可绕。

**这道守卫只在 `dsh` 这一个 CLI 上，pnpm 本身不受限。** 所以装法是绕过 CLI，直接对 profile 目录跑 pnpm。

## 一条命令

装完 DSH Desktop 后：

```powershell
# 1. 启动一次 DSH，让它创建 ~/.dsh/profiles/desktop，然后完全退出（含托盘）

# 2. 跑安装器（不用 clone 仓库）
Invoke-WebRequest "https://raw.githubusercontent.com/derLogik/dsh-purge/master/scripts/install.mjs" -OutFile "$env:TEMP\install-purge.mjs"
node "$env:TEMP\install-purge.mjs"

# 3. 重新启动 DSH
```

安装器会做完这 5 步并逐条报告：

1. 校验 profile 存在、读宿主 `dsh --version` 和 `pnpm --version`
2. 备份 `package.json` / `pnpm-lock.yaml` / `cordis.patch.yml`
3. 在 profile 目录跑 `pnpm add <source>`
4. 补 `dsh.profile.bundles` 的 `dsh-purge` 项、把 `dependencies` 的 spec 指向本次 source
5. 补 `cordis.patch.yml` 的 `insert` 条目（已有则跳过，幂等）

常用参数：

```powershell
node "$env:TEMP\install-purge.mjs" --dry-run               # 只看计划
node "$env:TEMP\install-purge.mjs" --profile web           # 装到别的 profile
node "$env:TEMP\install-purge.mjs" --source <url|本地tgz>  # 指定源
node "$env:TEMP\install-purge.mjs" --force                 # 已装同版本也重装
```

## 脚本不可用时：三条手动路

### A. 直接跑 pnpm（最快）

```powershell
$b = "$env:USERPROFILE\.dsh\profiles\desktop"
Copy-Item "$b\package.json" "$b\package.json.bak" -Force

Push-Location $b
pnpm add "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
Pop-Location
```

### B. 拿一个不被守卫的 profile 编译，再搬产物

```powershell
dsh plugin --profile purgebuild add "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
robocopy "$env:USERPROFILE\.dsh\profiles\purgebuild\node_modules\dsh-purge" `
         "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-purge" /MIR
Remove-Item "$env:USERPROFILE\.dsh\profiles\purgebuild" -Recurse -Force
```

### C. 纯解压（没有 pnpm 时）

```powershell
Invoke-WebRequest "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz" -OutFile "$env:TEMP\p.tgz"
tar --force-local -xzf "$env:TEMP\p.tgz" -C "$env:TEMP"
robocopy "$env:TEMP\dsh-purge-master" "$env:USERPROFILE\.dsh\profiles\desktop\node_modules\dsh-purge" /MIR
```

`--force-local` 不能省：Windows 上 GNU tar 会把 `C:\` 的盘符冒号当成远程主机名，报 `Cannot connect to C: resolve failed`。

## 装完必须成立的三处

缺任何一处，插件装了也不加载或会被换回去。

**1. `package.json` → `dependencies`**

```jsonc
"dsh-purge": "https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz"
```

**2. `package.json` → `dsh.profile.bundles`**

```jsonc
"bundles": [ ..., "dsh-purge" ]
```

**3. `cordis.patch.yml`**

```yaml
- id: dsh-purge
  disabled: true

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

## 验证（重启后）

```powershell
$b = "$env:USERPROFILE\.dsh\profiles\desktop"

# 版本，期望 1.2.4
(Get-Content "$b\node_modules\dsh-purge\package.json" -Raw | ConvertFrom-Json).version

# bundles 里有
(Get-Content "$b\package.json" -Raw | ConvertFrom-Json).dsh.profile.bundles -contains 'dsh-purge'

# patch 接线在
Select-String -Path "$b\cordis.patch.yml" -Pattern "id: dsh-purge" -Context 1,1
```

再看补丁命中率：让 agent 调 `purge_status`，或读 DSH 侧栏 purge 面板。1.2.4 在 0.2.2-rc.1 上期望 **65/69 applied**（1.2.3 是 60/69，1.2.4 修了 5 条恒 skipped）。

## 升级

```powershell
node "$env:TEMP\install-purge.mjs"
```

指向 `master` 的 source 每次都会拉最新 commit。要锁版本就 `--source <tag tarball url>`。

## 回滚

```powershell
$b = "$env:USERPROFILE\.dsh\profiles\desktop"
# 安装器留下的备份
Get-ChildItem $b -Filter "*.bak-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 3

Copy-Item "$b\package.json.bak-<stamp>" "$b\package.json" -Force
Copy-Item "$b\cordis.patch.yml.bak-<stamp>" "$b\cordis.patch.yml" -Force
Copy-Item "$b\pnpm-lock.yaml.bak-<stamp>" "$b\pnpm-lock.yaml" -Force

Push-Location $b; pnpm install; Pop-Location
```

整目录回滚点（重装 DSH 前手动留）：

```powershell
Copy-Item "$env:USERPROFILE\.dsh\profiles\desktop" "$env:USERPROFILE\.dsh\profiles\desktop.bak-$(Get-Date -f yyyyMMdd-HHmm)" -Recurse
```

## 宿主换版本时

`dsh-purge 1.2.4` 的 `dshTarget` 是 **0.2.2-rc.1**。宿主升到 0.2.3+ 后补丁 pattern 大概率失配，流程是：

```powershell
node scripts/diagnose-patch.mjs               # 列出没打上的
node scripts/diagnose-patch.mjs --id 62,18    # 定位具体补丁
node scripts/export-patch-table.mjs           # 导出 85 条完整规格对照
```

`docs/reference/patch-spec.md` 是全部补丁的 pattern/replace 原文，可以直接 diff 找失配点。维护流程见 `docs/maintaining.md`。

社区版 `kingcharleslzy-ai/dsh-purge-community`（1.7.14，86 条补丁）只声明 `dshTarget: 0.2.1-rc.1`，跨 rc 换上去要重新对齐，不能直接当备份用。
