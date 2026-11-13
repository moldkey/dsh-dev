/**
 * 时长工具：duration cn — 时长工具
 */

export const name = "dsh-dur-duration-cn";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function parseDur(s) {
  const str = String(s).trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(str)) return Number(str);
  let total = 0; let m;
  const re = /(\d+(?:\.\d+)?)\s*(d|day|天|h|hr|hour|小时|m|min|分钟|s|sec|秒)/g;
  while ((m = re.exec(str)) !== null) {
    const v = Number(m[1]); const u = m[2];
    if (/^(d|day|天)$/.test(u)) total += v * 86400;
    else if (/^(h|hr|hour|小时)$/.test(u)) total += v * 3600;
    else if (/^(m|min|分钟)$/.test(u)) total += v * 60;
    else total += v;
  }
  if (!total) throw new Error("无法解析时长，如 1h30m / 90s");
  return total;
}
function hms(sec) {
  sec = Math.abs(Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].filter((x, i) => x > 0 || i > 0).map((x) => String(x).padStart(2, "0")).join(":");
}
function cn(sec) {
  sec = Math.abs(Math.round(sec));
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const out = [];
  if (d) out.push(d + " 天");
  if (h) out.push(h + " 小时");
  if (m) out.push(m + " 分");
  if (s) out.push(s + " 秒");
  return out.join(" ") || "0 秒";
}

const OPS = {
  duration_parse: (t) => "秒: " + parseDur(t),
  seconds_to_hms: (t) => hms(Number(t)),
  hms_to_seconds: (t) => { const m = String(t).trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/); if (!m) throw new Error("格式 HH:MM 或 HH:MM:SS"); return String(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0)); },
  duration_cn: (t) => cn(parseDur(t)),
  add_duration: (t, a) => { const d = new Date(String(t).replace(" ", "T")); if (isNaN(d.getTime())) throw new Error("日期无效"); d.setSeconds(d.getSeconds() + parseDur(a)); return d.toISOString().replace("T", " ").slice(0, 19); },
  duration_between: (t, a) => { const x = new Date(String(t).replace(" ", "T")), y = new Date(String(a).replace(" ", "T")); if (isNaN(x) || isNaN(y)) throw new Error("日期无效"); return cn((y - x) / 1000); },
  relative_time: (t) => { const d = new Date(String(t).replace(" ", "T")); if (isNaN(d.getTime())) throw new Error("日期无效"); const diff = (Date.now() - d.getTime()) / 1000; if (Math.abs(diff) < 60) return "刚刚"; if (diff > 0) return cn(diff) + "前"; return cn(-diff) + "后"; },
  ms_to_hms: (t) => hms(Number(t) / 1000),
  days_to_hms: (t) => hms(Number(t) * 86400),
  hms_to_days: (t) => { const m = String(t).trim().match(/^(\d+):(\d{2})(?::(\d{2}))?$/); if (!m) throw new Error("格式 HH:MM:SS"); const sec = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0); return (Math.round(sec / 86400 * 1000) / 1000) + " 天"; },
  duration_round: (t, a) => { const step = Math.max(1, Number(a) || 60); const sec = parseDur(t); return String(Math.round(sec / step) * step) + " 秒"; },
  duration_mul: (t, a) => hms(parseDur(t) * Number(a || 1)),
  duration_div: (t, a) => hms(parseDur(t) / Number(a || 1)),
  pace_calc: (t, a) => { const dist = Number(t); const sec = parseDur(a); if (!dist) throw new Error("距离为 0"); const p = sec / dist; return "配速: " + hms(p) + " / 单位" + NL + "速度: " + (Math.round(dist / sec * 3600 * 100) / 100) + " 单位/小时"; },
  eta_calc: (t, a) => { const dist = Number(t); const speed = Number(a); if (!speed) throw new Error("速度为 0"); return "预计用时: " + cn(dist / speed * 3600); },
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "duration_cn",
    description: "duration cn",
    parameters: {
      text: { "type": "string", required: true, "description": "输入" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      const a = args && args.a != null ? String(args.a) : "";
      try {
        const fn = OPS["duration_cn"];
        if (!fn) throw new Error("未知操作");
        return { text: ["时长工具：duration cn", "=".repeat(52), String(fn(t, a)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}
