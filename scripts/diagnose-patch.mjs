#!/usr/bin/env node
/**
 * 补丁失配诊断器 —— 宿主升级后，用它定位「哪条补丁、哪个文件、差第几个字符」。
 *
 *   node scripts/diagnose-patch.mjs                  # 只看没打上的（applied 以外）
 *   node scripts/diagnose-patch.mjs --all            # 85 条全跑
 *   node scripts/diagnose-patch.mjs --id 62,18       # 指定补丁
 *   node scripts/diagnose-patch.mjs --base DIR       # 指定宿主 @deepseek-ai 目录
 *   node scripts/diagnose-patch.mjs --surface web
 *   node scripts/diagnose-patch.mjs --json           # 机器可读（给脚本/CI 用）
 *
 * 只读：不写宿主、不备份、不改任何文件。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../lib/core.js";

const ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function arg(name, fallback = "") {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : "";
}
const has = (name) => process.argv.includes(name);

const wantAll = has("--all");
const wantJson = has("--json");
const wantIds = arg("--id").split(",").map((v) => Number(v.trim())).filter((v) => Number.isFinite(v) && v > 0);
const surface = arg("--surface", "desktop");
const wantBase = arg("--base") || process.env.DSH_BASE || "";

/* ── ai_base 解析（同 export-patch-table：不要用 findAiBase，会选到 npm 那份） ── */
const candidates = (() => {
  try { return core.enumeratePatchAiBases() || []; } catch { return []; }
})();
const isDesktopPath = (p) => /DeepSeek Harness[\\/]resources[\\/]app[\\/]/i.test(p);
const aiBase =
  wantBase ||
  (surface === "desktop" ? candidates.find(isDesktopPath) || candidates[0] : candidates.find((p) => !isDesktopPath(p)) || candidates[0]) ||
  "";

if (!aiBase) {
  console.error("未定位到宿主 @deepseek-ai 目录。用 --base 指定，例如：");
  console.error('  node scripts/diagnose-patch.mjs --base "C:\\…\\DeepSeek Harness\\resources\\app\\dsh\\node_modules\\@deepseek-ai"');
  process.exit(2);
}

const files = core.targetFiles(aiBase, undefined, surface);
const keysOf = (p) => (Array.isArray(p.file) ? p.file : [p.file]);
const pathsOf = (key) => {
  const v = files[key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

/* ── 命中数 ── */
function hitsOf(text, pattern) {
  if (pattern instanceof RegExp) {
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    return (text.match(re) || []).length;
  }
  const needle = String(pattern);
  if (!needle) return 0;
  return text.split(needle).length - 1;
}

/** pattern 前 N 字符在文本里找锚点；逐级缩短，命中即返回位置。
 *  去掉前导空白再探，否则「三个空格」这种前缀会命中一大片无关行。 */
function probe(text, pattern) {
  if (pattern instanceof RegExp) return null;
  const needle = String(pattern);
  const body = needle.replace(/^[ \t]+/, "");
  const lead = needle.length - body.length;
  for (let len = Math.min(160, body.length); len >= 16; len -= 4) {
    const at = text.indexOf(body.slice(0, len));
    if (at >= 0) return { at: Math.max(0, at - lead), len };
  }
  return null;
}

/** 打印 pattern 与宿主文本在锚点处的首个分歧。 */
function divergence(text, pattern, at) {
  const needle = String(pattern);
  const actual = text.slice(at, at + needle.length + 120);
  let i = 0;
  while (i < needle.length && needle[i] === actual[i]) i += 1;
  const around = (s, from) => JSON.stringify(s.slice(Math.max(0, from - 20), from + 120));
  return {
    offset: i,
    pattern: around(needle, i),
    actual: around(actual, i),
    line: text.slice(0, at).split("\n").length,
  };
}

const patches = core.ALL_PATCHES.filter((p) => {
  if (wantIds.length) return wantIds.includes(p.id);
  if (wantAll) return true;
  return true; // 先都算，最后按状态过滤
});
let statusMap = {};
try {
  statusMap = await core.patchStatus(aiBase, core.ALL_PATCHES, surface);
} catch { /* 状态拿不到就按即时诊断结果判断 */ }

const rows = [];
for (const p of patches) {
  const status = statusMap[p.id] || "-";
  if (!wantIds.length && !wantAll && status === "applied") continue;
  const row = { id: p.id, name: p.name, layer: p.layer_en, status, files: [] };
  for (const key of keysOf(p)) {
    const list = pathsOf(key);
    if (list.length === 0) {
      row.files.push({ key, file: "(missing)", missing: true, reps: [] });
      continue;
    }
    for (const fp of list) {
      let text = "";
      try { text = fs.readFileSync(fp, "utf8"); } catch { continue; }
      const lf = text.replace(/\r\n/g, "\n");
      const out = core.applyReplacementsToText(text, p, fp);
      const entry = {
        key,
        file: fp,
        changed: Boolean(out.changed),
        hitMismatch: out.hitMismatch || null,
        markers: (p.markers || []).map((m) => ({ text: m, hit: lf.includes(m) })),
        reps: [],
      };
      for (const [i, rep] of (p.replacements || []).entries()) {
        const h = hitsOf(lf, rep.pattern);
        const item = { index: i, hits: h, expect: rep.expect ?? null, kind: rep.pattern instanceof RegExp ? "regex" : "string" };
        if (h === 0) {
          const at = probe(lf, rep.pattern);
          if (at) item.divergence = divergence(lf, rep.pattern, at.at);
        }
        entry.reps.push(item);
      }
      row.files.push(entry);
    }
  }
  rows.push(row);
}

if (wantJson) {
  console.log(JSON.stringify({ aiBase, surface, rows }, null, 2));
  process.exit(0);
}

/* ── 人读输出 ── */
console.log(`宿主 ai_base : ${aiBase}`);
console.log(`宿主面       : ${surface}`);
console.log(`状态汇总     : ${Object.entries(
  Object.values(statusMap).reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {}),
).map(([k, v]) => `${k}=${v}`).join(" / ")}`);
console.log(`诊断对象     : ${rows.length} 条${wantAll ? "（--all）" : wantIds.length ? "（--id）" : "（非 applied）"}`);
console.log("");

for (const row of rows) {
  console.log(`━━ #${row.id} ${row.name}  [${row.status}]  (${row.layer})`);
  for (const f of row.files) {
    if (f.missing) { console.log(`   ✗ 目标文件缺失（key=${f.key}）`); continue; }
    const rel = path.relative(aiBase, f.file);
    const markerTxt = f.markers.length ? f.markers.map((m) => `${m.hit ? "✓" : "✗"}marker`).join(" ") : "无 marker";
    console.log(`   ${f.changed ? "→ 可写" : "· 无改动"}  ${rel}  ${markerTxt}`);
    if (f.hitMismatch) console.log(`   ⚠ hitMismatch: 期望 ${f.hitMismatch.expected} 实际 ${f.hitMismatch.actual}（整条拒写）`);
    for (const r of f.reps) {
      const flag = r.hits > 0 ? "✓" : "✗";
      const expect = r.expect === null ? "" : `  expect=${r.expect}`;
      console.log(`     rep[${r.index}] ${r.kind} ${flag} hits=${r.hits}${expect}`);
      if (r.divergence) {
        const d = r.divergence;
        console.log(`        锚点在宿主第 ${d.line} 行，第 ${d.offset} 个字符开始分歧：`);
        console.log(`          pattern: ${d.pattern}`);
        console.log(`          actual : ${d.actual}`);
      } else if (r.hits === 0 && r.kind === "regex") {
        console.log(`        （正则无法做锚点探测：用 source 里的稳定片段直接 grep 宿主文件）`);
      }
    }
  }
  console.log("");
}

const failing = rows.filter((r) => r.status !== "applied" && r.status !== "na");
if (failing.length) {
  console.log(`共 ${failing.length} 条需要处理。处理流程见 docs/maintaining.md。`);
} else {
  console.log("没有待处理的补丁。");
}
