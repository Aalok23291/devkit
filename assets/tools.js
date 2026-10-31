const SITE='DevKit';
const $=s=>document.querySelector(s);
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA=s=>esc(s).replace(/"/g,'&quot;');
let IND='  ';
const jp=s=>{try{return JSON.parse(s)}catch(e){const p=/position (\d+)/.exec(e.message);let m=e.message;if(p){const b=s.slice(0,+p[1]).split('\n');m+=` (line ${b.length}, column ${b[b.length-1].length+1})`}throw new Error('Invalid JSON: '+m)}};
function px(s){const d=new DOMParser().parseFromString(s,'application/xml'),e=d.getElementsByTagName('parsererror')[0];if(e)throw new Error('Invalid XML: '+e.textContent.replace(/\s+/g,' ').trim().slice(0,200));return d}
function xs(n,i,nl,l){const p=i?i.repeat(l):'';
 if(n.nodeType===3)return p+esc(n.nodeValue.trim());
 if(n.nodeType===4)return p+'<![CDATA['+n.nodeValue+']]>';
 if(n.nodeType===8)return p+'<!--'+n.nodeValue+'-->';
 if(n.nodeType!==1)return '';
 let t=n.nodeName;for(const a of n.attributes)t+=` ${a.name}="${escA(a.value)}"`;
 const k=[...n.childNodes].filter(c=>!(c.nodeType===3&&!c.nodeValue.trim()));
 if(!k.length)return p+'<'+t+'/>';
 if(k.length===1&&k[0].nodeType===3)return p+'<'+t+'>'+esc(k[0].nodeValue.trim())+'</'+n.nodeName+'>';
 return p+'<'+t+'>'+nl+k.map(c=>xs(c,i,nl,l+1)).join(nl)+nl+p+'</'+n.nodeName+'>'}
function xfmt(s,i,nl){const d=px(s),m=/^\s*(<\?xml[^>]*\?>)/.exec(s),a=[...d.childNodes].map(n=>xs(n,i,nl,0)).filter(Boolean);if(m)a.unshift(m[1]);return a.join(nl)}
const nm=k=>{k=String(k).replace(/[^\w.\-]/g,'_');return /^[A-Za-z_]/.test(k)?k:'_'+k};
function j2x(v,k){if(Array.isArray(v))return v.map(x=>j2x(x,k)).join('');if(v===null)return `<${nm(k)}/>`;
 if(typeof v==='object')return `<${nm(k)}>`+Object.keys(v).map(c=>j2x(v[c],c)).join('')+`</${nm(k)}>`;
 return `<${nm(k)}>${esc(String(v))}</${nm(k)}>`}
function x2j(n){const o={};for(const a of n.attributes)o['@'+a.name]=a.value;
 const k=[...n.childNodes].filter(c=>c.nodeType===1||((c.nodeType===3||c.nodeType===4)&&c.nodeValue.trim()));
 if(!k.length&&!n.attributes.length)return '';
 if(k.length===1&&k[0].nodeType!==1&&!n.attributes.length)return k[0].nodeValue.trim();
 for(const c of k){if(c.nodeType!==1){o['#text']=c.nodeValue.trim();continue}
  const v=x2j(c);if(c.nodeName in o){if(!Array.isArray(o[c.nodeName]))o[c.nodeName]=[o[c.nodeName]];o[c.nodeName].push(v)}else o[c.nodeName]=v}
 return o}
const enc=s=>btoa([...new TextEncoder().encode(s)].map(c=>String.fromCharCode(c)).join(''));
const dec=s=>{s=s.trim().replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';try{return new TextDecoder().decode(Uint8Array.from(atob(s),c=>c.charCodeAt(0)))}catch(e){throw new Error('Not valid Base64 text.')}};
function csvParse(s){const r=[];let row=[],f='',q=false;
 for(let i=0;i<s.length;i++){const c=s[i];
  if(q){if(c==='"'){if(s[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true;else if(c===','){row.push(f);f=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;row.push(f);r.push(row);row=[];f=''}else f+=c}
 if(f||row.length){row.push(f);r.push(row)}return r.filter(x=>x.some(y=>y!==''))}
const csvCell=v=>{v=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const wrap=r=>({t:r});
const T=[
{id:'json',g:'{}',n:'JSON formatter',d:'Format, validate and minify JSON with clear error messages.',a:[
 ['Format',s=>JSON.stringify(jp(s),null,IND)],['Minify',s=>JSON.stringify(jp(s))],['Sort keys',s=>{const f=v=>Array.isArray(v)?v.map(f):v&&typeof v==='object'?Object.keys(v).sort().reduce((o,k)=>(o[k]=f(v[k]),o),{}):v;return JSON.stringify(f(jp(s)),null,IND)}]],ph:'{"name":"Ada","tags":["math","code"]}'},
{id:'xml',g:'<>',n:'XML formatter',d:'Pretty-print, validate and minify XML documents.',a:[['Format',s=>xfmt(s,IND,'\n')],['Minify',s=>xfmt(s,'','')]],ph:'<user id="1"><name>Ada</name></user>'},
{id:'json-xml',g:'⇄',n:'JSON ⇄ XML converter',d:'Convert JSON to XML and XML back to JSON.',a:[
 ['JSON → XML',s=>{const v=jp(s);const body=Array.isArray(v)?'<root>'+j2x(v,'item')+'</root>':j2x(v,'root');return xfmt('<?xml version="1.0" encoding="UTF-8"?>'+body,IND,'\n')}],
 ['XML → JSON',s=>{const d=px(s);return JSON.stringify({[d.documentElement.nodeName]:x2j(d.documentElement)},null,IND)}]],ph:'{"user":{"name":"Ada","age":36}}'},
{id:'yaml',g:'Y',n:'YAML converter',d:'Turn JSON into readable YAML, or YAML into JSON.',a:[
 ['JSON → YAML',s=>jsyaml.dump(jp(s),{indent:IND==='\t'?2:IND.length})],['YAML → JSON',s=>JSON.stringify(jsyaml.load(s),null,IND)]],ph:'name: Ada\ntags:\n  - math\n  - code'},
{id:'csv',g:'CSV',n:'CSV ⇄ JSON converter',d:'Turn spreadsheet-style CSV into JSON, or JSON into CSV.',a:[
 ['CSV → JSON',s=>{const r=csvParse(s);if(!r.length)throw new Error('Nothing to convert.');const h=r[0];return JSON.stringify(r.slice(1).map(x=>Object.fromEntries(h.map((k,i)=>[k,x[i]??'']))),null,IND)}],
 ['JSON → CSV',s=>{let v=jp(s);if(!Array.isArray(v))v=[v];const h=[...new Set(v.flatMap(o=>Object.keys(o)))];return [h.map(csvCell).join(','),...v.map(o=>h.map(k=>csvCell(o[k])).join(','))].join('\n')}]],ph:'name,age\nAda,36\nLinus,55'},
{id:'base64',g:'64',n:'Base64 encode & decode',d:'Convert text to Base64 and back, with full Unicode support.',a:[['Encode',enc],['Decode',dec]],ph:'Hello, world'},
{id:'url',g:'%',n:'URL encode & decode',d:'Make text safe for URLs, or read an encoded URL.',a:[['Encode',s=>encodeURIComponent(s)],['Decode',s=>{try{return decodeURIComponent(s)}catch(e){throw new Error('Not a valid encoded URL.')}}]],ph:'name=Ada Lovelace&city=São Paulo'},
{id:'jwt',g:'JWT',n:'JWT decoder',d:'Read the header and payload of a JSON Web Token.',a:[['Decode',s=>{const p=s.trim().split('.');if(p.length<2)throw new Error('A JWT has three parts separated by dots.');
 const o={header:jp(dec(p[0])),payload:jp(dec(p[1]))};if(o.payload.exp)o.expires=new Date(o.payload.exp*1000).toISOString();return JSON.stringify(o,null,IND)}]],ph:'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQWRhIn0.signature'}
];

function lineDiff(a,b){a=a.split('\n');b=b.split('\n');const n=a.length,m=b.length,L=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 const o=[];let i=0,j=0;
 while(i<n&&j<m){if(a[i]===b[j]){o.push(['=',a[i]]);i++;j++}else if(L[i+1][j]>=L[i][j+1])o.push(['-',a[i++]]);else o.push(['+',b[j++]])}
 while(i<n)o.push(['-',a[i++]]);while(j<m)o.push(['+',b[j++]]);return o}
T.push({id:'diff'});
function mount(t){
 const app=$('#tool');
 if(t.id==='diff'){
  app.innerHTML=`<div class="bar"><button class="p" id="go">Compare</button><span class="sp"></span><button id="cl">Clear</button></div>
  <div class="panes"><div class="pane"><div class="ph"><span>Original</span></div><textarea id="a" spellcheck="false" placeholder="Paste the original text"></textarea></div>
  <div class="pane"><div class="ph"><span>Changed</span></div><textarea id="b" spellcheck="false" placeholder="Paste the changed text"></textarea></div></div>
  <div class="pane diff" id="res" style="margin-top:12px"></div>
  <div id="status" role="status" aria-live="polite">Paste two versions, then click Compare.</div>
  <p class="priv">Private by design: your text stays on this device.</p>`;
  const st=$('#status'),say=(m,c)=>{st.textContent=m;st.className=c||''};
  $('#go').onclick=()=>{const a=$('#a').value,b=$('#b').value;
   if(a.split('\n').length>3000||b.split('\n').length>3000)return say('Please compare up to 3,000 lines at a time.','err');
   const d=lineDiff(a,b),ad=d.filter(x=>x[0]==='+').length,rm=d.filter(x=>x[0]==='-').length;
   $('#res').innerHTML=d.map(x=>`<div class="${x[0]==='+'?'a':x[0]==='-'?'r':''}">${x[0]==='='?' ':x[0]}  ${esc(x[1])}</div>`).join('');
   say(ad||rm?`${ad} lines added, ${rm} lines removed.`:'The two texts are identical.','ok')};
  $('#cl').onclick=()=>{$('#a').value=$('#b').value=$('#res').innerHTML='';say('Cleared.')};
  return}
 app.innerHTML=`<div class="bar">${t.a.map((a,i)=>`<button class="${i?'':'p'}" data-i="${i}">${a[0]}</button>`).join('')}<span class="sp"></span>
 <label>Indent <select id="ind"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="t">Tab</option></select></label><button id="sw">Use output as input</button></div>
 <div class="panes"><div class="pane"><div class="ph"><span>Input</span><button id="cl">Clear</button></div><textarea id="in" spellcheck="false" placeholder="${escA(t.ph)}"></textarea></div>
 <div class="pane"><div class="ph"><span>Output</span><button id="cp">Copy</button></div><textarea id="out" spellcheck="false" readonly></textarea></div></div>
 <div id="status" role="status" aria-live="polite">Paste something, then choose an action.</div>
 <p class="priv">Private by design: your text stays on this device.</p>`;
 const inp=$('#in'),out=$('#out'),st=$('#status'),say=(m,c)=>{st.textContent=m;st.className=c||''};
 $('#ind').onchange=e=>{IND=e.target.value==='t'?'\t':' '.repeat(+e.target.value)};
 const run=i=>{if(!inp.value.trim()){out.value='';return say('Paste some text first.','err')}
  try{const r=t.a[i][1](inp.value);out.value=r;say(`Done. ${inp.value.length.toLocaleString()} → ${r.length.toLocaleString()} characters.`,'ok')}
  catch(e){out.value='';say(e.message,'err')}};
 app.querySelectorAll('.bar button[data-i]').forEach(b=>b.onclick=()=>run(+b.dataset.i));
 $('#sw').onclick=()=>{if(out.value){inp.value=out.value;say('Output moved to input.')}};
 $('#cl').onclick=()=>{inp.value=out.value='';say('Cleared.');inp.focus()};
 $('#cp').onclick=async()=>{if(!out.value)return say('Nothing to copy yet.','err');
  try{await navigator.clipboard.writeText(out.value)}catch(e){out.select();document.execCommand('copy')}say('Copied to clipboard.','ok')};
 inp.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();run(0)}};
}
const cur=T.find(x=>x.id===document.body.dataset.tool);if(cur)mount(cur);
