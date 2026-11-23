/* AI: penyedia (BYOK, tiap pengguna memakai kuotanya sendiri) */
const AIK=KEY+"-ai";
const PRE={
gemini:{n:"Google Gemini",base:"https://generativelanguage.googleapis.com/v1beta/openai",model:"gemini-2.5-flash",get:"https://aistudio.google.com/apikey"},
groq:{n:"Groq",base:"https://api.groq.com/openai/v1",model:"llama-3.3-70b-versatile",get:"https://console.groq.com/keys"},
openrouter:{n:"OpenRouter",base:"https://openrouter.ai/api/v1",model:"openai/gpt-oss-120b:free",get:"https://openrouter.ai/keys"},
ollama:{n:"Ollama (lokal)",base:"http://localhost:11434/v1",model:"llama3.2",nokey:1},
custom:{n:"Kustom (OpenAI-compatible)",base:"",model:""}};
let AI={cfg:{},use:{}};try{Object.assign(AI,JSON.parse(localStorage.getItem(AIK)||"{}"))}catch{}
const aiSave=()=>{try{localStorage.setItem(AIK,JSON.stringify(AI))}catch{}};
const aiCfg=id=>({...PRE[id],...(AI.cfg[id]||{})});
const aiOrder=()=>Object.keys(PRE).filter(id=>{const c=aiCfg(id);return c.on&&c.base&&c.model&&(c.key||PRE[id].nokey)});
function aiCount(id){const d=D(new Date());if(AI.use.d!==d)AI.use={d};AI.use[id]=(AI.use[id]||0)+1;aiSave()}
const aiErr=e=>e.status===429?"Jatah gratis penyedia ini habis. Coba lagi nanti.":e.status===401||e.status===403?"Key ditolak. Periksa key-nya.":e.status===404?"Model tidak ditemukan. Periksa nama model.":e.name==="TypeError"?"Tidak bisa terhubung (jaringan atau diblokir CORS).":"Gagal: "+e.message;
async function aiRun(id,prompt,signal){const c=aiCfg(id);
const r=await fetch(c.base.replace(/\/$/,"")+"/chat/completions",{method:"POST",signal,headers:{"content-type":"application/json",...(c.key?{authorization:"Bearer "+c.key}:{})},body:JSON.stringify({model:c.model,messages:[{role:"user",content:prompt}],stream:false})});
if(!r.ok){const e=new Error("HTTP "+r.status);e.status=r.status;throw e}
const j=await r.json(),t=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(!t)throw new Error("jawaban kosong");return t}
function aiStatus(){const a=aiOrder().map(i=>PRE[i].n);
$("#aist").textContent=window.claude?"AI: Claude bawaan"+(a.length?", lalu "+a.join(", "):""):a.length?"AI: "+a.join(" → ")+" (jatah gratismu sendiri)":"Mode lokal. Tekan AI untuk menambah key gratis dan mendapat jawaban AI."}
function rAI(){$("#aib").innerHTML=Object.keys(PRE).map(id=>{const p=PRE[id],c=aiCfg(id),n=AI.use[id]||0;
return `<fieldset class="aip" data-id="${id}"><legend>${p.n}</legend><label class="row"><input type="checkbox" data-f="on" ${c.on?"checked":""}> Aktifkan${n?` · ${n} tanya hari ini`:""}</label>${p.nokey?"":`<input data-f="key" type="password" autocomplete="off" placeholder="API key" value="${esc(c.key||"")}" aria-label="API key ${p.n}">`}<input data-f="model" placeholder="Nama model" value="${esc(c.model||"")}" aria-label="Model ${p.n}">${id==="custom"||id==="ollama"?`<input data-f="base" placeholder="Base URL" value="${esc(c.base||"")}" aria-label="Base URL ${p.n}">`:""}<div class="row"><button class="btn ghost" type="button" data-t="${id}">Uji koneksi</button>${p.get?`<a href="${p.get}" target="_blank" rel="noopener">Buat key gratis</a>`:""}<span class="muted" data-s></span></div></fieldset>`}).join("")}
$("#aib").addEventListener("input",e=>{const f=e.target.dataset.f,box=e.target.closest(".aip");if(!f)return;const id=box.dataset.id;AI.cfg[id]=AI.cfg[id]||{};
AI.cfg[id][f]=f==="on"?e.target.checked:e.target.value.trim();
if(f==="key"&&AI.cfg[id].on===undefined){AI.cfg[id].on=true;box.querySelector('[data-f=on]').checked=true}aiSave()});
$("#aib").addEventListener("click",async e=>{const id=e.target.dataset.t;if(!id)return;const st=e.target.parentElement.querySelector("[data-s]"),c=aiCfg(id);
if(!c.base||!c.model||(!c.key&&!PRE[id].nokey)){st.textContent="Isi key dan model dulu.";return}
st.textContent="Menguji…";try{await aiRun(id,"Balas satu kata: halo");st.textContent="Terhubung ✓"}catch(x){st.textContent=aiErr(x)}});
function openAI(){rAI();$("#aid").showModal()}
const closeAI=()=>{$("#aid").close();aiStatus()};
$("#aibtn").onclick=openAI;$("#aibtn2").onclick=openAI;$("#aix").onclick=closeAI;
$("#aid").addEventListener("click",e=>{if(e.target===$("#aid"))closeAI()});
$("#aiclr").onclick=e=>sure(e.target,()=>{AI={cfg:{},use:{}};aiSave();rAI();aiStatus();toast("Semua key dihapus.")});
