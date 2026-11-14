/**
 * 工程计算：pulley ma — 工程计算
 */

export const name = "dsh-eng-pulley-ma";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function n(v) { const x = Number(String(v).replace(/[^\d.-]/g, "")); if (!Number.isFinite(x)) throw new Error("需要数字"); return x; }
function f(x) { return (Math.round(x * 1000) / 1000).toString(); }

const OPS = {
  bolt_torque: (t, a, b) => { const F = n(t), d = n(a), K = b ? n(b) : 0.2; return "扭矩: " + f(K * F * d / 1000) + " N·m（K=" + K + "，d=" + d + " mm，F=" + F + " N）"; },
  thread_pitch_dia: (t) => { const d = n(t); return "粗牙中径 ≈ " + f(d - 0.6495 * 1.5) + " mm（按 M" + d + " 粗牙、P=1.5 估算，实际查表）"; },
  gear_ratio: (t, a) => { const z1 = n(t), z2 = n(a); return "传动比: " + f(z2 / z1) + ":1" + NL + "若输入 1000 rpm，输出 " + f(1000 * z1 / z2) + " rpm"; },
  belt_length: (t, a, b) => { const d1 = n(t), d2 = n(a), C = n(b); return "皮带长 ≈ " + f(2 * C + Math.PI * (d1 + d2) / 2 + Math.pow(d2 - d1, 2) / (4 * C)) + " mm"; },
  bearing_life: (t, a, b) => { const C = n(t), P = n(a), rpm = n(b); if (!P) throw new Error("P 为 0"); const L10 = Math.pow(C / P, 3); return "L10: " + f(L10) + " 百万转" + NL + "按 " + rpm + " rpm ≈ " + f(L10 * 1e6 / (60 * rpm) / 1000) + " 千小时"; },
  spring_rate: (t, a, b) => { const G = n(t), d = n(a), D = n(b); return "弹簧刚度 k ≈ " + f(G * Math.pow(d, 4) / (8 * Math.pow(D, 3) * 10)) + " N/mm（G=" + G + " MPa，线径 " + d + "，中径 " + D + "，圈数按 10 估）"; },
  beam_deflection: (t, a, b, c) => { const P = n(t), L = n(a), E = n(b), I = n(c); return "简支梁中点挠度 ≈ " + f(P * Math.pow(L, 3) / (48 * E * I)) + " mm（P N, L mm, E MPa, I mm^4）"; },
  ohm_law: (t, a) => { const U = n(t), R = n(a); if (!R) throw new Error("R 为 0"); return "电流 I = " + f(U / R) + " A，功率 P = " + f(U * U / R) + " W"; },
  resistor_divider: (t, a, b) => { const Vin = n(t), R1 = n(a), R2 = n(b); return "Vout = " + f(Vin * R2 / (R1 + R2)) + " V"; },
  rc_time: (t, a) => { const R = n(t), C = n(a); return "时间常数 τ = " + f(R * C / 1000) + " ms，5τ = " + f(R * C * 5 / 1000) + " ms"; },
  cylinder_force: (t, a) => { const P = n(t), D = n(a); const A = Math.PI * Math.pow(D / 2, 2); return "推力 = " + f(P * A / 1000) + " kN（压力 " + P + " MPa，缸径 " + D + " mm）"; },
  pulley_ma: (t) => { const nstr = n(t); return "机械优势 ≈ " + f(nstr) + ":1（" + nstr + " 根承重绳）"; },
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "pulley_ma",
    description: "pulley ma",
    parameters: {
      text: { "type": "string", required: true, "description": "输入" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      const a = args && args.a != null ? String(args.a) : "";
      const b = args && args.b != null ? String(args.b) : "";
      const c = args && args.c != null ? String(args.c) : "";
      try {
        const fn = OPS["pulley_ma"];
        if (!fn) throw new Error("未知操作");
        return { text: ["工程计算：pulley ma", "=".repeat(52), String(fn(t, a, b, c)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}