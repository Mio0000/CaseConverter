/* DevToolbox — shared nav: favorites, keyboard shortcuts, command palette, PWA */
(function(){
  'use strict';

  const TOOLS = [
    { href:'index.html',     label:'Case Converter', key:'1' },
    { href:'table.html',     label:'Table',          key:'2' },
    { href:'json.html',      label:'JSON Keys',      key:'3' },
    { href:'base64.html',    label:'Base64',         key:'4' },
    { href:'url.html',       label:'URL Encode',     key:'5' },
    { href:'jwt.html',       label:'JWT',            key:'6' },
    { href:'timestamp.html', label:'Timestamp',      key:'7' },
    { href:'color.html',     label:'Color',          key:'8' },
  ];

  const LS_KEY = 'dtb_favs';
  const getFavs  = () => { try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch{ return []; } };
  const saveFavs = f  => localStorage.setItem(LS_KEY, JSON.stringify(f));
  const toggleFav = href => {
    const f = getFavs(), i = f.indexOf(href);
    if(i>=0) f.splice(i,1); else f.push(href);
    saveFavs(f); buildNav();
  };

  // ── Inject shared CSS ──────────────────────────────────────────────────────
  const css = document.createElement('style');
  css.textContent = `
    /* nav augmentation */
    .nav-star{
      background:none;border:none;border-bottom:2px solid transparent;
      margin-bottom:-1px;cursor:pointer;padding:8px 0 8px 10px;
      font-size:.72rem;color:#2a2d3a;transition:color .15s;line-height:1;
      flex-shrink:0;
    }
    .nav-star:hover,.nav-star.pinned{color:#f59e0b}
    .nav-div{width:1px;background:#2a2d3a;margin:6px 4px;flex-shrink:0}
    .nav-hint{
      display:inline-block;margin-left:5px;font-size:.55rem;opacity:.3;
      border:1px solid currentColor;border-radius:3px;
      padding:0 3px;line-height:1.7;vertical-align:middle;font-style:normal;
    }
    #nav-actions{
      display:flex;align-items:center;gap:6px;
      margin-left:auto;padding:0 0 1px 8px;flex-shrink:0;
    }
    #pwa-btn{
      padding:4px 10px;font:inherit;font-size:.68rem;letter-spacing:.05em;
      background:transparent;border:1px solid var(--accent);border-radius:4px;
      color:var(--accent);cursor:pointer;transition:all .12s;white-space:nowrap;
    }
    #pwa-btn:hover{background:var(--accent);color:#fff}
    #kbd-help-btn{
      padding:5px 9px;font:inherit;font-size:.75rem;
      background:transparent;border:1px solid var(--border);border-radius:4px;
      color:var(--muted);cursor:pointer;transition:all .12s;
    }
    #kbd-help-btn:hover{border-color:var(--accent);color:var(--accent)}

    /* Keyboard help overlay */
    #kbd-overlay,#pal-overlay{
      position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;
      display:flex;align-items:center;justify-content:center;
    }
    #pal-overlay{align-items:flex-start;padding-top:14vh}
    #kbd-panel{
      background:#1a1d27;border:1px solid #2a2d3a;border-radius:10px;
      padding:24px 28px;min-width:300px;
      font-family:'SF Mono','Fira Code','Consolas',monospace;
    }
    .kbd-head{
      font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;
      color:#6b7280;margin-bottom:16px;
      display:flex;justify-content:space-between;align-items:center;
    }
    #kbd-close{
      background:none;border:none;color:#6b7280;cursor:pointer;
      font-size:1rem;line-height:1;padding:0;
    }
    #kbd-close:hover{color:#e2e8f0}
    .kbd-grid{
      display:grid;grid-template-columns:auto 1fr;gap:8px 18px;align-items:center;
    }
    .kbd-key{
      display:inline-flex;align-items:center;justify-content:center;
      background:#0f1117;border:1px solid #2a2d3a;border-radius:4px;
      padding:2px 8px;font-size:.75rem;color:#e2e8f0;white-space:nowrap;
      min-width:28px;justify-self:start;font-family:'SF Mono','Fira Code','Consolas',monospace;
    }
    .kbd-desc{font-size:.82rem;color:#a0aec0}

    /* Command palette */
    #pal-panel{
      background:#1a1d27;border:1px solid #3a3d4a;border-radius:10px;
      width:100%;max-width:460px;overflow:hidden;
      font-family:'SF Mono','Fira Code','Consolas',monospace;
      box-shadow:0 24px 64px rgba(0,0,0,.6);
    }
    #pal-inp{
      width:100%;padding:14px 18px;
      font:1rem 'SF Mono','Fira Code','Consolas',monospace;
      background:transparent;border:none;border-bottom:1px solid #2a2d3a;
      color:#e2e8f0;outline:none;
    }
    #pal-inp::placeholder{color:#4b5563}
    #pal-list{max-height:300px;overflow-y:auto;padding:4px 0}
    .pal-item{
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 18px;color:#a0aec0;text-decoration:none;
      font-size:.88rem;transition:background .08s;cursor:pointer;
    }
    .pal-item:hover,.pal-item.pal-sel{background:#2a2d3a;color:#e2e8f0}
    .pal-item.pal-fav::before{content:'★';margin-right:8px;font-size:.7rem;color:#f59e0b}
    .pal-kbd{
      font-size:.65rem;background:#0f1117;border:1px solid #2a2d3a;
      border-radius:3px;padding:1px 6px;color:#6b7280;flex-shrink:0;
    }
    #pal-empty{padding:14px 18px;color:#4b5563;font-size:.82rem}
  `;
  document.head.appendChild(css);

  // ── Build Nav ──────────────────────────────────────────────────────────────
  function buildNav(){
    const nav = document.querySelector('nav');
    if(!nav) return;
    const favs = getFavs();
    const page = location.pathname.split('/').pop() || 'index.html';

    // Sort: pinned first, preserve original order within each group
    const sorted = [...TOOLS].sort((a,b) => {
      const af = favs.includes(a.href), bf = favs.includes(b.href);
      return af===bf ? 0 : af ? -1 : 1;
    });

    nav.innerHTML = '';
    let dividerInserted = false;

    sorted.forEach(tool => {
      const pinned   = favs.includes(tool.href);
      const isActive = page===tool.href || (page===''&&tool.href==='index.html');

      // Divider between pinned and rest
      if(!pinned && !dividerInserted && favs.length){
        dividerInserted = true;
        const div = document.createElement('span');
        div.className = 'nav-div';
        nav.appendChild(div);
      }

      // Star button
      const star = document.createElement('button');
      star.className = 'nav-star' + (pinned?' pinned':'');
      star.textContent = pinned ? '★' : '☆';
      star.title = pinned ? 'Unpin from top' : 'Pin to top (Favorite)';
      star.addEventListener('click', () => toggleFav(tool.href));
      nav.appendChild(star);

      // Link
      const a = document.createElement('a');
      a.href = tool.href;
      if(isActive) a.className = 'active';
      a.textContent = tool.label;
      const hint = document.createElement('kbd');
      hint.className = 'nav-hint';
      hint.textContent = tool.key;
      a.appendChild(hint);
      nav.appendChild(a);
    });

    // Actions area (right side)
    const actions = document.createElement('div');
    actions.id = 'nav-actions';

    if(window._pwaPrompt){
      const btn = document.createElement('button');
      btn.id = 'pwa-btn';
      btn.textContent = '⊕ Install App';
      btn.addEventListener('click', () => {
        window._pwaPrompt.prompt();
        window._pwaPrompt.userChoice.then(() => { window._pwaPrompt=null; buildNav(); });
      });
      actions.appendChild(btn);
    }

    const helpBtn = document.createElement('button');
    helpBtn.id = 'kbd-help-btn';
    helpBtn.textContent = '⌨';
    helpBtn.title = 'Keyboard shortcuts  (press ?)';
    helpBtn.addEventListener('click', toggleHelp);
    actions.appendChild(helpBtn);

    nav.appendChild(actions);
  }

  // ── Keyboard Help ──────────────────────────────────────────────────────────
  let helpEl = null;
  const toggleHelp = () => helpEl ? closeHelp() : openHelp();
  const closeHelp  = () => { if(helpEl){ helpEl.remove(); helpEl=null; } };

  function openHelp(){
    closeHelp();
    helpEl = document.createElement('div');
    helpEl.id = 'kbd-overlay';
    helpEl.innerHTML = `
      <div id="kbd-panel">
        <div class="kbd-head">Keyboard Shortcuts <button id="kbd-close">✕</button></div>
        <div class="kbd-grid">
          ${TOOLS.map(t=>`<span class="kbd-key">${t.key}</span><span class="kbd-desc">${t.label}</span>`).join('')}
          <span class="kbd-key">?</span><span class="kbd-desc">Toggle this help</span>
          <span class="kbd-key">⌘K</span><span class="kbd-desc">Command palette</span>
          <span class="kbd-key">Esc</span><span class="kbd-desc">Close overlay</span>
        </div>
      </div>`;
    document.body.appendChild(helpEl);
    helpEl.addEventListener('click', e => { if(e.target===helpEl) closeHelp(); });
    document.getElementById('kbd-close').addEventListener('click', closeHelp);
  }

  // ── Command Palette ────────────────────────────────────────────────────────
  let palEl = null;
  const togglePalette = () => palEl ? closePalette() : openPalette();
  const closePalette  = () => { if(palEl){ palEl.remove(); palEl=null; } };

  function openPalette(){
    closePalette();
    palEl = document.createElement('div');
    palEl.id = 'pal-overlay';
    palEl.innerHTML = `
      <div id="pal-panel">
        <input id="pal-inp" placeholder="Jump to tool…" autocomplete="off" spellcheck="false">
        <div id="pal-list"></div>
      </div>`;
    document.body.appendChild(palEl);
    palEl.addEventListener('click', e => { if(e.target===palEl) closePalette(); });

    const palInp = document.getElementById('pal-inp');
    const palList = document.getElementById('pal-list');
    let selIdx = 0;

    function items(){ return Array.from(palList.querySelectorAll('.pal-item')); }
    function renderList(q){
      const favs = getFavs();
      selIdx = 0;
      const filtered = TOOLS.filter(t =>
        t.label.toLowerCase().includes(q.toLowerCase()) ||
        t.href.includes(q.toLowerCase())
      );
      if(!filtered.length){
        palList.innerHTML = '<div id="pal-empty">No results</div>';
        return;
      }
      palList.innerHTML = filtered.map((t,i) => `
        <a class="pal-item${i===0?' pal-sel':''}${favs.includes(t.href)?' pal-fav':''}"
           href="${t.href}" data-i="${i}">
          <span>${t.label}</span>
          <span class="pal-kbd">${t.key}</span>
        </a>`).join('');
    }

    renderList('');
    setTimeout(() => palInp.focus(), 0);

    palInp.addEventListener('input', () => renderList(palInp.value));
    palInp.addEventListener('keydown', e => {
      const list = items();
      if(e.key==='Escape'){ closePalette(); return; }
      if(e.key==='Enter'){
        const sel = palList.querySelector('.pal-sel');
        if(sel) location.href = sel.getAttribute('href');
        return;
      }
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();
        list.forEach(i=>i.classList.remove('pal-sel'));
        if(e.key==='ArrowDown') selIdx=(selIdx+1)%list.length;
        else selIdx=(selIdx-1+list.length)%list.length;
        list[selIdx]&&list[selIdx].classList.add('pal-sel');
      }
    });
  }

  // ── Global Keyboard Shortcuts ──────────────────────────────────────────────
  function inputFocused(){
    const t = document.activeElement&&document.activeElement.tagName;
    return t==='INPUT'||t==='TEXTAREA'||document.activeElement.isContentEditable;
  }

  document.addEventListener('keydown', e => {
    if(e.key==='Escape'){ closeHelp(); closePalette(); return; }
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault(); togglePalette(); return;
    }
    if(inputFocused()) return;
    if(e.key==='?'){ toggleHelp(); return; }
    const tool = TOOLS.find(t=>t.key===e.key);
    if(tool&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.shiftKey){
      location.href = tool.href;
    }
  });

  // ── PWA Install prompt ─────────────────────────────────────────────────────
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window._pwaPrompt = e;
    buildNav();
  });

  // ── Service Worker ─────────────────────────────────────────────────────────
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
