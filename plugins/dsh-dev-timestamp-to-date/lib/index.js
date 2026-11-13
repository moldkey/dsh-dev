/**
 * 开发工具：时间戳转日期
 *
 * a=时区偏移，默认 8
 */

export const name = "dsh-dev-timestamp-to-date";

export const inject = ["tools"];

const NL = String.fromCharCode(10);
const BS = String.fromCharCode(92);
const QT = String.fromCharCode(34);

const TEXT_OUTPUT = {
  schema: {
    type: "object",
    additionalProperties: false,
    properties: { text: { type: "string" } },
    required: ["text"],
  },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

const TITLE = "开发工具：时间戳转日期";
const OP = "timestamp_to_date";
const SITE = "https://deepseekbase.com/zh/tools/";

const MIME = {
  html: "text/html", css: "text/css", js: "application/javascript", json: "application/json",
  xml: "application/xml", txt: "text/plain", csv: "text/csv", md: "text/markdown",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", pdf: "application/pdf",
  zip: "application/zip", gz: "application/gzip", mp3: "audio/mpeg", mp4: "video/mp4",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", wasm: "application/wasm"
};
const STATUS = {
  200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently",
  302: "Found", 304: "Not Modified", 400: "Bad Request", 401: "Unauthorized",
  403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 408: "Request Timeout",
  409: "Conflict", 410: "Gone", 413: "Payload Too Large", 429: "Too Many Requests",
  500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway",
  503: "Service Unavailable", 504: "Gateway Timeout"
};
const PORTS = {
  21: "ftp", 22: "ssh", 25: "smtp", 53: "dns", 80: "http", 110: "pop3", 143: "imap",
  443: "https", 465: "smtps", 587: "submission", 993: "imaps", 1433: "mssql",
  3306: "mysql", 5432: "postgres", 6379: "redis", 8080: "http-alt", 27017: "mongodb"
};

function parseJSON(t) {
  try { return { ok: true, v: JSON.parse(t) }; } catch (e) { return { ok: false, e: String(e.message || e) }; }
}
function sorted(v) {
  if (Array.isArray(v)) return v.map(sorted);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = sorted(v[k]);
    return o;
  }
  return v;
}
function flatten(v, prefix, out) {
  if (Array.isArray(v)) v.forEach((x, i) => flatten(x, prefix + "[" + i + "]", out));
  else if (v && typeof v === "object") { for (const k of Object.keys(v)) flatten(v[k], prefix ? prefix + "." + k : k, out); }
  else out.push(prefix + " = " + String(v));
  return out;
}
function toYaml(v, ind) {
  const pad = " ".repeat(ind || 0);
  if (Array.isArray(v)) return v.length ? v.map((x) => pad + "- " + (x && typeof x === "object" ? NL + toYaml(x, (ind || 0) + 2) : String(x))).join(NL) : pad + "[]";
  if (v && typeof v === "object") {
    const lines = [];
    for (const k of Object.keys(v)) {
      const x = v[k];
      if (x && typeof x === "object") lines.push(pad + k + ":" + NL + toYaml(x, (ind || 0) + 2));
      else lines.push(pad + k + ": " + String(x));
    }
    return lines.join(NL);
  }
  return pad + String(v);
}
function fromYaml(t) {
  const root = {};
  for (const raw of String(t).split(NL)) {
    const s = raw.trim();
    if (!s || s.startsWith("#")) continue;
    const i = s.indexOf(":");
    if (i > 0) root[s.slice(0, i).trim()] = s.slice(i + 1).trim();
  }
  return root;
}
function splitCSVLine(s) { return s.split(",").map((x) => x.trim().replace(/^"/, "").replace(/"$/, "")); }
function tsType(v) {
  if (Array.isArray(v)) return v.length ? tsType(v[0]) + "[]" : "unknown[]";
  if (v === null) return "null";
  if (typeof v === "object") return "object";
  return typeof v;
}
function pathGet(v, p) {
  let cur = v;
  const norm = String(p).split("[").join(".").split("]").join("");
  for (const k of norm.split(".")) {
    if (!k) continue;
    if (cur === null || cur === undefined) return undefined;
    cur = cur[k];
  }
  return cur;
}

const OPS = {
  json_format: (t) => { const r = parseJSON(t); return r.ok ? JSON.stringify(r.v, null, 2) : "JSON 无效: " + r.e; },
  json_minify: (t) => { const r = parseJSON(t); return r.ok ? JSON.stringify(r.v) : "JSON 无效: " + r.e; },
  json_sort_keys: (t) => { const r = parseJSON(t); return r.ok ? JSON.stringify(sorted(r.v), null, 2) : "JSON 无效: " + r.e; },
  json_validate: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "无效: " + r.e;
    const v = r.v;
    const kind = Array.isArray(v) ? "array" : (v === null ? "null" : typeof v);
    const n = Array.isArray(v) ? v.length : (v && typeof v === "object" ? Object.keys(v).length : 1);
    return "有效 JSON / 类型: " + kind + " / 顶层大小: " + n;
  },
  json_flatten: (t) => { const r = parseJSON(t); return r.ok ? flatten(r.v, "", []).join(NL) : "JSON 无效: " + r.e; },
  json_merge: (t, a) => {
    const r1 = parseJSON(t), r2 = parseJSON(a);
    if (!r1.ok) return "第一段 JSON 无效: " + r1.e;
    if (!r2.ok) return "第二段 JSON 无效（参数 a）: " + r2.e;
    const o1 = r1.v, o2 = r2.v;
    const bothObj = o1 && typeof o1 === "object" && !Array.isArray(o1) && o2 && typeof o2 === "object" && !Array.isArray(o2);
    return JSON.stringify(bothObj ? Object.assign({}, o1, o2) : [].concat(o1, o2), null, 2);
  },
  json_to_yaml: (t) => { const r = parseJSON(t); return r.ok ? toYaml(r.v, 0) : "JSON 无效: " + r.e; },
  yaml_to_json: (t) => JSON.stringify(fromYaml(t), null, 2),
  json_to_csv: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const arr = Array.isArray(r.v) ? r.v : [r.v];
    const keys = Array.from(new Set(arr.flatMap((o) => (o && typeof o === "object" ? Object.keys(o) : []))));
    const lines = [keys.join(",")];
    for (const o of arr) lines.push(keys.map((k) => QT + String(o[k] === undefined ? "" : o[k]).split(QT).join(QT + QT) + QT).join(","));
    return lines.join(NL);
  },
  csv_to_json: (t) => {
    const rows = String(t).split(NL).filter((x) => x.trim());
    if (!rows.length) return "[]";
    const head = splitCSVLine(rows[0]);
    const arr = rows.slice(1).map((r) => {
      const cells = splitCSVLine(r);
      const o = {};
      head.forEach((h, i) => { o[h] = cells[i] === undefined ? "" : cells[i]; });
      return o;
    });
    return JSON.stringify(arr, null, 2);
  },
  json_to_ts: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const obj = Array.isArray(r.v) ? (r.v[0] || {}) : r.v;
    if (!obj || typeof obj !== "object") return "顶层不是对象";
    const lines = ["export interface Root {"];
    for (const k of Object.keys(obj)) lines.push("  " + k + ": " + tsType(obj[k]) + ";");
    lines.push("}");
    return lines.join(NL);
  },
  json_to_go: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const obj = Array.isArray(r.v) ? (r.v[0] || {}) : r.v;
    if (!obj || typeof obj !== "object") return "顶层不是对象";
    const g = { string: "string", number: "float64", boolean: "bool" };
    const lines = ["type Root struct {"];
    for (const k of Object.keys(obj)) {
      const name = k.split("_").map((x) => x ? x.charAt(0).toUpperCase() + x.slice(1) : "").join("");
      lines.push("  " + name + " " + (g[typeof obj[k]] || "interface{}") + " -json-" + k);
    }
    lines.push("}");
    return lines.join(NL);
  },
  json_to_sql: (t, a) => {
    const table = a || "items";
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const arr = Array.isArray(r.v) ? r.v : [r.v];
    return arr.map((o) => {
      const keys = Object.keys(o);
      const vals = keys.map((k) => (typeof o[k] === "number" ? o[k] : "'" + String(o[k]).split("'").join("''") + "'"));
      return "INSERT INTO " + table + " (" + keys.join(", ") + ") VALUES (" + vals.join(", ") + ");";
    }).join(NL);
  },
  json_to_markdown: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const arr = Array.isArray(r.v) ? r.v : [r.v];
    const keys = Array.from(new Set(arr.flatMap((o) => (o && typeof o === "object" ? Object.keys(o) : []))));
    const head = "| " + keys.join(" | ") + " |";
    const sep = "| " + keys.map(() => "---").join(" | ") + " |";
    const body = arr.map((o) => "| " + keys.map((k) => String(o[k] === undefined ? "" : o[k])).join(" | ") + " |").join(NL);
    return head + NL + sep + NL + body;
  },
  json_escape: (t) => JSON.stringify(String(t)).slice(1, -1),
  json_unescape: (t) => { try { return JSON.parse(String.fromCharCode(34) + String(t) + String.fromCharCode(34)); } catch (e) { return "反转义失败: " + e.message; } },
  jsonpath_get: (t, a) => {
    const r = parseJSON(t);
    if (!r.ok) return "JSON 无效: " + r.e;
    const v = pathGet(r.v, a || "");
    return v === undefined ? "路径不存在" : JSON.stringify(v, null, 2);
  },
  json_count_keys: (t) => { const r = parseJSON(t); if (!r.ok) return "JSON 无效: " + r.e; const f = flatten(r.v, "", []); return "叶子节点: " + f.length + NL + f.slice(0, 20).join(NL); },
  regex_test: (t, a) => {
    let re; try { re = new RegExp(a || "", "g"); } catch (e) { return "正则无效: " + e.message; }
    const m = String(t).match(re) || [];
    return "匹配 " + m.length + " 次" + NL + m.slice(0, 50).join(NL);
  },
  regex_extract: (t, a) => {
    let re; try { re = new RegExp(a || "([A-Za-z0-9_]+)", "g"); } catch (e) { return "正则无效: " + e.message; }
    const out = []; let m;
    while ((m = re.exec(String(t))) !== null) {
      out.push(m.length > 1 ? m.slice(1).join(" - ") : m[0]);
      if (m.index === re.lastIndex) re.lastIndex++;
      if (out.length >= 200) break;
    }
    return out.join(NL);
  },
  regex_replace: (t, a, b) => { try { return String(t).replace(new RegExp(a || "", "g"), b || ""); } catch (e) { return "正则无效: " + e.message; } },
  regex_escape: (t) => {
    const special = ".*+?^$()[]{}|-";
    return Array.from(String(t)).map((c) => (special.indexOf(c) >= 0 ? BS + c : c)).join("");
  },
  timestamp_to_date: (t, a) => {
    const n = Number(String(t).trim());
    if (!Number.isFinite(n)) return "不是数字时间戳";
    const ms = String(t).trim().length >= 13 ? n : n * 1000;
    const off = parseFloat(a || "8");
    const d = new Date(ms + off * 3600000);
    return "UTC+" + off + ": " + d.toISOString().split("T").join(" ").split("Z").join("");
  },
  date_to_timestamp: (t) => {
    const d = new Date(String(t).trim().split(" ").join("T"));
    if (isNaN(d.getTime())) return "日期无法解析";
    return "秒: " + Math.floor(d.getTime() / 1000) + NL + "毫秒: " + d.getTime();
  },
  cron_parse: (t) => {
    const f = String(t).trim().split(/\s+/);
    const names = ["分钟", "小时", "日", "月", "星期"];
    if (f.length < 5) return "需要 5 段：分 时 日 月 周";
    const lines = ["Cron 解析"];
    for (let i = 0; i < 5; i++) lines.push("  " + names[i] + ": " + f[i]);
    return lines.join(NL);
  },
  cron_next: (t) => "说明: 本工具只解释字段，不计算下次运行时间" + NL + OPS.cron_parse(t),
  uuid_gen: (t, a) => { const n = Math.min(parseInt(a, 10) || 1, 100); const o = []; for (let i = 0; i < n; i++) o.push(crypto.randomUUID()); return o.join(NL); },
  uuid_validate: (t) => {
    const lines = [];
    for (const x of String(t).trim().split(/\s+/)) {
      const parts = x.split("-");
      const ok = parts.length === 5 && parts[0].length === 8 && parts[1].length === 4 && parts[2].length === 4 && parts[3].length === 4 && parts[4].length === 12;
      lines.push(x + " -> " + (ok ? "合法 UUID" : "不合法"));
    }
    return lines.join(NL);
  },
  base_convert: (t, a, b) => {
    const from = parseInt(a, 10) || 10, to = parseInt(b, 10) || 16;
    const n = parseInt(String(t).trim(), from);
    if (!Number.isFinite(n)) return "无法按 " + from + " 进制解析";
    return n.toString(to).toUpperCase();
  },
  hex_to_text: (t) => {
    const s = String(t).split(" ").join("").split(NL).join("");
    const out = [];
    for (let i = 0; i + 1 < s.length; i += 2) out.push(String.fromCharCode(parseInt(s.slice(i, i + 2), 16)));
    return out.join("");
  },
  text_to_hex: (t) => Array.from(String(t)).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "),
  binary_to_text: (t) => {
    const s = String(t).split(" ").join("");
    const out = [];
    for (let i = 0; i + 7 < s.length; i += 8) out.push(String.fromCharCode(parseInt(s.slice(i, i + 8), 2)));
    return out.join("");
  },
  text_to_binary: (t) => Array.from(String(t)).map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "),
  ascii_table: (t) => Array.from(String(t)).map((c) => c + " " + c.codePointAt(0)).join(NL),
  unicode_escape: (t) => Array.from(String(t)).map((c) => BS + "u" + c.codePointAt(0).toString(16).padStart(4, "0")).join(""),
  unicode_unescape: (t) => String(t).replace(new RegExp(BS + "u([0-9a-fA-F]{4})", "g"), (m, h) => String.fromCharCode(parseInt(h, 16))),
  url_parse: (t) => {
    try {
      const u = new URL(String(t).trim());
      const lines = ["协议: " + u.protocol, "主机: " + u.host, "路径: " + u.pathname];
      u.searchParams.forEach((v, k) => lines.push("参数 " + k + " = " + v));
      return lines.join(NL);
    } catch (e) { return "URL 无效: " + e.message; }
  },
  url_build: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "参数需为 JSON: {base, params}";
    const u = new URL(r.v.base || "https://example.com");
    const p = r.v.params || {};
    for (const k of Object.keys(p)) u.searchParams.set(k, String(p[k]));
    return u.toString();
  },
  mime_lookup: (t, a) => { const e = String(a || t).trim().replace(/^[.]/, "").toLowerCase(); return e + " -> " + (MIME[e] || "未知（未收录）"); },
  http_status_lookup: (t, a) => { const c = String(a || t).trim(); return c + " " + (STATUS[c] || "未知状态码"); },
  port_lookup: (t, a) => { const p = String(a || t).trim(); return p + "/tcp " + (PORTS[p] || "未收录"); },
  gitignore_gen: (t, a) => {
    const stack = String(a || t).trim().toLowerCase();
    const base = ["node_modules/", ".DS_Store", "*.log", ".env", "dist/", "build/"];
    const extra = { node: ["npm-debug.log*", "coverage/", ".next/"], python: ["__pycache__/", "*.pyc", ".venv/", "venv/"], go: ["bin/", "*.test"], java: ["target/", "*.class"] };
    return base.concat(extra[stack] || []).join(NL);
  },
  robots_gen: (t, a) => { const d = String(a || "").trim(); return ["User-agent: *", d ? "Disallow: " + d : "Disallow:", "Sitemap: https://example.com/sitemap.xml"].join(NL); },
  meta_tags_gen: (t) => {
    const r = parseJSON(t);
    if (!r.ok) return "参数需为 JSON: {title, description}";
    const q = String.fromCharCode(34);
    return ["<title>" + (r.v.title || "") + "</title>", "<meta name=" + q + "description" + q + " content=" + q + (r.v.description || "") + q + ">", "<meta property=" + q + "og:title" + q + " content=" + q + (r.v.title || "") + q + ">"].join(NL);
  },
  nginx_redirect: (t, a) => { const f = String(t).trim() || "/old"; const to = String(a || "").trim() || "https://example.com/new"; return "location = " + f + " { return 301 " + to + "; }"; },
  dockerfile_gen: (t, a) => {
    const lang = String(a || t || "node").trim().toLowerCase();
    const tpl = {
      node: ["FROM node:22-alpine", "WORKDIR /app", "COPY package*.json ./", "RUN npm ci --omit=dev", "COPY . .", "CMD [node, index.js]"],
      python: ["FROM python:3.12-slim", "WORKDIR /app", "COPY requirements.txt .", "RUN pip install -r requirements.txt", "COPY . .", "CMD [python, main.py]"],
      go: ["FROM golang:1.22-alpine AS build", "WORKDIR /src", "COPY . .", "RUN go build -o /out/app .", "FROM alpine", "COPY --from=build /out/app /app", "CMD [/app]"]
    };
    return (tpl[lang] || tpl.node).join(NL);
  },
  package_json_gen: (t, a) => { const name = String(a || t || "my-package").trim(); return JSON.stringify({ name: name, version: "1.0.0", type: "module", main: "index.js", scripts: { test: "node --test" }, license: "MIT" }, null, 2); },
  curl_to_code: (t) => {
    const s = String(t);
    let url = "";
    for (const part of s.split(/\s+/)) if (part.indexOf("http") === 0) { url = part; break; }
    let method = "GET";
    const mi = s.indexOf("-X ");
    if (mi >= 0) method = s.slice(mi + 3).split(/\s+/)[0];
    const lines = ["import requests", "", "url = " + String.fromCharCode(34) + url + String.fromCharCode(34), "resp = requests." + method.toLowerCase() + "(url)", "print(resp.status_code, resp.text[:200])"];
    return lines.join(NL);
  },
  json_to_kv: (t) => { const r = parseJSON(t); if (!r.ok) return "JSON 无效: " + r.e; return flatten(r.v, "", []).join(NL); },
  kv_to_json: (t) => { const o = {}; for (const line of String(t).split(NL)) { const i = line.indexOf("="); if (i > 0) o[line.slice(0, i).trim()] = line.slice(i + 1).trim(); } return JSON.stringify(o, null, 2); },
  sql_format: (t) => {
    const kw = ["select", "from", "where", "group by", "order by", "limit", "insert into", "values", "update", "set", "delete from", "join", "left join", "inner join", "on"];
    let out = String(t).split(/\s+/).join(" ");
    for (const k of kw) out = out.split(new RegExp(k, "gi")).join(NL + k.toUpperCase());
    return out.trim();
  }
};

function run(op, text, a, b) {
  const fn = OPS[op];
  if (!fn) throw new Error("未知操作: " + op);
  return String(fn(text, a, b));
}

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "dev_timestamp_to_date",
    description: "时间戳转日期：a=时区偏移，默认 8",
    parameters: {
      text: { type: "string", required: true, description: "输入内容" },
      a: { type: "string", description: "参数 a" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const text = args && args.text != null ? String(args.text) : "";
      const a = args && args.a != null ? String(args.a) : "";
      const b = args && args.b != null ? String(args.b) : "";
      try {
        return { text: [TITLE, "=".repeat(52), run(OP, text, a, b), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}