/**
 * 位运算：ushr — 进制与位运算
 */

export const name = "dsh-bits-ushr";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function num(v) { const x = Number(String(v).replace(/[_,\s]/g, "")); if (!Number.isFinite(x)) throw new Error("需要数字"); return Math.trunc(x); }
function parseBase(t, base) { const s = String(t).trim().toLowerCase(); const n = parseInt(s, base); if (!Number.isFinite(n)) throw new Error("无法按 " + base + " 进制解析"); return n; }
function pair(a) { const s = String(a).trim(); if (/^-?\d+$/.test(s)) return [Number(s)]; const m = s.match(/^\s*(-?\d+)\s*[, ]\s*(-?\d+)\s*$/); if (!m) throw new Error("a=第二个数"); return [Number(m[1]), Number(m[2])]; }

const OPS = {
  base_any: (t, a) => { const parts = String(a || "10,16").split(","); const from = Number(parts[0]) || 10, to = Number(parts[1]) || 16; if (from < 2 || from > 36 || to < 2 || to > 36) throw new Error("进制需 2–36"); return parseBase(t, from).toString(to).toUpperCase(); },
  base_detect: (t) => { const s = String(t).trim(); if (/^0x[0-9a-f]+$/i.test(s)) return "十六进制"; if (/^0b[01]+$/i.test(s)) return "二进制"; if (/^0o[0-7]+$/i.test(s)) return "八进制"; if (/^-?\d+$/.test(s)) return "十进制"; return "无法判断"; },
  bit_and: (t, a) => String(num(t) & pair(a)[0]),
  bit_or: (t, a) => String(num(t) | pair(a)[0]),
  bit_xor: (t, a) => String(num(t) ^ pair(a)[0]),
  bit_not: (t) => String(~num(t)),
  shl: (t, a) => String(num(t) << (Number(a) | 0)),
  shr: (t, a) => String(num(t) >> (Number(a) | 0)),
  ushr: (t, a) => String(num(t) >>> (Number(a) | 0)),
  bit_count: (t) => { let x = num(t) >>> 0, c = 0; while (x) { c += x & 1; x >>>= 1; } return "置位数: " + c; },
  bit_test: (t, a) => ((num(t) >> (Number(a) | 0)) & 1 ? "第 " + a + " 位为 1" : "第 " + a + " 位为 0"),
  bit_set: (t, a) => String(num(t) | (1 << (Number(a) | 0))),
  bit_clear: (t, a) => String(num(t) & ~(1 << (Number(a) | 0))),
  flags_to_bits: (t) => { const v = num(t) >>> 0; return v.toString(2).padStart(32, "0").replace(/(.{8})(?=.)/g, "$1 "); },
  bits_to_flags: (t) => { const s = String(t).replace(/\s+/g, ""); if (!/^[01]{1,32}$/.test(s)) throw new Error("需要二进制串"); return String(parseInt(s, 2)); },
  xor_swap: (t, a) => { let x = num(t), y = pair(a)[0]; x ^= y; y ^= x; x ^= y; return "交换后: " + x + ", " + y; },
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "ushr",
    description: "ushr",
    parameters: {
      text: { "type": "string", required: true, "description": "输入" },
      a: { "type": "string", "description": "参数" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      const a = args && args.a != null ? String(args.a) : "";
      try {
        const fn = OPS["ushr"];
        if (!fn) throw new Error("未知操作");
        return { text: ["位运算：ushr", "=".repeat(52), String(fn(t, a)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}