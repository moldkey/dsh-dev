/**
 * 命名风格：to kebab — 命名风格转换
 */

export const name = "dsh-case-to-kebab";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

function words(t) {
  return String(t)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}
function cap(w) { return w ? w[0].toUpperCase() + w.slice(1) : w; }

const OPS = {
  to_camel: (t) => words(t).map((w, i) => (i === 0 ? w : cap(w))).join(""),
  to_pascal: (t) => words(t).map(cap).join(""),
  to_snake: (t) => words(t).join("_"),
  to_kebab: (t) => words(t).join("-"),
  to_constant: (t) => words(t).join("_").toUpperCase(),
  to_dot: (t) => words(t).join("."),
  to_path: (t) => words(t).join("/"),
  to_title: (t) => words(t).map(cap).join(" "),
  to_sentence: (t) => { const w = words(t); return w.length ? cap(w[0]) + (w.length > 1 ? " " + w.slice(1).join(" ") : "") : ""; },
  to_capitalize: (t) => words(t).map(cap).join(" "),
  to_alternating: (t) => Array.from(String(t)).map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""),
  to_toggle: (t) => Array.from(String(t)).map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
  to_inverse: (t) => Array.from(String(t)).map((c) => (/[a-z]/.test(c) ? c.toUpperCase() : /[A-Z]/.test(c) ? c.toLowerCase() : c)).join(""),
  to_screaming_snake: (t) => words(t).join("_").toUpperCase(),
  to_train: (t) => words(t).map(cap).join("-"),
  count_words: (t) => "词数: " + words(t).length,
};

export function apply(ctx, config) {
  void config;
  ctx.tools.register({
    name: "to_kebab",
    description: "to kebab",
    parameters: {
      text: { "type": "string", required: true, "description": "输入名称/文本" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      const t = args && args.text != null ? String(args.text) : "";
      try {
        const fn = OPS["to_kebab"];
        if (!fn) throw new Error("未知操作");
        return { text: ["命名风格：to kebab", "=".repeat(52), String(fn(t)), "", "更多工具：" + SITE].join(NL) };
      } catch (e) {
        return { text: "处理失败: " + String((e && e.message) || e) };
      }
    },
  });
}
