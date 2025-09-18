const q = document.getElementById("q");
const app = document.getElementById("app");
const chips = document.getElementById("chips");
const sortSel = document.getElementById("sort");
const themeSel = document.getElementById("theme");
const favOnly = document.getElementById("favOnly");
const exportBtn = document.getElementById("exportJson");
const importBtn = document.getElementById("importJson");
const fileInput = document.getElementById("fileInput");
const addFromLib = document.getElementById("addFromLib");
const toast = document.getElementById("toast");
const expandAllBtn = document.getElementById("expandAll");
const collapseAllBtn = document.getElementById("collapseAll");

const sources = [
  { id: "windows", name: "Windows", file: "data/windows.tr.json" },
  { id: "chrome", name: "Google Chrome", file: "data/chrome.tr.json" },
  { id: "vscode", name: "VS Code", file: "data/vscode.tr.json" },
];

// Sunucu erişilemezse çalışması için gömülü veri yedeği
const embeddedData = [
  {
    source: "Windows",
    groups: [
      {
        group: "Genel",
        shortcuts: [
          { desc: "Kes", keys: [["Ctrl","X"]] },
          { desc: "Kopyala", keys: [["Ctrl","C"]] },
          { desc: "Yapıştır", keys: [["Ctrl","V"],["Shift","Insert"]] },
          { desc: "Geri al", keys: [["Ctrl","Z"]] },
          { desc: "Tümünü seç", keys: [["Ctrl","A"]] },
          { desc: "Sil", keys: [["Delete"]] },
          { desc: "Yeniden yap", keys: [["Ctrl","Y"]] },
          { desc: "Ad değiştir", keys: [["F2"]] },
          { desc: "Masaüstünü göster/gizle", keys: [["Win","D"]] },
        ],
      },
      {
        group: "Pencere Yönetimi",
        shortcuts: [
          { desc: "Başlat menüsünü aç/kapat", keys: [["Win"]] },
          { desc: "Görev görünümünü aç", keys: [["Win","Tab"]] },
          { desc: "Pencereyi büyüt", keys: [["Win","Yukarı"]] },
          { desc: "Pencereyi küçült/ekrandan kaldır", keys: [["Win","Aşağı"]] },
          { desc: "Sola yasla", keys: [["Win","Sol"]] },
          { desc: "Sağa yasla", keys: [["Win","Sağ"]] },
          { desc: "Ekranlar arasında taşı", keys: [["Win","Shift","Sağ"],["Win","Shift","Sol"]] },
        ],
      },
    ],
  },
  {
    source: "Google Chrome",
    groups: [
      {
        group: "Sekmeler ve Pencereler",
        shortcuts: [
          { desc: "Yeni sekme", keys: [["Ctrl","T"]] },
          { desc: "Yeni pencere", keys: [["Ctrl","N"]] },
          { desc: "Gizli pencere", keys: [["Ctrl","Shift","N"]] },
          { desc: "Kapat: geçerli sekme", keys: [["Ctrl","W"]] },
          { desc: "Son kapatılanı yeniden aç", keys: [["Ctrl","Shift","T"]] },
          { desc: "Sekmeler arası geçiş", keys: [["Ctrl","Tab"],["Ctrl","Shift","Tab"]] },
        ],
      },
      {
        group: "Gezinme ve Arama",
        shortcuts: [
          { desc: "Adres çubuğuna git", keys: [["Ctrl","L"]] },
          { desc: "Sayfada bul", keys: [["Ctrl","F"]] },
          { desc: "Geçmiş", keys: [["Ctrl","H"]] },
          { desc: "İndirilenler", keys: [["Ctrl","J"]] },
          { desc: "Geliştirici araçları", keys: [["Ctrl","Shift","I"]] },
        ],
      },
    ],
  },
  {
    source: "VS Code",
    groups: [
      {
        group: "Düzenleme",
        shortcuts: [
          { desc: "Kes/Kopyala/Yapıştır", keys: [["Ctrl","X"],["Ctrl","C"],["Ctrl","V"]] },
          { desc: "Geri al / Yinele", keys: [["Ctrl","Z"],["Ctrl","Y"]] },
          { desc: "Satırı sil", keys: [["Ctrl","Shift","K"]] },
        ],
      },
      {
        group: "Görünüm",
        shortcuts: [
          { desc: "Tam ekran", keys: [["F11"]] },
          { desc: "Kenar çubuğu", keys: [["Ctrl","B"]] },
          { desc: "Terminali aç/kapat", keys: [["Ctrl","`"]] },
        ],
      },
    ],
  },
];

let dataset = [];
let activeSources = new Set();
let collapsedGroups = new Set();
let favorites = new Set(JSON.parse(localStorage.getItem('favorites')||'[]'));

async function load() {
  try {
    const results = await Promise.allSettled(
      sources.map((s) =>
        fetch(s.file)
          .then((r) => r.json())
          .then((groups) => ({ source: s.name, groups }))
      )
    );
    dataset = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value.groups.map((g) => ({ ...g, source: r.value.source })));
    if (dataset.length === 0) {
      dataset = embeddedData.flatMap((e) => e.groups.map((g) => ({ ...g, source: e.source })));
    }
    restoreUiState();
    buildChips();
    applyTheme();
    render(dataset);
  } catch (e) {
    dataset = embeddedData.flatMap((e) => e.groups.map((g) => ({ ...g, source: e.source })));
    restoreUiState();
    buildChips();
    applyTheme();
    render(dataset);
  }
}

function buildChips(){
  const unique = [...new Set(dataset.map(g=>g.source))];
  chips.innerHTML = "";
  unique.forEach(src=>{
    const btn = document.createElement("button");
    btn.className = "chip active";
    btn.textContent = src;
    activeSources.add(src);
    btn.addEventListener("click", ()=>{
      if(activeSources.has(src)) activeSources.delete(src); else activeSources.add(src);
      btn.classList.toggle("active");
      render(dataset);
    });
    chips.appendChild(btn);
  });
}

function highlight(text, query){
  if(!query) return text;
  try{
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return text.replace(re, '<span class="hl">$1<\/span>');
  }catch{ return text; }
}

function render(groups) {
  app.innerHTML = "";
  const query = (q.value || "").toLowerCase();
  const filtered = groups.filter(
    (g) =>
      activeSources.has(g.source) && (
      g.source.toLowerCase().includes(query) ||
      g.group.toLowerCase().includes(query) ||
      g.shortcuts.some((sc) => sc.desc.toLowerCase().includes(query)))
  );

  const favoritesOnly = favOnly?.checked;
  let base = [...filtered];
  if (favoritesOnly) {
    base = base.map(g=>({
      ...g,
      shortcuts: g.shortcuts.filter(sc=> favorites.has(keyOf(g, sc)))
    })).filter(g=> g.shortcuts.length>0);
  }

  let sorted = [...base];
  const sortBy = sortSel?.value || 'relevance';
  if (sortBy === 'group-asc') {
    sorted.sort((a,b)=> a.group.localeCompare(b.group,'tr'));
  } else if (sortBy === 'desc-asc') {
    sorted.sort((a,b)=> (a.shortcuts[0]?.desc||"").localeCompare(b.shortcuts[0]?.desc||"",'tr'));
  } else if (sortBy === 'desc-desc') {
    sorted.sort((a,b)=> (b.shortcuts[0]?.desc||"").localeCompare(a.shortcuts[0]?.desc||"",'tr'));
  }

  for (const g of sorted) {
    const sec = document.createElement("section");
    if(collapsedGroups.has(g.source+"::"+g.group)) sec.classList.add("collapsed");
    const h = document.createElement("h2");
    h.innerHTML = `${g.source} <span class="badge">${g.group}</span>`;
    h.style.cursor = "pointer";
    h.addEventListener("click", ()=>{
      const key = g.source+"::"+g.group;
      if(collapsedGroups.has(key)) collapsedGroups.delete(key); else collapsedGroups.add(key);
      sec.classList.toggle("collapsed");
    });
    sec.appendChild(h);

    const ul = document.createElement("ul");
    for (const sc of g.shortcuts) {
      const li = document.createElement("li");
      const desc = document.createElement("div");
      desc.className = "desc";
      desc.innerHTML = highlight(sc.desc, q.value);
      const keys = document.createElement("div");
      keys.className = "keys";
      for (const combo of sc.keys) {
        const k = document.createElement("span");
        k.className = "key";
        k.textContent = combo.join("+");
        k.title = "Kopyalamak için tıklayın";
        k.addEventListener("click", ()=>copyShortcut(combo));
        keys.appendChild(k);
      }
      const fav = document.createElement('button');
      fav.className = 'fav-btn'+(favorites.has(keyOf(g, sc))?' active':'');
      fav.textContent = favorites.has(keyOf(g, sc)) ? '★' : '☆';
      fav.title = 'Favorilere ekle/çıkar';
      fav.addEventListener('click', ()=> toggleFavorite(g, sc, fav));
      keys.appendChild(fav);
      li.appendChild(desc);
      li.appendChild(keys);
      ul.appendChild(li);
    }
    sec.appendChild(ul);
    app.appendChild(sec);
  }

  if (filtered.length === 0) {
    app.innerHTML = '<div class="group">Sonuç bulunamadı.</div>';
  }
}

q.addEventListener("input", () => render(dataset));
sortSel?.addEventListener('change', ()=> { saveUiState(); render(dataset); });
favOnly?.addEventListener('change', ()=> { saveUiState(); render(dataset); });
expandAllBtn.addEventListener("click", ()=>{ collapsedGroups.clear(); saveUiState(); render(dataset); });
collapseAllBtn.addEventListener("click", ()=>{
  collapsedGroups = new Set(dataset.map(g=>g.source+"::"+g.group));
  saveUiState();
  render(dataset);
});

exportBtn?.addEventListener('click', ()=>{
  const exportData = { groups: dataset };
  const blob = new Blob([JSON.stringify(exportData,null,2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'klavye-kisayollari.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn?.addEventListener('click', ()=> fileInput?.click());
fileInput?.addEventListener('change', async ()=>{
  const f = fileInput.files?.[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const json = JSON.parse(txt);
    if(Array.isArray(json.groups)){
      dataset = json.groups;
      buildChips();
      render(dataset);
      showToast('Veri içe aktarıldı');
    }else{
      showToast('Geçersiz JSON');
    }
  }catch{
    showToast('İçe aktarma başarısız');
  }finally{
    fileInput.value = '';
  }
});

addFromLib?.addEventListener('click', async ()=>{
  const lib = window.ctrlLib?.listApps?.() || [];
  if (!lib.length){ showToast('Kütüphane bulunamadı'); return; }
  // Basit seçim: ilk grup/ilk uygulama örnek olsun veya prompt ile
  const flat = [];
  lib.forEach(g=> g.apps.forEach(a=> flat.push({ group:g.group, name:a.name, file:a.file })));
  const pick = prompt('Eklenecek uygulamayı yazın (ör: Google Chrome)\n\n'+flat.map(f=>`- ${f.name}`).join('\n'));
  if(!pick) return;
  const found = flat.find(f=> f.name.toLowerCase()===pick.toLowerCase());
  if(!found){ showToast('Bulunamadı'); return; }
  const groups = window.ctrlLib?.loadApp?.(found.file) || [];
  if (!groups.length){ showToast('Yüklenemedi'); return; }
  // Mevcut dataset'e ekle
  const converted = groups.map(g=>({ ...g, source: found.name }));
  dataset = [...dataset, ...converted];
  buildChips();
  render(dataset);
  showToast(`${found.name} eklendi`);
});

function copyShortcut(combo){
  const text = combo.join("+");
  navigator.clipboard?.writeText(text).then(()=>showToast(`Kopyalandı: ${text}`)).catch(()=>showToast(text));
}

let toastTimer;
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove("show"), 1400);
}
// Electron/yerel dosya (file://) altında SW desteklenmediği için yalnızca http/https'te kaydet
if ((location.protocol === 'http:' || location.protocol === 'https:') && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
load();

// Favorites helpers
function keyOf(group, sc){
  return `${group.source}::${group.group}::${sc.desc}::${(sc.keys||[]).map(k=>k.join('+')).join('|')}`;
}
function toggleFavorite(group, sc, elem){
  const key = keyOf(group, sc);
  if (favorites.has(key)) {
    favorites.delete(key);
    elem.classList.remove('active');
    elem.textContent = '☆';
  } else {
    favorites.add(key);
    elem.classList.add('active');
    elem.textContent = '★';
  }
  localStorage.setItem('favorites', JSON.stringify([...favorites]));
}

// Theme handling
function effectiveTheme(){
  const pref = localStorage.getItem('theme') || 'system';
  if (pref === 'dark' || pref === 'light') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(){
  const theme = effectiveTheme();
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  if (themeSel) themeSel.value = localStorage.getItem('theme') || 'system';
}
themeSel?.addEventListener('change', ()=>{
  localStorage.setItem('theme', themeSel.value);
  applyTheme();
});

// Persist UI state
function saveUiState(){
  localStorage.setItem('sources', JSON.stringify([...activeSources]));
  localStorage.setItem('collapsed', JSON.stringify([...collapsedGroups]));
  localStorage.setItem('sort', sortSel?.value||'relevance');
  localStorage.setItem('favOnly', favOnly?.checked ? '1':'0');
}
function restoreUiState(){
  try{
    const s = JSON.parse(localStorage.getItem('sources')||'[]');
    if (Array.isArray(s) && s.length>0) activeSources = new Set(s);
    const c = JSON.parse(localStorage.getItem('collapsed')||'[]');
    if (Array.isArray(c)) collapsedGroups = new Set(c);
    const sort = localStorage.getItem('sort');
    if (sort && sortSel) sortSel.value = sort;
    const f = localStorage.getItem('favOnly')==='1';
    if (favOnly) favOnly.checked = f;
  }catch{}
}

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    q.focus(); q.select();
  }
});

