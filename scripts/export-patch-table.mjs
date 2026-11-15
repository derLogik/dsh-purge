#!/usr/bin/env node
/**
 * 把 ALL_PATCHES 导出成人可读的规格表（含每条 pattern / replace 原文）。
 *
 * 用途：core.js 里的补丁定义占 3 500+ 行，人读不动；导出成 markdown 之后可以直接 diff、
 * 可以在宿主升级后逐条对照、也可以整块搬进另一个实现里当 spec。
 *
 *   node scripts/export-patch-table.mjs                       # → docs/reference/patch-spec.md
 *   node scripts/export-patch-table.mjs --out x.md            # 自定义输出
 *   node scripts/export-patch-table.mjs --id 13,17,62         # 只导出指定补丁
 *   node scripts/export-patch-table.mjs --layer Code          # 只导出某一层
 *   node scripts/export-patch-table.mjs --surface desktop     # 按该宿主面解析目标路径
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import * as core from "../lib/core.js";

const ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function arg(name, fallback = "") {
  const i = process.argv.indexOf(name);
  if (i < 0) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : "";
}

const wantIds = arg("--id")
  .split(",")
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isFinite(v) && v > 0);
const wantLayer = arg("--layer");
const surface = arg("--surface", "desktop");
const wantBase = arg("--base");
const outFile = path.resolve(ROOT, arg("--out", "docs/reference/patch-spec.md"));

const all = core.ALL_PATCHES;
const patches = all.filter(
  (p) => (wantIds.length === 0 || wantIds.includes(p.id)) && (!wantLayer || p.layer_en === wantLayer),
);
if (patches.length === 0) {
  console.error("没有匹配的补丁（检查 --id / --layer）");
  process.exit(1);
}

const corePath = path.join(ROOT, "lib", "core.js");
const coreSha = createHash("sha256").update(fs.readFileSync(corePath)).digest("hex").slice(0, 12);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

/** 目标键 → 该宿主上的真实路径（只读，不改文件）。 */
function resolvedPaths(aiBase) {
  if (!aiBase) return {};
  try {
    return core.targetFiles(aiBase, core.findDshHome({ surface }), surface);
  } catch {
    return {};
  }
}
/**
 * 解析 ai_base。
 * 顺序：--base → DSH_BASE → 按宿主面从 enumeratePatchAiBases() 里挑。
 *
 * 不要用 findAiBase() / gatherState().ai_base：脱离宿主进程运行时（本脚本就是），
 * 它会把 npm 全局装的那份 dsh 当主宿主，而桌面端的代码在 resources/app/dsh 下 ——
 * 两份是不同快照，用错 base 会让整张状态列全错。
 */
const candidates = (() => {
  try {
    return core.enumeratePatchAiBases() || [];
  } catch {
    return [];
  }
})();
const aiBase = await (async () => {
  const explicit = wantBase || process.env.DSH_BASE || "";
  if (explicit) return explicit;
  const isDesktopPath = (p) => /DeepSeek Harness[\\/]resources[\\/]app[\\/]/i.test(p);
  const preferred = surface === "desktop"
    ? candidates.find(isDesktopPath) || candidates[0]
    : candidates.find((p) => !isDesktopPath(p)) || candidates[0];
  return preferred || "";
})();
const files = resolvedPaths(aiBase);
const pathsOf = (key) => {
  const v = files[key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

const flagsOf = (p) => {
  const out = [];
  for (const flag of ["optional", "strictFiles", "skipIfMarked", "markersAny", "naWhenUnmatched", "softSettle"]) {
    if (p[flag]) out.push(flag);
  }
  return out;
};

/** 把字符串渲染成「真实字符」：\n / \t 展开，方便人眼对照宿主源码。 */
const render = (value) => String(value ?? "").replace(/\\r\\n/g, "\n");

const stats = { applied: 0, pending: 0, skipped: 0, na: 0, missing: 0 };
let statusMap = {};
try {
  statusMap = aiBase ? await core.patchStatus(aiBase, all, surface) : {};
} catch {
  statusMap = {};
}

const lines = [];
lines.push("# dsh-purge 补丁规格表（自动生成）", "");
lines.push("> 本文件由 `scripts/export-patch-table.mjs` 生成，**不要手改**；改完 `lib/core.js` 重新生成即可。", "");
lines.push("| 项 | 值 |", "| --- | --- |");
lines.push(`| 插件版本 | \`dsh-purge ${pkg.version}\` |`);
lines.push(`| 生成时间 | ${new Date().toISOString()} |`);
lines.push(`| \`lib/core.js\` 指纹 | \`${coreSha}\` |`);
lines.push(`| 补丁数 | ${patches.length} / ${all.length} |`);
lines.push(`| 目标宿主面 | \`${surface}\`${aiBase ? `（\`ai_base\` = \`${aiBase}\`）` : "（未定位到宿主，路径列留空）"} |`);
lines.push("");lines.push("字段含义见 `docs/technical-report.md` §5.1；宿主升级后的改法见 `docs/maintaining.md`。", "");

// 索引
lines.push("## 索引", "");
lines.push("| id | 名称 | 层 | 目标键 | 当前状态 |", "| ---: | --- | --- | --- | --- |");
for (const p of patches) {
  const st = statusMap[p.id] || "-";
  if (st === "applied") stats.applied += 1;
  else if (st === "pending") stats.pending += 1;
  else if (st === "na") stats.na += 1;
  else if (st === "missing_file") stats.missing += 1;
  else stats.skipped += 1;
  const keys = Array.isArray(p.file) ? p.file.join(", ") : p.file;
  lines.push(`| ${p.id} | [${p.name}](#${p.id}-${p.name.toLowerCase().replace(/_/g, "-")}) | ${p.layer_en} | \`${keys}\` | \`${st}\` |`);
}
lines.push("");
lines.push(`当前状态汇总：applied ${stats.applied} / pending ${stats.pending} / skipped·其他 ${stats.skipped} / na ${stats.na} / missing_file ${stats.missing}`, "");

// 明细
for (const p of patches) {
  const keys = Array.isArray(p.file) ? p.file : [p.file];
  lines.push("---", "", `## ${p.id} ${p.name}`, "");
  lines.push(`> ${p.desc || "（无说明）"}`, "");
  lines.push("| 项 | 值 |", "| --- | --- |");
  lines.push(`| 层 | \`${p.layer}\` / \`${p.layer_en}\` |`);
  lines.push(`| 目标键 | ${keys.map((k) => `\`${k}\``).join("、")} |`);
  const flags = flagsOf(p);
  if (flags.length) lines.push(`| 标记 | ${flags.map((f) => `\`${f}\``).join("、")} |`);
  if (p.surfaces) lines.push(`| 限定宿主面 | ${p.surfaces.map((s) => `\`${s}\``).join("、")} |`);
  lines.push(`| 当前状态 | \`${statusMap[p.id] || "-"}\` |`);
  lines.push("");
  for (const key of keys) {
    const list = pathsOf(key);
    lines.push(`**目标路径（\`${key}\`）**`, "");
    if (list.length === 0) lines.push("- （本机未解析到）");
    for (const fp of list) lines.push(`- \`${fp}\``);
    lines.push("");
  }
  if (Array.isArray(p.markers) && p.markers.length) {
    lines.push("**markers**（完成判据" + (p.markersAny ? "，任一命中即完成" : "，全部命中才算完成") + "）", "");
    for (const m of p.markers) lines.push(`- \`${m}\``);
    lines.push("");
  }
  const reps = Array.isArray(p.replacements) ? p.replacements : null;
  if (!reps) {
    // 只有 patterns/replace 的短形态（如 #6）
    lines.push("**patterns / replace**", "");
    const pats = Array.isArray(p.patterns) ? p.patterns : p.pattern ? [p.pattern] : [];
    for (const pat of pats) {
      lines.push("```text", render(pat), "```", "");
    }
    if (typeof p.replace === "string") lines.push("替换为：", "", "```text", render(p.replace), "```", "");
  } else {
    reps.forEach((rep, i) => {
      lines.push(`### replacements[${i}]`, "");
      if (rep.expect !== undefined) lines.push(`- \`expect\`: **${rep.expect}**（命中数不符 → 整条拒写）`);
      if (rep.insertProbe) lines.push(`- \`insertProbe\`: \`${rep.insertProbe}\`（产物已含则跳过）`);
      if (rep.expect !== undefined || rep.insertProbe) lines.push("");
      lines.push("**pattern（渲染形态，`\\t`/`\\n` 已展开）**", "", "```text", render(rep.pattern), "```", "");
      lines.push("**replace（渲染形态）**", "", "```text", render(rep.replace), "```", "");
      lines.push("**粘回 core.js 用（JSON 字符串，可直接 `JSON.parse`）**", "", "```json", JSON.stringify(String(rep.pattern ?? "")), "```", "");
      lines.push("", "```json", JSON.stringify(String(rep.replace ?? "")), "```", "");
      lines.push("");
    });
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const body = lines.join("\n") + "\n";
fs.writeFileSync(outFile, body, "utf8");
console.log(`写出 ${path.relative(ROOT, outFile)}（${patches.length} 条，${Math.round(body.length / 1024)} KB）`);
console.log(
  `状态：applied ${stats.applied} / pending ${stats.pending} / skipped·其他 ${stats.skipped} / na ${stats.na} / missing_file ${stats.missing}`,
);
if (!aiBase) console.log("提示：未定位到宿主 ai_base，路径列留空（用 --surface 或设 DSH_BASE/DSH_HOME 可补全）");
