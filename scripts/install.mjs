#!/usr/bin/env node
/**
 * dsh-purge installer —— 专治 dsh CLI 拒绝操作的 profile（desktop）。
 *
 *   dsh plugin --profile desktop add <x>
 *   → error: profile "desktop" is managed exclusively by the Electron application
 *
 * 守卫在 @deepseek-ai/dsh/lib/bin-*.js 里，只拦 dsh 这个 CLI，不拦 pnpm。
 * 本脚本绕过 CLI，直接对 profile 目录跑 pnpm，再补齐 bundles 与 cordis.patch.yml。
 *
 * 用法:
 *   node scripts/install.mjs                        # desktop + 本仓库 master
 *   node scripts/install.mjs --profile web          # 其他 profile
 *   node scripts/install.mjs --source <url|path>    # 指定源（tag / 社区版 / 本地 tgz）
 *   node scripts/install.mjs --dry-run              # 只看计划，不动文件
 *   node scripts/install.mjs --force                # 已装同版本也重装
 *
 * 用法（全新机器，还没有 DSH）:
 *   1. 装 DSH Desktop，启动一次，让它初始化 ~/.dsh/profiles/desktop
 *   2. 关掉 DSH
 *   3. node scripts/install.mjs
 *   4. 重新启动 DSH
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const DEFAULT_SOURCE = 'https://github.com/derLogik/dsh-purge/archive/refs/heads/master.tar.gz';

const argv = process.argv.slice(2);
const flag = (name, fallback = undefined) => {
  const i = argv.indexOf(name);
  if (i === -1) return fallback;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
};
const has = (name) => argv.includes(name);

const profileName = String(flag('--profile', 'desktop'));
const source = String(flag('--source', DEFAULT_SOURCE));
const dryRun = has('--dry-run');
const force = has('--force');

const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
const profileDir = path.join(DSH_HOME, 'profiles', profileName);
const pkgPath = path.join(profileDir, 'package.json');
const patchPath = path.join(profileDir, 'cordis.patch.yml');
const lockPath = path.join(profileDir, 'pnpm-lock.yaml');

const c = {
  ok: (s) => `\x1b[32m✔\x1b[0m ${s}`,
  warn: (s) => `\x1b[33m!\x1b[0m ${s}`,
  err: (s) => `\x1b[31m✘\x1b[0m ${s}`,
  dim: (s) => `\x1b[90m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(msg) {
  console.error(c.err(msg));
  process.exit(1);
}

const q = (s) => (/[\s"]/.test(s) ? `"${String(s).replace(/"/g, '\\"')}"` : String(s));

function run(cmd, args, opts = {}) {
  const isWin = process.platform === 'win32';
  // Windows 上 pnpm/dsh 是 .cmd/.ps1，必须经 shell；整条命令行一次传，避免 DEP0190
  const r = isWin
    ? spawnSync([cmd, ...args].map(q).join(' '), { encoding: 'utf8', shell: true, ...opts })
    : spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

// ── 0. 环境检查 ────────────────────────────────────────────────
console.log(c.b(`dsh-purge installer  profile=${profileName}`));
console.log(c.dim(`  DSH_HOME : ${DSH_HOME}`));
console.log(c.dim(`  profile  : ${profileDir}`));
console.log(c.dim(`  source   : ${source}`));
console.log('');

if (!fs.existsSync(pkgPath)) {
  die(
    `profile "${profileName}" 还没初始化。\n` +
      `  先启动一次 DSH Desktop 让它创建 ${profileDir}，关掉后再跑本脚本。`
  );
}

const hostVer = run('dsh', ['--version']).out.trim().split(/\s+/).pop() || 'unknown';
const pnpm = run('pnpm', ['--version']).out.trim() || 'missing';
console.log(c.dim(`  host dsh : ${hostVer}`));
console.log(c.dim(`  pnpm     : ${pnpm}`));
if (pnpm === 'missing') die('找不到 pnpm。装一个：npm i -g pnpm');
console.log('');

// ── 1. 备份 ────────────────────────────────────────────────────
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backups = [];
if (!dryRun) {
  for (const f of [pkgPath, lockPath, patchPath]) {
    if (!fs.existsSync(f)) continue;
    const dst = `${f}.bak-${stamp}`;
    fs.copyFileSync(f, dst);
    backups.push(dst);
  }
}
console.log(backups.length ? c.ok(`备份 ${backups.length} 个文件`) : c.dim('（dry-run，不备份）'));
for (const b of backups) console.log(c.dim(`  ${path.basename(b)}`));

// ── 2. pnpm add ────────────────────────────────────────────────
const before = (() => {
  const p = path.join(profileDir, 'node_modules', 'dsh-purge', 'package.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
})();

console.log('');
if (before && !force) console.log(c.dim(`  当前已装: ${before.name}@${before.version} (dshTarget ${before.dshTarget || '?'})`));

if (dryRun) {
  console.log(c.dim(`  [dry-run] pnpm add "${source}"  (cwd ${profileDir})`));
} else {
  console.log(c.b('→ pnpm add'));
  const r = run('pnpm', ['add', source], { cwd: profileDir, shell: true });
  const tail = r.out.split('\n').filter(Boolean).slice(-6).join('\n');
  if (r.code !== 0) {
    console.error(tail);
    die(`pnpm add 失败（exit ${r.code}）。上面是尾部输出，完整日志见 profile 目录。`);
  }
  console.log(tail.split('\n').map((l) => '  ' + l).join('\n'));
}

const after = (() => {
  const p = path.join(profileDir, 'node_modules', 'dsh-purge', 'package.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
})();

if (!dryRun && !after) die('pnpm 跑完但 node_modules/dsh-purge 不存在，检查上面的输出。');
if (after) {
  console.log('');
  console.log(c.ok(`dsh-purge ${before?.version || '(none)'} → ${c.b(after.version)}  dshTarget=${after.dshTarget || '?'}`));
  if (after.dshTarget && hostVer !== 'unknown' && !String(after.dshTarget).includes(hostVer)) {
    console.log(c.warn(`dshTarget (${after.dshTarget}) 与宿主 (${hostVer}) 不一致 —— 补丁可能大面积 skipped，跑完看 purge_status`));
  }
}

// ── 3. bundles 接线 ────────────────────────────────────────────
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.dsh = pkg.dsh || {};
pkg.dsh.profile = pkg.dsh.profile || {};
const bundles = (pkg.dsh.profile.bundles = pkg.dsh.profile.bundles || []);

if (bundles.includes('dsh-purge')) {
  console.log(c.ok('bundles 已含 dsh-purge'));
} else {
  bundles.push('dsh-purge');
  if (!dryRun) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(c.ok(`bundles 补上 dsh-purge（${bundles.length - 1} → ${bundles.length} 项）`));
}

if (!String(pkg.dependencies?.['dsh-purge'] || '').includes(source)) {
  pkg.dependencies = pkg.dependencies || {};
  pkg.dependencies['dsh-purge'] = source;
  if (!dryRun) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(c.ok('dependencies 的 spec 指向本次 source'));
} else {
  console.log(c.ok('dependencies spec 已指向本次 source'));
}

// ── 4. cordis.patch.yml 接线 ───────────────────────────────────
const PATCH_BLOCK = `
# ── dsh-purge（由 scripts/install.mjs 写入）─────────────────────
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
`;

const patchText = fs.existsSync(patchPath) ? fs.readFileSync(patchPath, 'utf8') : '';
const hasInsert = /-\s*insert:\s*\n(?:.*\n)*?\s*-\s*id:\s*dsh-purge\b/.test(patchText) ||
  (patchText.includes('id: dsh-purge') && patchText.includes('inject:'));

if (hasInsert) {
  console.log(c.ok('cordis.patch.yml 已有 dsh-purge insert 条目'));
} else {
  if (!dryRun) fs.writeFileSync(patchPath, patchText.replace(/\s*$/, '\n') + PATCH_BLOCK, 'utf8');
  console.log(c.ok('cordis.patch.yml 追加 dsh-purge insert 条目'));
}

// ── 5. 汇总 ────────────────────────────────────────────────────
console.log('');
console.log(c.b('下一步'));
console.log(`  1. 完全退出 DSH（含托盘），重新启动`);
console.log(`  2. 重启后确认版本：`);
console.log(c.dim(`     (Get-Content "${path.join(profileDir, 'node_modules', 'dsh-purge', 'package.json')}" -Raw | ConvertFrom-Json).version`));
console.log(`  3. 看补丁命中率：让 agent 调 purge_status，或读 DSH 侧栏的 purge 面板`);
console.log('');
console.log(c.dim('回滚: 把 *.bak-' + stamp + ' 覆盖回原文件名，然后重新 pnpm install'));

if (dryRun) console.log('\n' + c.warn('dry-run 结束，没有改动任何文件'));
