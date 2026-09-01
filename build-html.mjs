import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(currentDir, "slides.md");
const outputPath = join(currentDir, "index.html");
const heroImage = `data:image/png;base64,${readFileSync(
  join(currentDir, "assets", "ai-guidance-hero.png"),
).toString("base64")}`;

const CHAPTERS = [
  [1, 2, "开场：从写代码到可验证交付"],
  [3, 9, "第一章：docs-for-ai 管理工程事实"],
  [10, 16, "第二章：Skill 把事实组织成行动"],
  [17, 30, "第三章：工作流故障交付案例"],
  [31, 31, "结语：下一次任务的七个问题"],
];

const LAYOUTS = {
  1: "title",
  3: "statement",
  4: "statement",
  5: "table",
  6: "statement",
  7: "table",
  8: "statement",
  9: "flow",
  10: "flow",
  11: "case",
  12: "table",
  13: "flow",
  14: "list",
  15: "list",
  16: "case",
  17: "flow",
  19: "flow",
  20: "case",
  23: "table",
  31: "checklist",
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function renderInline(value) {
  const stashed = [];
  let rendered = value;
  const stash = (html) => {
    const token = `@@SLIDE_TOKEN_${stashed.length}@@`;
    stashed.push(html);
    return token;
  };

  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) =>
    stash(`<a href="${escapeAttribute(href)}">${renderInline(label)}</a>`),
  );
  rendered = rendered.replace(/`([^`]+)`/g, (_match, code) =>
    stash(`<code>${escapeHtml(code)}</code>`),
  );
  rendered = escapeHtml(rendered);
  rendered = rendered.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*(.+?)\*/g, "<em>$1</em>");
  stashed.forEach((html, index) => {
    rendered = rendered.replace(`@@SLIDE_TOKEN_${index}@@`, html);
  });
  return rendered;
}

function isTableSeparator(line) {
  return /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function startsBlock(lines, index) {
  const line = lines[index] ?? "";
  const next = lines[index + 1] ?? "";
  return (
    !line.trim() ||
    line.startsWith("```") ||
    line.startsWith("> ") ||
    /^-\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    (line.trim().startsWith("|") && isTableSeparator(next))
  );
}

function renderVisual(name) {
  const visuals = {
    "hero-guidance": `
      <figure class="visual visual--hero" aria-label="工程师引导 AI 穿过上下文、验证和反馈层">
        <img src="${heroImage}" alt="工程师引导 AI 穿过上下文、验证和反馈层" />
      </figure>`,
    "quality-system": `
      <figure class="visual visual--quality" aria-label="高质量 AI 代码由四项条件共同决定">
        <div class="visual__factors">
          <div class="visual__node"><b>01</b><span>任务边界</span></div><i>×</i>
          <div class="visual__node"><b>02</b><span>可信上下文</span></div><i>×</i>
          <div class="visual__node"><b>03</b><span>验证反馈</span></div><i>×</i>
          <div class="visual__node"><b>04</b><span>人类决策</span></div>
        </div>
        <div class="visual__result"><span>共同作用</span><strong>高质量 AI 代码</strong></div>
      </figure>`,
    "shared-facts": `
      <figure class="visual visual--shared" aria-label="人类与 AI 通过不同入口读取同一套工程事实">
        <div class="visual__entry visual__entry--human"><small>人类入口</small><strong>README</strong></div>
        <div class="visual__merge"><span>共同读取</span><b>一份工程事实</b></div>
        <div class="visual__entry visual__entry--agent"><small>AI 入口</small><strong>AGENTS</strong></div>
        <div class="visual__owners">
          <span>Product</span><span>SPEC</span><span>Architecture</span><span>Contract</span>
        </div>
      </figure>`,
    "docs-route": `
      <figure class="visual visual--route-filter" aria-label="任务路由把完整文档树压缩为最小上下文包">
        <div class="visual__library"><small>完整知识库</small><b>Docs</b><span>owner 明确</span><span>事实唯一</span></div>
        <div class="visual__arrow">→</div>
        <div class="visual__filter"><small>本次任务</small><b>二维路由</b><span>Lane × Domain</span></div>
        <div class="visual__arrow">→</div>
        <div class="visual__pack"><small>按需加载</small><b>最小上下文包</b><span>Instructions · Owner Docs · Gates</span></div>
      </figure>`,
    "context-layers": `
      <figure class="visual visual--layers" aria-label="上下文按照 L0 到 L3 逐层展开">
        <div class="visual__layer visual__layer--3"><b>L3</b><span>安全 · 数据 · 部署 · E2E</span><small>跨边界风险</small></div>
        <div class="visual__layer visual__layer--2"><b>L2</b><span>一个 owner 文档</span><small>SPEC / ADR / Contract / PLAN</small></div>
        <div class="visual__layer visual__layer--1"><b>L1</b><span>源码 · 测试 · 配置 · 消费者</span><small>当前实现证据</small></div>
        <div class="visual__layer visual__layer--0"><b>L0</b><span>任务与路由</span><small>从这里开始</small></div>
      </figure>`,
    "route-matrix": `
      <figure class="visual visual--matrix" aria-label="Lane 与 Domain 组成二维任务路由">
        <div class="visual__axis visual__axis--y">CHANGE LANES</div>
        <div class="visual__axis visual__axis--x">DOMAIN OWNERS</div>
        <div class="visual__matrix-grid">
          <span></span><b>Knowledge</b><b>Agent</b><b>Workflow</b>
          <b>Backend</b><i class="is-hit">●</i><i></i><i></i>
          <b>Contract</b><i class="is-hit">●</i><i></i><i></i>
          <b>Data</b><i class="is-hit">●</i><i></i><i></i>
        </div>
        <div class="visual__matrix-output"><small>确定性合并</small><strong>Instructions + Docs + Search Roots + Verification + Gates</strong></div>
      </figure>`,
    "artifact-chain": `
      <figure class="visual visual--artifact-chain" aria-label="不同工程工件按职责衔接">
        <div class="visual__chain-row">
          <div><b>WHY</b><span>Requirement</span></div><i>→</i>
          <div><b>WHAT</b><span>SPEC</span></div><i>→</i>
          <div><b>DECIDE</b><span>ADR</span></div><i>→</i>
          <div><b>HOW</b><span>Design</span></div><i>→</i>
          <div><b>DELIVER</b><span>PLAN</span></div><i>→</i>
          <div class="is-final"><b>PROVE</b><span>Code · Test</span></div>
        </div>
      </figure>`,
    "delivery-loop": `
      <figure class="visual visual--loop" aria-label="AI 工程交付的五阶段反馈循环">
        <div class="visual__loop-row">
          <div><b>01</b><span>Explore</span></div><i>→</i>
          <div><b>02</b><span>Plan</span></div><i>→</i>
          <div><b>03</b><span>Implement</span></div><i>→</i>
          <div><b>04</b><span>Verify</span></div><i>→</i>
          <div><b>05</b><span>Review</span></div>
        </div>
        <div class="visual__feedback"><span>发现新事实</span><strong>↶ Feedback：修正路线，而不是坚持最初猜测</strong></div>
      </figure>`,
    "verification-layers": `
      <figure class="visual visual--verification" aria-label="验证随真实影响面逐层扩展">
        <div class="visual__verify-step"><b>Focused</b><span>局部逻辑</span></div>
        <div class="visual__verify-step"><b>Contract</b><span>公开形状与生成链</span></div>
        <div class="visual__verify-step"><b>Consumer</b><span>直接调用方</span></div>
        <div class="visual__verify-step"><b>Integration / E2E</b><span>真实跨系统副作用</span></div>
        <div class="visual__risk-arrow">风险与 blast radius 增大 →</div>
      </figure>`,
    "field-chain": `
      <figure class="visual visual--field-chain" aria-label="一个字段变更跨越完整工程链路">
        <div class="visual__field-row">
          <span>Schema</span><i>→</i><span>Migration</span><i>→</i><span>Query / Model</span><i>→</i><span>HTTP Contract</span>
        </div>
        <div class="visual__field-turn">↓</div>
        <div class="visual__field-row visual__field-row--return">
          <span>Tests</span><i>←</i><span>Consumer</span><i>←</i><span>Generated Client</span><i>←</i><span>OpenAPI</span>
        </div>
      </figure>`,
    "identity-envelope": `
      <figure class="visual visual--field-chain" aria-label="Workflow 将归属范围与执行人身份封装为跨域请求">
        <div class="visual__field-row">
          <span>Query · Dataset</span><i>+</i><span>CanonicalScope</span><i>+</i><span>Session facts</span><i>→</i><span>Knowledge Request</span>
        </div>
        <div class="visual__field-turn">↓</div>
        <div class="visual__field-row visual__field-row--return">
          <span>RAG 检索</span><i>←</i><span>Dataset 预授权</span><i>←</i><span>真实执行人</span><i>←</i><span>租户 / 工作空间</span>
        </div>
      </figure>`,
    "authz-chain": `
      <figure class="visual visual--field-chain" aria-label="Prompt 删除请求的授权决策链">
        <div class="visual__field-row">
          <span>Browser DELETE</span><i>→</i><span>Prompt Service</span><i>→</i><span>Session Scope</span><i>→</i><span>IAM AuthZEN</span>
        </div>
        <div class="visual__field-turn">↓</div>
        <div class="visual__field-row visual__field-row--return">
          <span>Role Template</span><i>←</i><span>Concrete Role</span><i>←</i><span>Role Binding</span><i>←</i><span>Decision</span>
        </div>
      </figure>`,
    "role-boundary": `
      <figure class="visual visual--roles" aria-label="人类负责取舍与授权，AI 负责证据化执行">
        <div class="visual__role visual__role--human"><small>HUMAN</small><b>决定方向</b><span>目标 · 取舍 · 授权 · 验收</span></div>
        <div class="visual__gate"><span>明确边界</span><strong>Human Gate</strong><span>AI 不静默扩大权限</span></div>
        <div class="visual__role visual__role--ai"><small>AI AGENT</small><b>证据化执行</b><span>搜索 · 实现 · 验证 · 暴露风险</span></div>
      </figure>`,
    "routing-feedback": `
      <figure class="visual visual--routing-feedback" aria-label="路由日志驱动持续优化闭环">
        <div class="visual__log"><small>每次任务</small><b>Routing Log</b></div>
        <div class="visual__feedback-metrics"><span>任务状态</span><span>路由质量</span><span>验证结果</span><span>目标结果</span></div>
        <div class="visual__feedback-arrow">→</div>
        <div class="visual__improve"><small>人工复核</small><b>优化 Router / Owner / Gate</b></div>
        <div class="visual__return-arrow">下一次任务得到更准、更小的上下文 ↺</div>
      </figure>`,
  };
  const visual = visuals[name];
  if (!visual) {
    throw new Error(`Unknown visual ${name}`);
  }
  return visual;
}

function renderMarkdown(markdown) {
  const lines = markdown.trim().split("\n");
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      if (language === "visual") {
        output.push(renderVisual(code.join("\n").trim()));
        continue;
      }
      output.push(
        `<pre${language ? ` data-language="${escapeAttribute(language)}"` : ""}><code>${escapeHtml(code.join("\n"))}</code></pre>`,
      );
      continue;
    }

    if (line.trim().startsWith("|") && isTableSeparator(lines[index + 1] ?? "")) {
      const header = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      output.push(
        `<table><thead><tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows
            .map(
              (row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody></table>`,
      );
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^-\s+/, ""));
        index += 1;
      }
      output.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      output.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      output.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !startsBlock(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return output.join("\n");
}

function section(block, name, nextName) {
  const end = nextName ? `(?=\\n### ${nextName})` : "$";
  const match = block.match(new RegExp(`### ${name}\\n\\n([\\s\\S]*?)${end}`));
  if (!match) {
    throw new Error(`Missing section ${name}`);
  }
  return match[1].trim();
}

function chapterFor(number) {
  const entry = CHAPTERS.find(([start, end]) => number >= start && number <= end);
  return entry?.[2] ?? "团队赋能";
}

function parseSlides(markdown) {
  return markdown
    .split(/\n---\n/)
    .filter((block) => /^## \d{2}\./m.test(block))
    .map((block) => {
      const titleMatch = block.match(/^## (\d{2})\. (.+)$/m);
      if (!titleMatch) {
        throw new Error("Invalid slide heading");
      }
      const number = Number(titleMatch[1]);
      return {
        number,
        numberLabel: titleMatch[1],
        title: titleMatch[2].trim(),
        chapter: chapterFor(number),
        layout: LAYOUTS[number] ?? "standard",
        screen: section(block, "屏幕内容", "讲者备注"),
        notes: section(block, "讲者备注", number === 31 ? "依据" : "过渡"),
        transition:
          number === 31 ? "" : section(block, "过渡", "依据"),
        sources: section(block, "依据"),
      };
    });
}

function renderSlide(slide, total) {
  const titleClass = slide.title.length > 23 ? " slide__title--compact" : "";
  return `
      <section class="slide slide--${slide.layout}" id="slide-${slide.numberLabel}"
        data-slide="${slide.number}" data-title="${escapeAttribute(slide.title)}"
        data-chapter="${escapeAttribute(slide.chapter)}" aria-hidden="true">
        <header class="slide__header">
          <p class="slide__chapter">${escapeHtml(slide.chapter)}</p>
          <h1 class="slide__title${titleClass}">${escapeHtml(slide.title)}</h1>
        </header>
        <div class="slide__body">${renderMarkdown(slide.screen)}</div>
        <footer class="slide__footer">
          <span>UnicAgent Studio · AI 高质量编码</span>
          <span>${slide.numberLabel} / ${String(total).padStart(2, "0")}</span>
        </footer>
        <aside class="notes">
          <h2>讲者备注</h2>
          ${renderMarkdown(slide.notes)}
${slide.transition ? `<h3>过渡</h3>${renderMarkdown(slide.transition)}` : ""}
          <h3>依据</h3>
          ${renderMarkdown(slide.sources)}
        </aside>
      </section>`;
}

const STYLES = String.raw`
    :root {
      color-scheme: light;
      --ink: #14212b;
      --muted: #5c6973;
      --line: #d8dee3;
      --paper: #fbfcfd;
      --accent: #146c78;
      --accent-soft: #e4f0f1;
      --warm: #b45f35;
      --stage-scale: 1;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    }

    * { box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: #dfe4e7;
      color: var(--ink);
    }

    button, input { font: inherit; }

    .stage {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 1600px;
      height: 900px;
      transform: translate(-50%, -50%) scale(var(--stage-scale));
      background: var(--paper);
      box-shadow: 0 24px 80px rgb(19 33 43 / 18%);
      overflow: hidden;
      transform-origin: center;
    }

    .slide {
      position: absolute;
      inset: 0;
      display: none;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 22px;
      padding: 62px 92px 44px;
      background:
        linear-gradient(90deg, var(--accent) 0 12px, transparent 12px),
        linear-gradient(180deg, #ffffff 0%, var(--paper) 100%);
    }

    .slide.is-active { display: grid; }

    .slide__header { min-width: 0; }

    .slide__chapter {
      margin: 0 0 10px;
      color: var(--accent);
      font-size: 17px;
      font-weight: 720;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .slide__title {
      margin: 0;
      max-width: 100%;
      font-size: 46px;
      line-height: 1.16;
      letter-spacing: -0.025em;
      white-space: nowrap;
    }

    .slide__title--compact { font-size: 41px; }

    .slide__body {
      min-height: 0;
      align-self: center;
      overflow: hidden;
      font-size: 26px;
      line-height: 1.55;
    }

    .slide__body > :first-child { margin-top: 0; }
    .slide__body > :last-child { margin-bottom: 0; }

    p { margin: 0 0 20px; }

    strong { font-weight: 760; color: #0d3f47; }

    em { color: var(--muted); }

    code {
      padding: 0.08em 0.28em;
      border-radius: 4px;
      background: #eef2f4;
      color: #184953;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      font-size: 0.88em;
    }

    pre {
      margin: 20px 0 24px;
      padding: 24px 28px;
      overflow: hidden;
      border: 1px solid #cbd5da;
      border-left: 6px solid var(--accent);
      border-radius: 7px;
      background: #f3f6f7;
      color: #183740;
      font-size: 23px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    pre code { padding: 0; background: transparent; color: inherit; font-size: inherit; }

    ul, ol {
      margin: 10px 0 22px;
      padding-left: 1.35em;
    }

    li { margin: 11px 0; padding-left: 0.2em; }
    li::marker { color: var(--accent); font-weight: 760; }

    blockquote {
      margin: 26px 0 0;
      padding: 20px 26px;
      border-left: 6px solid var(--warm);
      background: #f8eee8;
      color: #4d3326;
      font-size: 29px;
      line-height: 1.5;
    }

    .visual {
      position: relative;
      width: 100%;
      margin: 8px auto 24px;
      color: var(--ink);
    }

    .visual small {
      display: block;
      color: var(--muted);
      font-size: 15px;
      font-weight: 720;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .visual--hero {
      position: fixed;
      inset: 0;
      z-index: 0;
      height: 100%;
      margin: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .visual--hero::after {
      position: absolute;
      inset: 0;
      content: "";
      background: linear-gradient(90deg, rgb(255 255 255 / 96%) 0 34%, rgb(255 255 255 / 60%) 49%, transparent 68%);
    }

    .visual--hero img { width: 100%; height: 100%; object-fit: cover; }
    .slide--title .slide__header, .slide--title .slide__footer { position: relative; z-index: 2; }
    .slide--title .slide__body { position: static; z-index: auto; }
    .slide--title .slide__body > p, .slide--title .slide__body > blockquote { position: relative; z-index: 2; }
    .slide--title .slide__header { max-width: 730px; }
    .slide--title .slide__body { max-width: 760px; justify-self: start; }
    .slide--title blockquote { max-width: 730px; background: rgb(248 238 232 / 88%); }

    .visual__node,
    .visual__entry,
    .visual__merge,
    .visual__library,
    .visual__filter,
    .visual__pack,
    .visual__chain-row > div,
    .visual__loop-row > div,
    .visual__role,
    .visual__gate,
    .visual__log,
    .visual__improve {
      border: 1px solid #c8d5da;
      border-radius: 12px;
      background: linear-gradient(145deg, #fff, #f0f6f7);
      box-shadow: 0 10px 28px rgb(20 55 65 / 8%);
    }

    .visual--quality { display: grid; grid-template-columns: 1fr 310px; gap: 32px; align-items: center; }
    .visual__factors { display: flex; align-items: center; gap: 12px; }
    .visual__factors i, .visual__chain-row i, .visual__loop-row i, .visual__field-row i {
      color: var(--warm);
      font-size: 28px;
      font-style: normal;
      font-weight: 760;
    }
    .visual__node { flex: 1; min-height: 132px; padding: 22px 8px; text-align: center; }
    .visual__node b { display: block; margin-bottom: 12px; color: var(--accent); font-size: 18px; letter-spacing: 0.1em; }
    .visual__node span { font-size: 20px; font-weight: 760; white-space: nowrap; }
    .visual__result { padding: 27px 30px; border-left: 7px solid var(--warm); background: #f8eee8; }
    .visual__result span { display: block; color: var(--warm); font-size: 17px; font-weight: 720; }
    .visual__result strong { display: block; margin-top: 8px; font-size: 30px; }

    .visual--shared {
      display: grid;
      grid-template-columns: 240px 1fr 240px;
      grid-template-rows: 170px 74px;
      gap: 18px 34px;
      align-items: center;
    }
    .visual__entry, .visual__merge { min-height: 150px; padding: 30px; text-align: center; }
    .visual__entry strong, .visual__merge b { display: block; margin-top: 12px; font-size: 30px; }
    .visual__entry--human::after, .visual__entry--agent::before { color: var(--warm); content: "→"; position: absolute; font-size: 42px; }
    .visual__entry--human { position: relative; }
    .visual__entry--human::after { right: -42px; top: 48px; }
    .visual__entry--agent { position: relative; }
    .visual__entry--agent::before { left: -42px; top: 48px; content: "←"; }
    .visual__merge { border-color: #8eb6bc; background: var(--accent-soft); }
    .visual__merge span { display: block; color: var(--accent); font-size: 18px; }
    .visual__owners { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .visual__owners span { padding: 15px; border-top: 4px solid var(--accent); background: #fff; font-size: 19px; font-weight: 720; text-align: center; }

    .visual--route-filter { display: grid; grid-template-columns: 1fr 70px 1fr 70px 1.45fr; align-items: stretch; }
    .visual__library, .visual__filter, .visual__pack { min-height: 210px; padding: 30px; }
    .visual__library b, .visual__filter b, .visual__pack b { display: block; margin: 18px 0; font-size: 30px; }
    .visual__library span, .visual__filter span, .visual__pack span { display: block; margin-top: 7px; color: var(--muted); font-size: 18px; }
    .visual__filter { border: 2px solid var(--warm); background: #fbf1eb; }
    .visual__pack { border-color: #78a9b0; background: var(--accent-soft); }
    .visual__arrow { display: grid; place-items: center; color: var(--warm); font-size: 45px; }

    .visual--layers { display: flex; flex-direction: column; align-items: center; gap: 9px; }
    .visual__layer { display: grid; grid-template-columns: 80px 1fr 360px; align-items: center; min-height: 76px; padding: 11px 28px; border: 1px solid #bdd0d5; background: #fff; }
    .visual__layer b { color: var(--accent); font-size: 24px; }
    .visual__layer span { font-size: 22px; font-weight: 720; }
    .visual__layer small { text-align: right; }
    .visual__layer--3 { width: 70%; background: #f8eee8; border-color: #d6a98f; }
    .visual__layer--2 { width: 80%; }
    .visual__layer--1 { width: 90%; background: #edf5f6; }
    .visual__layer--0 { width: 100%; background: #dcecee; border-color: #7daeb5; }

    .visual--matrix { display: grid; grid-template-columns: 66px 1fr; grid-template-rows: 1fr auto auto; gap: 11px 17px; }
    .visual__axis { color: var(--muted); font-size: 14px; font-weight: 760; letter-spacing: 0.1em; }
    .visual__axis--y { grid-row: 1; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; }
    .visual__axis--x { grid-column: 2; grid-row: 2; text-align: center; }
    .visual__matrix-grid { display: grid; grid-template-columns: 180px repeat(3, 1fr); overflow: hidden; border: 1px solid #c8d5da; border-radius: 12px; }
    .visual__matrix-grid > * { display: grid; min-height: 68px; place-items: center; border-right: 1px solid #d9e1e4; border-bottom: 1px solid #d9e1e4; }
    .visual__matrix-grid b { background: #f1f5f6; font-size: 18px; }
    .visual__matrix-grid i { background: #fff; color: transparent; font-style: normal; }
    .visual__matrix-grid i.is-hit { background: var(--accent-soft); color: var(--warm); font-size: 29px; }
    .visual__matrix-output { grid-column: 2; padding: 14px 22px; border-left: 6px solid var(--warm); background: #f8eee8; }
    .visual__matrix-output small { display: inline; margin-right: 18px; color: var(--warm); }
    .visual__matrix-output strong { font-size: 19px; }

    .visual__chain-row, .visual__loop-row { display: flex; align-items: center; gap: 10px; }
    .visual__chain-row > div { flex: 1; min-height: 150px; padding: 27px 12px; text-align: center; }
    .visual__chain-row b { display: block; color: var(--accent); font-size: 15px; letter-spacing: 0.1em; }
    .visual__chain-row span { display: block; margin-top: 18px; font-size: 22px; font-weight: 760; }
    .visual__chain-row .is-final { border-color: #d6a98f; background: #f8eee8; }

    .visual--loop { padding-top: 18px; }
    .visual__loop-row > div { flex: 1; min-height: 130px; padding: 24px 12px; text-align: center; }
    .visual__loop-row b { display: block; color: var(--accent); font-size: 18px; }
    .visual__loop-row span { display: block; margin-top: 12px; font-size: 24px; font-weight: 760; }
    .visual__feedback { width: 78%; margin: 28px auto 0; padding: 17px 28px; border: 2px dashed #bd7a55; border-radius: 999px; text-align: center; }
    .visual__feedback span { margin-right: 18px; color: var(--warm); font-size: 16px; font-weight: 760; }
    .visual__feedback strong { font-size: 20px; }

    .visual--verification { display: flex; align-items: end; gap: 15px; padding-bottom: 38px; }
    .visual__verify-step { flex: 1; padding: 20px; border-top: 6px solid var(--accent); background: #eaf3f4; }
    .visual__verify-step:nth-child(1) { min-height: 105px; }
    .visual__verify-step:nth-child(2) { min-height: 145px; }
    .visual__verify-step:nth-child(3) { min-height: 185px; }
    .visual__verify-step:nth-child(4) { min-height: 225px; border-color: var(--warm); background: #f8eee8; }
    .visual__verify-step b, .visual__verify-step span { display: block; }
    .visual__verify-step b { font-size: 22px; }
    .visual__verify-step span { margin-top: 12px; color: var(--muted); font-size: 17px; }
    .visual__risk-arrow { position: absolute; right: 0; bottom: 0; color: var(--warm); font-size: 17px; font-weight: 760; }

    .visual--field-chain { padding: 4px 0; }
    .visual__field-row { display: flex; align-items: center; gap: 13px; }
    .visual__field-row span { flex: 1; padding: 23px 12px; border: 1px solid #b9cdd2; border-radius: 9px; background: #edf5f6; font-size: 19px; font-weight: 760; text-align: center; }
    .visual__field-turn { margin: 4px 9.5% 4px 0; color: var(--warm); font-size: 32px; font-weight: 760; text-align: right; }
    .visual__field-row--return span { background: #fff; }

    .visual--roles { display: grid; grid-template-columns: 1fr 240px 1fr; gap: 25px; align-items: center; }
    .visual__role { min-height: 235px; padding: 38px 34px; }
    .visual__role b { display: block; margin: 16px 0 26px; font-size: 32px; }
    .visual__role span { color: var(--muted); font-size: 19px; }
    .visual__role--human { border-top: 8px solid var(--warm); }
    .visual__role--ai { border-top: 8px solid var(--accent); }
    .visual__gate { min-height: 175px; padding: 28px 16px; border-color: #d6a98f; background: #f8eee8; text-align: center; }
    .visual__gate strong, .visual__gate span { display: block; }
    .visual__gate strong { margin: 13px 0; color: var(--warm); font-size: 25px; }
    .visual__gate span { color: var(--muted); font-size: 15px; }

    .visual--routing-feedback { display: grid; grid-template-columns: 250px 1fr 70px 360px; grid-template-rows: 180px auto; gap: 20px; align-items: center; }
    .visual__log, .visual__improve { height: 180px; padding: 42px 28px; text-align: center; }
    .visual__log b, .visual__improve b { display: block; margin-top: 15px; font-size: 25px; }
    .visual__feedback-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
    .visual__feedback-metrics span { padding: 17px; border-left: 5px solid var(--accent); background: #edf5f6; font-size: 18px; font-weight: 720; }
    .visual__feedback-arrow { color: var(--warm); font-size: 44px; text-align: center; }
    .visual__improve { border-color: #d6a98f; background: #f8eee8; }
    .visual__return-arrow { grid-column: 1 / -1; padding: 15px; border: 2px dashed #91b4ba; border-radius: 999px; color: var(--accent); font-size: 20px; font-weight: 760; text-align: center; }

    table {
      width: 100%;
      margin: 12px 0 18px;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 22px;
      line-height: 1.4;
    }

    th, td {
      padding: 13px 18px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    th {
      background: var(--accent-soft);
      color: #0c4f59;
      font-weight: 760;
    }

    tr:last-child td { border-bottom: 0; }

    a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 0.15em; }

    .slide__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--line);
      color: #74818a;
      font-size: 16px;
      letter-spacing: 0.03em;
    }

    .slide__footer span:last-child { visibility: hidden; }

    .slide--title {
      background:
        linear-gradient(90deg, var(--accent) 0 18px, transparent 18px),
        radial-gradient(circle at 86% 18%, #dbecee 0 170px, transparent 172px),
        linear-gradient(145deg, #ffffff 0%, #f2f7f7 100%);
    }

    .slide--title .slide__header { align-self: end; margin-top: 80px; }
    .slide--title .slide__chapter { font-size: 20px; }
    .slide--title .slide__title { font-size: 76px; letter-spacing: -0.045em; }
    .slide--title .slide__body { align-self: start; max-width: 1220px; font-size: 30px; }
    .slide--title .slide__body > p:first-of-type { max-width: 720px; font-size: 36px; font-weight: 720; }
    .slide--title blockquote { max-width: 1320px; margin-top: 38px; font-size: 27px; }

    .slide--statement .slide__body {
      max-width: 1250px;
      justify-self: center;
      font-size: 29px;
    }

    .slide--statement pre { font-size: 29px; padding: 30px 36px; }
    .slide--statement blockquote { font-size: 31px; }
    .slide--flow pre { font-size: 25px; }
    .slide--case .slide__body { max-width: 1300px; }
    .slide--code pre { font-size: 22px; }
    .slide--checklist .slide__body { font-size: 24px; }
    .slide--checklist ol { columns: 2; column-gap: 70px; }
    .slide--checklist li { break-inside: avoid; margin: 15px 0; }
    .slide--checklist blockquote { column-span: all; font-size: 26px; }

    .progress {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4px;
      background: rgb(20 108 120 / 16%);
      z-index: 40;
    }

    .progress__bar {
      width: 0;
      height: 100%;
      background: var(--accent);
      transition: width 180ms ease;
    }

    .controls {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px;
      border: 1px solid rgb(20 33 43 / 14%);
      border-radius: 8px;
      background: rgb(255 255 255 / 90%);
      box-shadow: 0 8px 24px rgb(20 33 43 / 12%);
      backdrop-filter: blur(8px);
    }

    .controls button {
      min-width: 36px;
      height: 34px;
      padding: 0 10px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: var(--ink);
      cursor: pointer;
    }

    .controls button:hover, .controls button:focus-visible { background: var(--accent-soft); outline: none; }
    .controls__count { min-width: 76px; color: var(--muted); font-size: 14px; text-align: center; }

    .panel {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
      background: rgb(10 20 26 / 66%);
      backdrop-filter: blur(5px);
    }

    .panel.is-open { display: grid; }

    .panel__surface {
      width: min(980px, calc(100vw - 48px));
      max-height: calc(100dvh - 48px);
      margin: auto;
      padding: 28px 34px;
      overflow: auto;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 24px 80px rgb(0 0 0 / 28%);
    }

    .panel__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 20px;
    }

    .panel__head h2 { margin: 0; font-size: 28px; }
    .panel__close { border: 0; background: transparent; font-size: 28px; cursor: pointer; }
    .notes__content { font-size: 18px; line-height: 1.65; }
    .notes__content h2 { display: none; }
    .notes__content h3 { margin: 28px 0 8px; color: var(--accent); }
    .notes__content ul { padding-left: 1.2em; }

    .overview__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .overview__item {
      min-height: 100px;
      padding: 14px 15px;
      border: 1px solid var(--line);
      border-radius: 7px;
      background: #fff;
      color: var(--ink);
      text-align: left;
      cursor: pointer;
    }

    .overview__item:hover, .overview__item:focus-visible { border-color: var(--accent); outline: none; }
    .overview__item.is-current { border-color: var(--accent); background: var(--accent-soft); }
    .overview__number { display: block; color: var(--accent); font-size: 13px; font-weight: 760; }
    .overview__title { display: block; margin-top: 8px; font-size: 16px; line-height: 1.35; }

    .help__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 30px;
      font-size: 17px;
    }

    kbd {
      display: inline-block;
      min-width: 30px;
      margin-right: 8px;
      padding: 3px 7px;
      border: 1px solid #bcc6cc;
      border-bottom-width: 2px;
      border-radius: 5px;
      background: #f3f5f6;
      font-family: inherit;
      text-align: center;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 760px) {
      .controls { right: 8px; bottom: 10px; }
      .controls button[data-secondary] { display: none; }
      .overview__grid { grid-template-columns: 1fr; }
      .help__grid { grid-template-columns: 1fr; }
      .panel__surface { width: calc(100vw - 24px); max-height: calc(100dvh - 24px); padding: 22px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
    }

    @media print {
      @page { size: 1600px 900px; margin: 0; }
      html, body { width: auto; height: auto; overflow: visible; background: #fff; }
      .stage { position: static; width: auto; height: auto; transform: none; box-shadow: none; overflow: visible; }
      .slide, .slide.is-active {
        position: relative;
        display: grid;
        width: 1600px;
        height: 900px;
        break-after: page;
        page-break-after: always;
      }
      .slide__footer span:last-child { visibility: visible; }
      .controls, .progress, .panel { display: none !important; }
    }
`;

const REVEAL_OVERRIDES = String.raw`
    [hidden] { display: none !important; }
    .reveal { background: #dfe4e7; color: var(--ink); font-family: inherit; }
    .reveal .slides { text-align: left; }
    .reveal .slides > section.slide {
      display: grid !important;
      width: 1600px;
      height: 900px;
      min-height: 900px;
      margin: 0;
      padding: 62px 92px 44px;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 22px;
      background:
        linear-gradient(90deg, var(--accent) 0 12px, transparent 12px),
        linear-gradient(180deg, #ffffff 0%, var(--paper) 100%);
      color: var(--ink);
      font-size: initial;
      line-height: normal;
      text-align: left;
      transform-style: flat;
    }
    .reveal .slides > section.slide .slide__title,
    .reveal .slides > section.slide .slide__body,
    .reveal .slides > section.slide .slide__footer { text-transform: none; }
    .reveal .slides > section.slide .slide__header { max-width: none; }
    .reveal .slides > section.slide .slide__body { overflow: hidden; }
    .reveal .slides > section.slide .notes { display: none; }
    .reveal .controls {
      right: 18px;
      bottom: 18px;
      display: block;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      backdrop-filter: none;
    }
    .reveal .controls button { min-width: 0; height: auto; padding: 0; border-radius: 0; }
    .reveal .progress { position: absolute; height: 4px; background: rgb(20 108 120 / 16%); }
    .reveal .progress span { background: var(--accent); }
    .reveal .slide-number { right: 92px; bottom: 22px; color: var(--muted); background: transparent; font-size: 15px; }
    @media print {
      .reveal .slides > section.slide { display: grid !important; }
      .reveal .controls, .reveal .progress, .reveal .slide-number { display: none !important; }
    }
`;

const CLIENT_SCRIPT = String.raw`
    (() => {
      const slides = [...document.querySelectorAll('.slide')];
      const stage = document.querySelector('.stage');
      const progress = document.querySelector('.progress__bar');
      const count = document.querySelector('.controls__count');
      const notesPanel = document.querySelector('#notes-panel');
      const notesContent = document.querySelector('.notes__content');
      const overviewPanel = document.querySelector('#overview-panel');
      const overviewGrid = document.querySelector('.overview__grid');
      const helpPanel = document.querySelector('#help-panel');
      const liveRegion = document.querySelector('#live-region');
      let current = 0;
      let touchStartX = null;
      let wheelLocked = false;

      function scaleStage() {
        const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
        document.documentElement.style.setProperty('--stage-scale', String(scale));
      }

      function hashIndex() {
        const match = window.location.hash.match(/^#slide-(\d{2})$/);
        if (!match) return 0;
        return Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1);
      }

      function updateOverview() {
        overviewGrid.querySelectorAll('.overview__item').forEach((item, index) => {
          item.classList.toggle('is-current', index === current);
        });
      }

      function show(index, updateHash = true) {
        current = Math.min(Math.max(index, 0), slides.length - 1);
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === current;
          slide.classList.toggle('is-active', active);
          slide.setAttribute('aria-hidden', String(!active));
        });
        const label = String(current + 1).padStart(2, '0');
        count.textContent = label + ' / ' + String(slides.length).padStart(2, '0');
        progress.style.width = ((current + 1) / slides.length * 100) + '%';
        document.title = label + ' · ' + slides[current].dataset.title + ' — AI 高质量编码';
        liveRegion.textContent = '第 ' + (current + 1) + ' 页：' + slides[current].dataset.title;
        if (updateHash) history.replaceState(null, '', '#slide-' + label);
        updateOverview();
        if (notesPanel.classList.contains('is-open')) renderNotes();
      }

      function closePanels() {
        [notesPanel, overviewPanel, helpPanel].forEach((panel) => panel.classList.remove('is-open'));
      }

      function renderNotes() {
        const template = slides[current].querySelector('.slide__notes');
        notesContent.innerHTML = template.innerHTML;
      }

      function togglePanel(panel) {
        const willOpen = !panel.classList.contains('is-open');
        closePanels();
        if (willOpen) {
          if (panel === notesPanel) renderNotes();
          panel.classList.add('is-open');
          panel.querySelector('button, [tabindex]')?.focus();
        }
      }

      function toggleFullscreen() {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        } else {
          document.documentElement.requestFullscreen?.();
        }
      }

      function buildOverview() {
        overviewGrid.innerHTML = slides.map((slide, index) =>
          '<button class="overview__item" data-index="' + index + '">' +
          '<span class="overview__number">' + String(index + 1).padStart(2, '0') + ' · ' + slide.dataset.chapter + '</span>' +
          '<span class="overview__title">' + slide.dataset.title + '</span></button>'
        ).join('');
        overviewGrid.addEventListener('click', (event) => {
          const item = event.target.closest('.overview__item');
          if (!item) return;
          show(Number(item.dataset.index));
          closePanels();
        });
      }

      function auditLayout() {
        const overflows = [];
        const titleOverflows = [];
        slides.forEach((slide, index) => {
          const previousDisplay = slide.style.display;
          const previousVisibility = slide.style.visibility;
          slide.style.display = 'grid';
          slide.style.visibility = 'hidden';
          const body = slide.querySelector('.slide__body');
          const title = slide.querySelector('.slide__title');
          if (body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1) {
            overflows.push(index + 1);
          }
          if (title.scrollWidth > title.clientWidth + 1) titleOverflows.push(index + 1);
          slide.style.display = previousDisplay;
          slide.style.visibility = previousVisibility;
        });
        window.__deckAudit = {
          slideCount: slides.length,
          overflows,
          titleOverflows,
          activeSlide: current + 1,
          scale: Number(getComputedStyle(document.documentElement).getPropertyValue('--stage-scale')),
        };
        if (overflows.length || titleOverflows.length) {
          console.error('Deck layout audit failed', window.__deckAudit);
        }
        return window.__deckAudit;
      }

      document.querySelector('[data-action="previous"]').addEventListener('click', () => show(current - 1));
      document.querySelector('[data-action="next"]').addEventListener('click', () => show(current + 1));
      document.querySelector('[data-action="overview"]').addEventListener('click', () => togglePanel(overviewPanel));
      document.querySelector('[data-action="notes"]').addEventListener('click', () => togglePanel(notesPanel));
      document.querySelector('[data-action="fullscreen"]').addEventListener('click', toggleFullscreen);
      document.querySelector('[data-action="help"]').addEventListener('click', () => togglePanel(helpPanel));
      document.querySelectorAll('.panel__close').forEach((button) => button.addEventListener('click', closePanels));

      document.addEventListener('keydown', (event) => {
        const panelOpen = document.querySelector('.panel.is-open');
        if (event.key === 'Escape') {
          closePanels();
          return;
        }
        if (panelOpen) return;
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
          event.preventDefault();
          show(current + 1);
        } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
          event.preventDefault();
          show(current - 1);
        } else if (event.key === 'Home') {
          show(0);
        } else if (event.key === 'End') {
          show(slides.length - 1);
        } else if (event.key.toLowerCase() === 'n') {
          togglePanel(notesPanel);
        } else if (event.key.toLowerCase() === 'o') {
          togglePanel(overviewPanel);
        } else if (event.key.toLowerCase() === 'f') {
          toggleFullscreen();
        } else if (event.key === '?') {
          togglePanel(helpPanel);
        }
      });

      document.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0]?.clientX ?? null;
      }, { passive: true });
      document.addEventListener('touchend', (event) => {
        if (touchStartX === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        if (Math.abs(delta) > 60) show(current + (delta < 0 ? 1 : -1));
        touchStartX = null;
      }, { passive: true });

      document.addEventListener('wheel', (event) => {
        if (wheelLocked || document.querySelector('.panel.is-open') || Math.abs(event.deltaY) < 20) return;
        wheelLocked = true;
        show(current + (event.deltaY > 0 ? 1 : -1));
        window.setTimeout(() => { wheelLocked = false; }, 450);
      }, { passive: true });

      window.addEventListener('resize', () => {
        scaleStage();
        window.requestAnimationFrame(auditLayout);
      });
      window.addEventListener('hashchange', () => show(hashIndex(), false));
      window.addEventListener('load', () => window.requestAnimationFrame(auditLayout));

      buildOverview();
      scaleStage();
      show(hashIndex(), false);
    })();
`;

const REVEAL_CLIENT_SCRIPT = String.raw`
    (() => {
      const deck = new Reveal({
        width: 1600,
        height: 900,
        margin: 0,
        minScale: 0.1,
        maxScale: 2,
        center: false,
        controls: true,
        progress: true,
        slideNumber: "c/t",
        hash: true,
        keyboard: true,
        overview: true,
        transition: "fade",
        backgroundTransition: "fade",
        plugins: [RevealNotes],
      });

      function auditLayout() {
        const overflows = [];
        const titleOverflows = [];
        document.querySelectorAll('.reveal .slides > section.slide').forEach((slide, index) => {
          const body = slide.querySelector('.slide__body');
          const title = slide.querySelector('.slide__title');
          if (body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1) {
            overflows.push(index + 1);
          }
          if (title.scrollWidth > title.clientWidth + 1) titleOverflows.push(index + 1);
        });
        window.__deckAudit = {
          engine: 'reveal.js',
          slideCount: deck.getTotalSlides(),
          overflows,
          titleOverflows,
          activeSlide: deck.getSlidePastCount() + 1,
        };
        if (overflows.length || titleOverflows.length) console.error('Deck layout audit failed', window.__deckAudit);
      }

      deck.on('ready', auditLayout);
      deck.on('slidechanged', auditLayout);
      deck.initialize();
    })();
`;

const markdown = readFileSync(sourcePath, "utf8");
const slides = parseSlides(markdown);
if (slides.length !== 31) {
  throw new Error(`Expected 31 slides, received ${slides.length}`);
}
slides.forEach((slide, index) => {
  if (slide.number !== index + 1) {
    throw new Error(`Slide sequence breaks at ${slide.numberLabel}`);
  }
});

const slideMarkup = slides.map((slide) => renderSlide(slide, slides.length)).join("\n");
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="团队内部赋能：用工程上下文与反馈闭环指导 AI 高质量编码。">
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="./vendor/reveal.js/reveal.css">
  <title>从工程事实到可验证交付 — AI 高质量编码</title>
  <style>${STYLES}\n${REVEAL_OVERRIDES}</style>
</head>
<body>
  <!-- Generated from slides.md by build-html.mjs. -->
  <main class="reveal" aria-label="AI 高质量编码内部赋能演示"><div class="slides">${slideMarkup}
  </div></main>

  <div class="progress" aria-hidden="true" hidden><div class="progress__bar"></div></div>
  <nav class="controls" aria-label="幻灯片控制" hidden>
    <button type="button" data-action="previous" aria-label="上一页">←</button>
    <span class="controls__count" aria-live="off">01 / 23</span>
    <button type="button" data-action="next" aria-label="下一页">→</button>
    <button type="button" data-action="overview" data-secondary aria-label="总览">总览</button>
    <button type="button" data-action="notes" data-secondary aria-label="讲者备注">备注</button>
    <button type="button" data-action="fullscreen" data-secondary aria-label="全屏">全屏</button>
    <button type="button" data-action="help" data-secondary aria-label="快捷键帮助">?</button>
  </nav>

  <aside class="panel" id="notes-panel" aria-label="讲者备注" hidden>
    <div class="panel__surface">
      <div class="panel__head"><h2>讲者备注</h2><button class="panel__close" aria-label="关闭">×</button></div>
      <div class="notes__content"></div>
    </div>
  </aside>

  <aside class="panel" id="overview-panel" aria-label="幻灯片总览" hidden>
    <div class="panel__surface">
      <div class="panel__head"><h2>31 页总览</h2><button class="panel__close" aria-label="关闭">×</button></div>
      <div class="overview__grid"></div>
    </div>
  </aside>

  <aside class="panel" id="help-panel" aria-label="快捷键帮助" hidden>
    <div class="panel__surface">
      <div class="panel__head"><h2>演示快捷键</h2><button class="panel__close" aria-label="关闭">×</button></div>
      <div class="help__grid">
        <p><kbd>→</kbd><kbd>Space</kbd>下一页</p>
        <p><kbd>←</kbd>上一页</p>
        <p><kbd>Home</kbd>第一页</p>
        <p><kbd>End</kbd>最后一页</p>
        <p><kbd>O</kbd>页面总览</p>
        <p><kbd>N</kbd>讲者备注</p>
        <p><kbd>F</kbd>进入或退出全屏</p>
        <p><kbd>Esc</kbd>关闭面板</p>
      </div>
    </div>
  </aside>

  <p class="sr-only" id="live-region" aria-live="polite"></p>
  <script src="./vendor/reveal.js/reveal.js"></script>
  <script src="./vendor/reveal.js/notes.js"></script>
  <script>${REVEAL_CLIENT_SCRIPT}</script>
</body>
</html>
`;

writeFileSync(outputPath, html);
console.log(`generated ${outputPath} from ${slides.length} slides`);
