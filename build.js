// Run with: node build.js   (regenerates every page, sitemap.xml and robots.txt)
const fs = require('fs'), path = require('path');

// ===== Edit these three lines after you buy your domain =====
const NAME = 'DevKit';
const SITE = 'https://your-domain.com';
const EMAIL = 'hello@your-domain.com';
// ============================================================
const DATE = 'October 31, 2026';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = s => esc(s).replace(/"/g, '&quot;');

const tools = [
{id:'json',slug:'json-formatter',g:'{}',name:'JSON formatter',h1:'Free JSON formatter and validator',
 desc:'Format, validate and minify JSON online. Clear errors with line and column numbers. Runs in your browser, nothing is uploaded.',
 lead:'Paste messy JSON and get clean, readable output, or squeeze it into one line.',
 steps:['Paste your JSON into the input box.','Click Format, Minify or Sort keys.','Copy the result. If the JSON is invalid, the message shows the line and column of the problem.'],
 ex:'{"name":"Ada","tags":["math","code"]}',
 faq:[['Is my JSON uploaded anywhere?','No. All processing happens in your browser, so your data never leaves your device.'],['Why does my JSON show an error?','Common causes are trailing commas, single quotes instead of double quotes, and keys without quotes. The error message points to the position.']]},
{id:'xml',slug:'xml-formatter',g:'<>',name:'XML formatter',h1:'Free XML formatter and validator',
 desc:'Pretty-print, validate and minify XML online. Catches mismatched tags and shows the parser error. Private, runs in your browser.',
 lead:'Turn one long line of XML into an indented, readable document.',
 steps:['Paste your XML into the input box.','Click Format to indent it or Minify to remove extra whitespace.','Copy the result. Invalid XML shows the parser’s error message.'],
 ex:'<user id="1"><name>Ada</name><role>admin</role></user>',
 faq:[['Does it keep comments and CDATA?','Yes. Comments, CDATA sections and the XML declaration are preserved.'],['What makes XML invalid?','Mismatched or unclosed tags, more than one root element, and unescaped characters such as & or <.']]},
{id:'json-xml',slug:'json-xml-converter',g:'⇄',name:'JSON ⇄ XML converter',h1:'JSON to XML and XML to JSON converter',
 desc:'Convert JSON to XML or XML to JSON online. Attributes map to keys that start with @. Free and private.',
 lead:'Switch between JSON and XML with one click.',
 steps:['Paste JSON or XML into the input box.','Click JSON → XML or XML → JSON.','Copy the converted result.'],
 ex:'{"user":{"name":"Ada","age":36}}',
 faq:[['How are XML attributes converted?','Attributes become keys that start with @, and mixed text becomes a #text key.'],['What happens to JSON arrays?','Each array item becomes a repeated XML element with the same name.']]},
{id:'yaml',slug:'yaml-converter',g:'Y',name:'YAML converter',h1:'JSON to YAML and YAML to JSON converter',
 desc:'Convert JSON to YAML or YAML to JSON online. Handy for config files such as Docker Compose, Kubernetes and CI pipelines. Free and private.',
 lead:'Turn JSON into readable YAML, or YAML into JSON.',
 steps:['Paste JSON or YAML into the input box.','Click JSON → YAML or YAML → JSON.','Copy the converted result.'],
 ex:'name: Ada\ntags:\n  - math\n  - code',
 faq:[['Why use YAML instead of JSON?','YAML is easier to read and allows comments, so it is common in configuration files. JSON is stricter and more widely used between programs.'],['Is YAML indentation important?','Yes. YAML uses indentation to show structure, so keep spaces consistent. Tabs are not allowed for indentation.']]},
{id:'csv',slug:'csv-json-converter',g:'CSV',name:'CSV ⇄ JSON converter',h1:'CSV to JSON and JSON to CSV converter',
 desc:'Convert CSV to JSON or JSON to CSV online. Handles quoted fields and commas inside values. Free and private.',
 lead:'Turn spreadsheet-style data into JSON, or JSON into CSV.',
 steps:['Paste CSV with a header row, or a JSON array of objects.','Click CSV → JSON or JSON → CSV.','Copy the result.'],
 ex:'name,age\nAda,36\nLinus,55',
 faq:[['Does the first row have to be headers?','Yes. For CSV → JSON, the first row supplies the key names for every object.'],['What if a value contains a comma?','Wrap it in double quotes, like "Lovelace, Ada". Quoted fields are read correctly.']]},
{id:'base64',slug:'base64-encode-decode',g:'64',name:'Base64 encode & decode',h1:'Base64 encoder and decoder',
 desc:'Encode text to Base64 or decode Base64 back to text online. Supports Unicode and URL-safe Base64. Free and private.',
 lead:'Convert text to Base64 and back, with full Unicode support.',
 steps:['Paste text or a Base64 string.','Click Encode or Decode.','Copy the result.'],
 ex:'Hello, world',
 faq:[['Is Base64 encryption?','No. Base64 only changes how data is written. Anyone can decode it, so never use it to protect secrets.'],['Does it handle URL-safe Base64?','Yes. Decoding accepts the - and _ characters used in URL-safe Base64, with or without padding.']]},
{id:'url',slug:'url-encoder-decoder',g:'%',name:'URL encode & decode',h1:'URL encoder and decoder',
 desc:'Percent-encode text for safe use in URLs, or decode an encoded URL back to readable text. Free and private.',
 lead:'Make text safe for URLs, or read an encoded one.',
 steps:['Paste text or an encoded string.','Click Encode or Decode.','Copy the result.'],
 ex:'name=Ada Lovelace&city=São Paulo',
 faq:[['Why do URLs need encoding?','Characters such as spaces, &, ? and non-English letters have special meaning or are not allowed in URLs, so they are replaced with % codes.'],['Which characters stay unchanged?','Letters, digits and a few symbols such as - _ . ~ are left as they are.']]},
{id:'jwt',slug:'jwt-decoder',g:'JWT',name:'JWT decoder',h1:'JWT decoder',
 desc:'Decode a JSON Web Token to read its header and payload, including the expiry time. Runs in your browser, the token is never sent anywhere.',
 lead:'Read what is inside a JSON Web Token.',
 steps:['Paste your token, which has three parts separated by dots.','Click Decode.','Read the header and payload. If the payload has an exp value, the expiry time is shown.'],
 ex:'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIn0.signature',
 faq:[['Does this verify the signature?','No. It only decodes the readable parts. Verifying a signature needs the secret or public key and should be done on your server.'],['Is it safe to paste a token here?','Decoding happens in your browser and nothing is uploaded. Still, avoid sharing live tokens with anyone you do not trust.']]},
{id:'diff',slug:'text-diff',g:'±',name:'Text diff checker',h1:'Text diff checker',
 desc:'Compare two pieces of text and see added and removed lines. Free, fast and private.',
 lead:'Paste two versions of a text and see exactly what changed.',
 steps:['Paste the original text on the left and the changed text on the right.','Click Compare.','Green lines were added and red lines were removed.'],
 ex:'Original:\nline one\nline two\n\nChanged:\nline one\nline 2\nline three',
 faq:[['What does the diff compare?','It compares line by line, so a small change inside a line shows as one removed line and one added line.'],['Is there a size limit?','Up to 3,000 lines on each side, which keeps the page fast.']]}
];

const fonts = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
const page = (title, desc, p, main, scripts = '', attr = '') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(desc)}">
<link rel="canonical" href="${SITE}${p}">
<meta property="og:title" content="${escA(title)}">
<meta property="og:description" content="${escA(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🧰%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body${attr}>
<header><div class="wrap nav"><a class="logo" href="/"><span class="mark">{}</span>${NAME}</a><a class="t" href="/">All tools</a></div></header>
${main}
<footer><div class="wrap"><p>${NAME} runs in your browser. Your data is never uploaded.</p><a href="/about/">About</a><a href="/privacy/">Privacy</a><a href="/contact/">Contact</a></div></footer>
${scripts}
</body>
</html>
`;
const out = (p, html) => {
  const f = path.join(__dirname, p === '/' ? 'index.html' : p.slice(1) + 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
};

// Home
const cards = tools.map(t => `<a class="card" href="/${t.slug}/"><span class="ico">${esc(t.g)}</span><span><b>${t.name}</b><span class="d">${t.lead}</span></span></a>`).join('\n');
out('/', page(`${NAME}: free JSON, XML, YAML and text tools online`, 'Free online tools to format JSON and XML, convert YAML, CSV and Base64, decode JWTs and compare text. Fast, private and runs in your browser.', '/',
`<main class="wrap"><section class="hero"><h1>Clean up your data in one click</h1><p class="lead">Free tools for JSON, XML, YAML and more. Paste, convert, copy. Everything runs in your browser.</p>
<input class="search" id="q" type="search" placeholder="Search tools, for example “yaml”" aria-label="Search tools"></section>
<div class="grid">
${cards}
<p class="empty" id="none" hidden>No tool matches that search. Try “json” or “base64”.</p>
</div>
<section class="doc"><h2>Simple tools for everyday data work</h2><p>${NAME} is a growing set of fast, free tools for developers, analysts and anyone who works with structured data. There is nothing to install and no account to create. Your text is processed on your own device and is never uploaded.</p></section></main>`,
`<script>const q=document.getElementById('q'),cs=[...document.querySelectorAll('.card')],e=document.getElementById('none');q.oninput=()=>{const v=q.value.toLowerCase();let n=0;cs.forEach(c=>{const s=c.textContent.toLowerCase().includes(v);c.hidden=!s;n+=s});e.hidden=!!n}</script>`));

// Tool pages
for (const t of tools) {
  const p = `/${t.slug}/`;
  const more = tools.filter(x => x !== t).map(x => `<a href="/${x.slug}/">${x.name}</a>`).join('');
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  out(p, page(`${t.h1} | ${NAME}`, t.desc, p,
`<main class="wrap"><a class="back" href="/">← All tools</a>
<h1 class="th">${t.h1}</h1><p class="sub">${t.lead}</p>
<div id="tool"></div>
<section class="doc">
<h2>How to use it</h2><ol>${t.steps.map(s => `<li>${s}</li>`).join('')}</ol>
<h2>Example</h2><pre>${esc(t.ex)}</pre>
<h2>Frequently asked questions</h2>
${t.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n')}
</section>
<h2 class="doc" style="margin:0 0 4px;font-size:1.1rem">More tools</h2><div class="more">${more}</div></main>
<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    (t.id === 'yaml' ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>\n' : '') + '<script src="/assets/tools.js"></script>',
    ` data-tool="${t.id}"`));
}

// Info pages
const info = (p, title, desc, body) => out(p, page(`${title} | ${NAME}`, desc, p, `<main class="wrap"><a class="back" href="/">← All tools</a><h1 class="th">${title}</h1><section class="doc" style="margin-top:16px">${body}</section></main>`));
info('/about/', 'About', `About ${NAME}.`,
`<p>${NAME} is a collection of simple, free tools for working with data: formatting JSON and XML, converting YAML and CSV, encoding Base64 and URLs, decoding JWTs and comparing text.</p>
<p>The goal is to make small everyday tasks quick. Every tool runs entirely in your browser, so what you paste stays on your device.</p>
<p>The site is supported by advertising. If you have a suggestion for a new tool, please <a href="/contact/">get in touch</a>.</p>`);
info('/privacy/', 'Privacy policy', `How ${NAME} handles your data and cookies.`,
`<p>Last updated: ${DATE}</p>
<h2>Your text</h2><p>The tools on ${NAME} process what you paste directly in your browser. We do not send it to our servers and we cannot see it.</p>
<h2>Analytics</h2><p>We may use an analytics service to count visits and understand which pages are useful. This data is aggregated and does not include the text you enter into the tools.</p>
<h2>Advertising and cookies</h2><p>We may show ads provided by third parties such as Google AdSense. These providers may use cookies to show ads based on your visits to this and other websites. You can manage ad personalization in your Google ad settings and through your browser’s cookie settings.</p>
<h2>Third-party libraries</h2><p>Pages load fonts from Google Fonts and, for the YAML tool, a code library from cdnjs. These services may receive your IP address when the page loads.</p>
<h2>Contact</h2><p>Questions about this policy can be sent to <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`);
info('/contact/', 'Contact', `Contact the ${NAME} team.`,
`<p>Found a bug, or want a tool added? Send an email to <a href="mailto:${EMAIL}">${EMAIL}</a> and we will get back to you.</p>
<p>Please include the tool name and, if possible, a short example of the text that caused the problem. Do not send passwords, tokens or other secrets.</p>`);

// SEO files
const urls = ['/', ...tools.map(t => `/${t.slug}/`), '/about/', '/privacy/', '/contact/'];
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Built', urls.length, 'pages');
