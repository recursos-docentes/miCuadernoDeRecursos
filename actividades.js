/* Actividades interactivas del Cuaderno de recursos (estilo Wordwall).
   Todas las plantillas usan el mismo contenido: una lista de pares { a, b }.
   Uso: Actividades.play(elemento, { template, pairs, onResult(puntaje, total, segundos, detalle), canReplay }) */
(function () {
  const TEMPLATES = {
    unir:       { icon: '🔗', name: 'Unir con flechas', cols: ['Concepto', 'Definición'], scored: true,
                  help: 'Tocar un concepto y después su definición para unirlos. Al terminar, «Comprobar».' },
    memotest:   { icon: '🃏', name: 'Memotest', cols: ['Carta A', 'Carta B (su pareja)'], scored: true,
                  help: 'Dar vuelta dos cartas por vez y encontrar todas las parejas.' },
    crucigrama: { icon: '✏️', name: 'Crucigrama', cols: ['Palabra', 'Pista'], scored: true,
                  help: 'Completar el crucigrama con las pistas. Al terminar, «Comprobar».' },
    sopa:       { icon: '🔎', name: 'Sopa de letras', cols: ['Palabra', 'Pista (opcional)'], scored: true,
                  help: 'Encontrar las palabras: tocar la primera letra y después la última.' },
    ahorcado:   { icon: '🪢', name: 'Ahorcado', cols: ['Palabra', 'Pista'], scored: true,
                  help: 'Adivinar cada palabra antes de cometer 6 errores.' },
    topo:       { icon: '🔨', name: 'Atrapa el topo', cols: ['Respuesta', 'Pregunta o pista'], scored: true,
                  help: 'Leer la pista y golpear el topo que tiene la respuesta correcta.' },
    globos:     { icon: '🎈', name: 'Explotar globos', cols: ['Respuesta', 'Pregunta o pista'], scored: true,
                  help: 'Leer la pista y explotar el globo con la respuesta correcta.' },
    tarjetas:   { icon: '🗂️', name: 'Tarjetas', cols: ['Frente', 'Dorso'], scored: true,
                  help: 'Pensar la respuesta, dar vuelta la tarjeta y marcar si se sabía.' },
    ruleta:     { icon: '🎡', name: 'Ruleta', cols: ['Opción', 'Respuesta (opcional)'], scored: false,
                  help: 'Girar la ruleta. Ideal para el proyector: preguntas o estudiantes al azar.' },
    caja:       { icon: '🎁', name: 'Abrir la caja', cols: ['Pregunta o desafío', 'Respuesta (opcional)'], scored: false,
                  help: 'Elegir una caja y abrirla para ver qué hay adentro.' },
    ordenar:    { icon: '🧩', name: 'Ordenar líneas', cols: ['Línea', ''], scored: true, raw: true,
                  help: 'Ordenar las líneas arrastrándolas o con las flechas ▲▼. Al terminar, «Comprobar».',
                  hint: 'Para «Ordenar líneas»: escribir las líneas en el orden correcto, una por renglón (se respetan las sangrías y el «|» no corta). Para varios ejercicios, separarlos con una línea que diga ---' },
    clasificar: { icon: '📦', name: 'Clasificar en grupos', cols: ['Elemento', 'Grupo'], scored: true,
                  help: 'Tocar un elemento y después el grupo donde va (o arrastrarlo). Al terminar, «Comprobar».' },
    vf:         { icon: '✔️', name: 'Verdadero o falso', cols: ['Afirmación', 'V o F'], scored: true,
                  help: 'Responder cada afirmación antes de que se acabe su tiempo (también con las teclas V y F).' },
    diagrama:   { icon: '🏷️', name: 'Diagrama etiquetado', cols: ['Etiqueta', 'posición'], scored: true,
                  help: 'Tocar una etiqueta y después el punto de la imagen donde va (o arrastrarla). Al terminar, «Comprobar».',
                  hint: 'Para «Diagrama etiquetado»: una línea «#imagen | link de la imagen» y después una etiqueta por renglón. Con «📍 Ubicar etiquetas» se marca dónde va cada una sobre la imagen.' }
  };
 
  /* ---------- utilidades ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = n => Math.floor(Math.random() * n);
  const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
 
  function parse(text, template) {
    // «Ordenar líneas»: cada renglón es una línea completa (se conserva la sangría y el «|» no corta)
    if (TEMPLATES[template] && TEMPLATES[template].raw) {
      return String(text || '').split(/\r?\n/).map(l => l.replace(/\s+$/, '')).filter(l => l.trim()).map(l => ({ a: l, b: '' }));
    }
    return String(text || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
      const i = l.indexOf('|');
      return i < 0 ? { a: l, b: '' } : { a: l.slice(0, i).trim(), b: l.slice(i + 1).trim() };
    }).filter(p => p.a);
  }
  /* ===== NÚCLEO DE CORRECCIÓN — idéntico en actividades.js y en Codigo.gs (no editar uno sin el otro) =====
     nVista(plantilla, pares)  → lo que ve el estudiante (sin soluciones).
     nCorregir(plantilla, pares, respuestas) → { puntaje, total, items, sol } o { error }.
     En «Con registro» la vista y la corrección las hace el servidor; en «Práctica», el navegador. */
  const VERIFICABLES = ['unir', 'clasificar', 'vf', 'ordenar', 'diagrama', 'crucigrama'];
  function nMezclar(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Palabra para crucigrama: mayúsculas, sin tildes ni espacios (la Ñ se respeta)
  function nPalabra(s) {
    return String(s || '').toUpperCase().replace(/Ñ/g, '\u0001').normalize('NFD')
      .replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'Ñ').replace(/[^A-ZÑ0-9]/g, '');
  }
  function nImgUrl(raw) {
    const u = String(raw || '').trim(); if (!u) return '';
    const id = (u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/) || [])[1];
    return id ? 'https://lh3.googleusercontent.com/d/' + id : u;
  }
  function nDiagrama(pairs) {
    const img = nImgUrl(((pairs || []).find(p => String(p.a).trim().toLowerCase() === '#imagen') || {}).b);
    const labels = (pairs || []).filter(p => p.a && String(p.a).trim()[0] !== '#').map(p => {
      const m = String(p.b || '').match(/(-?\d+(?:[.,]\d+)?)\s*[;, ]\s*(-?\d+(?:[.,]\d+)?)/);
      return { t: String(p.a).trim(), x: m ? +m[1].replace(',', '.') : null, y: m ? +m[2].replace(',', '.') : null };
    });
    return { img: img, labels: labels };
  }
  function nValorVF(v) {
    v = String(v || '').trim().toLowerCase();
    return /^(v|verdadero|true|t|si|sí|1)$/.test(v) ? true : /^(f|falso|false|no|0)$/.test(v) ? false : null;
  }
  // Pares limpios, con el mismo recorte que usa el juego (40, salvo «ordenar»)
  function nBase(t, pairs) {
    const ps = (pairs || []).filter(p => p && p.a).map(p => ({ a: String(p.a), b: String(p.b == null ? '' : p.b) }));
    return t === 'ordenar' ? ps : ps.slice(0, 40);
  }
  function nBloques(ps) {
    const blocks = []; let cur = [];
    ps.forEach(p => { if (p.a.trim() === '---') { if (cur.length) blocks.push(cur); cur = []; } else cur.push(p.a); });
    if (cur.length) blocks.push(cur);
    return blocks.filter(b => b.length > 1);
  }
  function nCrucigrama(list) {
    const words = list.map((p, k) => ({ w: nPalabra(p.a), clue: p.b || p.a, k: k })).filter(x => x.w.length > 1)
      .sort((a, b) => b.w.length - a.w.length || a.k - b.k);
    const grid = {}, placed = [];
    const key = (r, c) => r + ',' + c, get = (r, c) => grid[key(r, c)];
    function fits(w, r, c, dir) {
      const dr = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
      if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
      let inter = 0;
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i, cc = c + dc * i, cur = get(rr, cc);
        if (cur) { if (cur !== w[i]) return -1; inter++; }
        else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1; // vecinos paralelos
      }
      return inter;
    }
    function put(x, r, c, dir) {
      for (let i = 0; i < x.w.length; i++) grid[key(r + (dir === 'v' ? i : 0), c + (dir === 'h' ? i : 0))] = x.w[i];
      placed.push({ w: x.w, clue: x.clue, k: x.k, r: r, c: c, dir: dir });
    }
    words.forEach((x, idx) => {
      if (!idx) return put(x, 0, 0, 'h');
      let best = null;
      placed.forEach(p => { for (let i = 0; i < p.w.length; i++) for (let j = 0; j < x.w.length; j++) {
        if (p.w[i] !== x.w[j]) continue;
        const dir = p.dir === 'h' ? 'v' : 'h';
        const r = p.dir === 'h' ? p.r - j : p.r + i, c = p.dir === 'h' ? p.c + i : p.c - j;
        const s = fits(x.w, r, c, dir);
        if (s > 0 && (!best || s > best.s)) best = { r: r, c: c, dir: dir, s: s };
      } });
      if (best) put(x, best.r, best.c, best.dir);
      else { // sin cruce posible: se ubica suelta debajo
        const ks = Object.keys(grid).map(k => k.split(',').map(Number));
        put(x, Math.max.apply(null, ks.map(k => k[0])) + 2, Math.min.apply(null, ks.map(k => k[1])), 'h');
      }
    });
    if (!placed.length) return { placed: placed, rows: 0, cols: 0 };
    const ks = Object.keys(grid).map(k => k.split(',').map(Number));
    const rs = ks.map(k => k[0]), cs = ks.map(k => k[1]);
    const r0 = Math.min.apply(null, rs), c0 = Math.min.apply(null, cs);
    placed.forEach(p => { p.r -= r0; p.c -= c0; });
    const starts = placed.map(p => p.r * 1000 + p.c).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    placed.forEach(p => { p.num = starts.indexOf(p.r * 1000 + p.c) + 1; });
    return { placed: placed, rows: Math.max.apply(null, rs) - r0 + 1, cols: Math.max.apply(null, cs) - c0 + 1 };
  }
  const nCeldas = p => Array.from({ length: p.w.length }, (_, i) => (p.r + (p.dir === 'v' ? i : 0)) + ',' + (p.c + (p.dir === 'h' ? i : 0)));
 
  function nVista(t, pairs) {
    const ps = nBase(t, pairs);
    if (t === 'unir') return { izq: ps.map(p => p.a), der: nMezclar(ps.map(p => p.b)) };
    if (t === 'clasificar') {
      const it = ps.filter(p => p.b.trim());
      return { items: nMezclar(it.map(p => p.a)), grupos: nMezclar(it.map(p => p.b.trim()).filter((g, i, a) => a.indexOf(g) === i)) };
    }
    if (t === 'vf') return { items: nMezclar(ps.filter(p => nValorVF(p.b) !== null).map(p => p.a)) };
    if (t === 'ordenar') return { bloques: nBloques(ps).map(b => {
      let o = b.slice();
      for (let k = 0; k < 8 && o.every((x, i) => x === b[i]); k++) o = nMezclar(o);
      return o;
    }) };
    if (t === 'diagrama') {
      const d = nDiagrama(ps), pins = d.labels.filter(l => l.x != null && l.y != null);
      return { img: d.img, pins: nMezclar(pins.map(p => ({ x: p.x, y: p.y }))), etiquetas: nMezclar(pins.map(p => p.t)) };
    }
    if (t === 'crucigrama') {
      const L = nCrucigrama(ps), celdas = [];
      L.placed.forEach(p => nCeldas(p).forEach(k => { if (celdas.indexOf(k) < 0) celdas.push(k); }));
      return { filas: L.rows, cols: L.cols, celdas: celdas,
               pistas: L.placed.map(p => ({ k: p.k, num: p.num, dir: p.dir, pista: p.clue, largo: p.w.length, r: p.r, c: p.c })) };
    }
    return null;
  }
 
  function nCorregir(t, pairs, ans) {
    const ps = nBase(t, pairs), CAMBIO = { error: 'La actividad cambió o la respuesta no corresponde: recargar la página.' };
    const fin = (items, sol) => {
      const plano = [].concat.apply([], items.map(x => Array.isArray(x) ? x : [x]));
      return { puntaje: plano.filter(Boolean).length, total: plano.length, items: items, sol: sol };
    };
    const cuenta = arr => { const c = {}; arr.forEach(x => { c[x] = (c[x] || 0) + 1; }); return c; };
    if (t === 'crucigrama') {
      if (!ans || typeof ans !== 'object' || Array.isArray(ans)) return CAMBIO;
      const L = nCrucigrama(ps);
      return fin(L.placed.map(p => nCeldas(p).every((k, i) => nPalabra(ans[k]).slice(-1) === p.w[i])), L.placed.map(p => p.w));
    }
    const A = Array.isArray(ans) ? ans : null;
    if (!A) return CAMBIO;
    if (t === 'unir') {
      if (A.length !== ps.length) return CAMBIO;
      const c = cuenta(ps.map(p => p.b));      // cada texto de la derecha se usa a lo sumo las veces que aparece
      for (let i = 0; i < A.length; i++) if (A[i] != null) { const s = String(A[i]); if (!c[s]) return CAMBIO; c[s]--; }
      return fin(ps.map((p, i) => A[i] != null && String(A[i]) === p.b), ps.map(p => p.b));
    }
    if (t === 'clasificar' || t === 'vf') {
      const base = t === 'vf'
        ? ps.map(p => ({ t: p.a, s: nValorVF(p.b) })).filter(x => x.s !== null)
        : ps.filter(p => p.b.trim()).map(p => ({ t: p.a, s: p.b.trim() }));
      if (A.length !== base.length) return CAMBIO;
      const usado = base.map(() => false), asig = A.map(() => -1);
      const rta = x => (x && x.r != null) ? (t === 'vf' ? x.r === true || x.r === 'true' : String(x.r)) : null;
      // primero las coincidencias exactas (así los textos repetidos no se perjudican), después el resto
      A.forEach((x, i) => { const j = base.findIndex((b, k) => !usado[k] && b.t === String(x && x.t) && b.s === rta(x)); if (j >= 0) { usado[j] = true; asig[i] = j; } });
      for (let i = 0; i < A.length; i++) if (asig[i] < 0) {
        const j = base.findIndex((b, k) => !usado[k] && b.t === String(A[i] && A[i].t));
        if (j < 0) return CAMBIO;
        usado[j] = true; asig[i] = j;
      }
      return fin(A.map((x, i) => rta(x) !== null && base[asig[i]].s === rta(x)), asig.map(j => base[j].s));
    }
    if (t === 'ordenar') {
      const bl = nBloques(ps);
      if (A.length !== bl.length) return CAMBIO;
      const items = [];
      for (let k = 0; k < bl.length; k++) {
        const a = Array.isArray(A[k]) ? A[k].map(String) : null, b = bl[k];
        if (!a || a.length !== b.length || a.slice().sort().join('\n') !== b.slice().sort().join('\n')) return CAMBIO;
        items.push(a.map((x, i) => x === b[i]));
      }
      return fin(items, bl);
    }
    if (t === 'diagrama') {
      const pins = nDiagrama(ps).labels.filter(l => l.x != null && l.y != null);
      if (A.length !== pins.length) return CAMBIO;
      const c = cuenta(pins.map(p => p.t)), usado = pins.map(() => false), items = [], sol = [];
      for (let i = 0; i < A.length; i++) {
        const x = A[i] || {};
        if (x.t != null) { const s = String(x.t); if (!c[s]) return CAMBIO; c[s]--; }
        const j = pins.findIndex((p, k) => !usado[k] && p.x === Number(x.x) && p.y === Number(x.y));
        if (j < 0) return CAMBIO;
        usado[j] = true; items.push(x.t != null && String(x.t) === pins[j].t); sol.push(pins[j].t);
      }
      return fin(items, sol);
    }
    return { error: 'Esta plantilla no se corrige en el servidor.' };
  }
  /* ===== FIN DEL NÚCLEO ===== */
 
  const word = nPalabra, imgUrl = nImgUrl, diagramOf = nDiagrama;
  const format = pairs => (pairs || []).map(p => p.b ? `${p.a} | ${p.b}` : p.a).join('\n');
 
  /* ---------- estilos (una sola vez) ---------- */
  const CSS = `
  .act { font-family: var(--hand, 'Patrick Hand', cursive); color: var(--ink, #1f2a44); }
  .act-head { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; margin-bottom: 10px; }
  .act-head b { font-family: var(--script, cursive); font-size: 1.8rem; color: var(--ink-blue, #1d4ea0); }
  .act-head span { color: var(--ink-soft, #5b6478); font-size: 1.05rem; }
  .act-head .act-timer { margin-left: auto; font: 700 1.2rem system-ui, sans-serif; color: var(--ink, #1f2a44); background: #eef1f6; border-radius: 999px; padding: 2px 12px; }
  .act-head .act-timer.low { color: #fff; background: #a3222c; }
  .act-stage { position: relative; background: #fff; border: 2px solid var(--ink-blue, #1d4ea0); border-radius: 10px; padding: 16px; min-height: 260px; box-shadow: 3px 4px 0 rgba(29,78,160,.12); }
  .act-btn { font-family: inherit; font-size: 1.1rem; border: 0; border-radius: 6px; padding: 7px 16px; background: var(--ink-blue, #1d4ea0); color: #fff; cursor: pointer; box-shadow: 0 2px 0 rgba(0,0,0,.15); }
  .act-btn.alt { background: #eef1f6; color: var(--ink, #1f2a44); }
  .act-btn:disabled { opacity: .5; cursor: default; }
  .act-bar { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 14px; }
  .act-info { text-align: center; font-size: 1.15rem; color: var(--ink-soft, #5b6478); margin: 6px 0; }
  .act-prompt { text-align: center; font-size: 1.5rem; margin: 4px 0 12px; min-height: 2em; }
  .act-end { position: absolute; inset: 0; background: rgba(255,253,243,.97); display: grid; place-items: center; text-align: center; border-radius: 8px; z-index: 5; }
  .act-end h3 { font-family: var(--script, cursive); font-size: 2.6rem; margin: 0; color: var(--ink-blue, #1d4ea0); }
  .act-end .big { font-size: 2rem; margin: 6px 0 12px; }
  .ok { --st: #2f6f4f; } .bad { --st: #a3222c; }
  /* unir */
  .act-unir { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 90px; }
  .act-unir .col { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
  .act-chip { font-family: inherit; font-size: 1.1rem; text-align: left; background: #fffbe0; border: 2px solid #e2d48a; border-radius: 8px; padding: 8px 12px; cursor: pointer; color: inherit; }
  .act-chip.sel { border-color: var(--ink-blue, #1d4ea0); background: #e8f0ff; }
  .act-chip.ok { border-color: var(--st); background: #e3f3ea; } .act-chip.bad { border-color: var(--st); background: #fdecec; }
  .act-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: visible; }
  /* memotest */
  .act-memo { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .act-card { perspective: 600px; height: 100px; cursor: pointer; border: 0; background: none; padding: 0; font: inherit; }
  .act-card .in { position: relative; width: 100%; height: 100%; transition: transform .35s; transform-style: preserve-3d; }
  .act-card.open .in, .act-card.done .in { transform: rotateY(180deg); }
  .act-card .f, .act-card .bk { position: absolute; inset: 0; border-radius: 8px; display: grid; place-items: center; padding: 6px; backface-visibility: hidden; font-size: 1.05rem; text-align: center; overflow: hidden; }
  .act-card .f { background: repeating-linear-gradient(45deg, #1d4ea0 0 10px, #2a5fb8 10px 20px); color: #fff; font-size: 1.8rem; }
  .act-card .bk { background: #fffbe0; border: 2px solid #e2d48a; transform: rotateY(180deg); }
  .act-card.done .bk { background: #e3f3ea; border-color: #9cc9ae; }
  /* crucigrama */
  .act-cw { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; }
  .act-cw table { border-collapse: collapse; }
  .act-cw td { width: 32px; height: 32px; padding: 0; position: relative; }
  .act-cw td.l { border: 1.5px solid #1f2a44; background: #fff; }
  .act-cw td input { width: 100%; height: 100%; border: 0; text-align: center; font: 700 1.1rem system-ui, sans-serif; text-transform: uppercase; background: transparent; padding: 0; color: #1f2a44; }
  .act-cw td input:focus { background: #e8f0ff; outline: none; }
  .act-cw td.ok { background: #e3f3ea; } .act-cw td.bad { background: #fdecec; }
  .act-cw td .n { position: absolute; top: 0; left: 2px; font: 9px system-ui, sans-serif; color: #5b6478; pointer-events: none; }
  .act-cw .clues { flex: 1; min-width: 220px; font-size: 1.05rem; }
  .act-cw .clues h4 { margin: 0 0 4px; font-family: var(--script, cursive); font-size: 1.4rem; color: var(--ink-blue, #1d4ea0); }
  .act-cw .clues ol { margin: 0 0 10px; padding-left: 0; list-style: none; }
  .act-cw .clues li.ok { color: #2f6f4f; text-decoration: line-through; }
  /* sopa */
  .act-ws { display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start; justify-content: center; }
  .act-ws .grid { display: grid; gap: 2px; user-select: none; }
  .act-ws .grid button { width: 30px; height: 30px; border: 0; border-radius: 4px; background: #f4f6fa; font: 700 1rem system-ui, sans-serif; color: #1f2a44; cursor: pointer; padding: 0; }
  .act-ws .grid button.start { background: #ffd66b; } .act-ws .grid button.found { background: #bfe6c9; }
  .act-ws ul { list-style: none; padding: 0; margin: 0; font-size: 1.15rem; min-width: 160px; }
  .act-ws li.ok { color: #2f6f4f; text-decoration: line-through; }
  /* ahorcado */
  .act-hm { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; align-items: center; }
  .act-hm .word { font: 700 1.8rem system-ui, sans-serif; letter-spacing: 8px; text-align: center; margin: 8px 0; word-break: break-all; }
  .act-keys { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; max-width: 520px; margin: 0 auto; }
  .act-keys button { width: 36px; height: 38px; font: 700 1rem system-ui, sans-serif; border: 1.5px solid #c9c3b0; background: #fff; border-radius: 6px; cursor: pointer; }
  .act-keys button.hit { background: #e3f3ea; border-color: #9cc9ae; } .act-keys button.miss { background: #fdecec; border-color: #e9a9ae; }
  /* topo y globos */
  .act-field { position: relative; height: 340px; border-radius: 8px; overflow: hidden; }
  .act-field.topo { background: linear-gradient(#bfe6ff 0 30%, #9ccc65 30%); display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; padding: 40px 10px 10px; gap: 10px; }
  .act-hole { position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: center; }
  .act-hole::after { content: ""; position: absolute; bottom: 0; width: 80%; height: 24px; background: #5d4037; border-radius: 50%; }
  .act-mole { position: relative; z-index: 1; margin-bottom: 10px; background: #8d6e63; color: #fff; border: 0; border-radius: 40px 40px 10px 10px; padding: 14px 10px 10px; min-width: 90px; max-width: 95%; font: 1rem var(--hand, cursive); cursor: pointer; transform: translateY(110%); transition: transform .2s; }
  .act-mole::before { content: "👀"; display: block; font-size: 1.1rem; }
  .act-mole.up { transform: translateY(0); }
  .act-field.globos { background: linear-gradient(#cfeaff, #fff); }
  .act-balloon { position: absolute; bottom: -120px; width: 104px; min-height: 96px; border-radius: 50% 50% 46% 46%; border: 0; color: #1f2a44; font: 1rem var(--hand, cursive); padding: 10px 8px; cursor: pointer; display: grid; place-items: center; text-align: center; animation: act-rise linear forwards; box-shadow: inset -8px -10px 0 rgba(0,0,0,.08); }
  .act-balloon::after { content: ""; position: absolute; bottom: -26px; left: 50%; width: 1px; height: 26px; background: #888; }
  @keyframes act-rise { to { transform: translateY(-480px); } }
  .act-pop { animation: act-pop .25s forwards !important; }
  @keyframes act-pop { to { transform: scale(1.6); opacity: 0; } }
  .act-shake { animation: act-shake .3s; }
  @keyframes act-shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .act-score { position: absolute; top: 8px; right: 12px; z-index: 3; background: rgba(255,255,255,.85); border-radius: 999px; padding: 2px 12px; font-size: 1.1rem; }
  /* tarjetas */
  .act-flash { perspective: 900px; max-width: 520px; height: 240px; margin: 0 auto; cursor: pointer; }
  .act-flash .in { position: relative; width: 100%; height: 100%; transition: transform .45s; transform-style: preserve-3d; }
  .act-flash.flip .in { transform: rotateY(180deg); }
  .act-flash .f, .act-flash .bk { position: absolute; inset: 0; border-radius: 12px; display: grid; place-items: center; padding: 20px; text-align: center; font-size: 1.5rem; backface-visibility: hidden; box-shadow: 2px 6px 14px rgba(0,0,0,.15); overflow: auto; }
  .act-flash .f { background: #fff1a8; } .act-flash .bk { background: #cfeaff; transform: rotateY(180deg); }
  /* ruleta */
  .act-wheel { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; align-items: center; }
  .act-wheel .wrap { position: relative; width: min(380px, 80vw); }
  .act-wheel canvas { width: 100%; height: auto; display: block; }
  .act-wheel .pin { position: absolute; top: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 14px solid transparent; border-right: 14px solid transparent; border-top: 26px solid #a3222c; }
  .act-wheel .res { min-width: 220px; max-width: 360px; text-align: center; font-size: 1.4rem; }
  /* caja */
  .act-boxes { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 12px; }
  .act-box { height: 86px; border: 0; border-radius: 10px; font: 700 1.8rem var(--script, cursive); color: #fff; cursor: pointer; background: linear-gradient(135deg, #e85d75, #c2185b); box-shadow: 0 4px 0 rgba(0,0,0,.2); position: relative; }
  .act-box::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 10px; transform: translateX(-50%); background: #ffd54f; }
  .act-box span { position: relative; }
  .act-box.used { background: #cfd5df; box-shadow: none; } .act-box.used::before { display: none; }
  .act-reveal { margin-top: 14px; text-align: center; font-size: 1.5rem; background: #fffbe0; border: 2px dashed #e2d48a; border-radius: 10px; padding: 14px; }
  .act-reveal .ans { color: var(--ink-blue, #1d4ea0); margin-top: 8px; }
  /* ordenar líneas */
  .act-parsons { list-style: none; margin: 0 auto; padding: 0; max-width: 760px; display: flex; flex-direction: column; gap: 6px; }
  .act-parsons li { display: flex; align-items: center; gap: 8px; background: #f7f9fc; border: 2px solid #d5dce8; border-radius: 8px; padding: 6px 8px; cursor: grab; }
  .act-parsons li.drag { opacity: .4; } .act-parsons li.over { border-color: #1d4ea0; border-style: dashed; }
  .act-parsons li.ok { border-color: #2f6f4f; background: #e3f3ea; } .act-parsons li.bad { border-color: #a3222c; background: #fdecec; }
  .act-parsons .grip { color: #9aa5b8; font-size: 1.1rem; user-select: none; }
  .act-parsons code { flex: 1; font: 1rem ui-monospace, Consolas, monospace; white-space: pre; overflow-x: auto; color: #1f2a44; }
  .act-parsons .mv button { border: 0; background: #e7ecf4; border-radius: 5px; width: 30px; height: 28px; cursor: pointer; font-size: .85rem; }
  .act-parsons .mv button:disabled { opacity: .3; cursor: default; }
  /* clasificar */
  .act-sort .pool { display: flex; flex-wrap: wrap; gap: 8px; min-height: 52px; padding: 10px; border: 2px dashed #c9d1de; border-radius: 10px; margin-bottom: 12px; }
  .act-sort .bins { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
  .act-sort .bin { border: 2px solid #c9d1de; border-radius: 10px; min-height: 130px; padding: 8px; background: var(--bc, #f7f9fc); cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
  .act-sort .bin h4 { margin: 0 0 4px; font-family: var(--script, cursive); font-size: 1.5rem; text-align: center; }
  .act-sort .bin.over, .act-sort .pool.over { border-color: #1d4ea0; border-style: dashed; }
  .act-sort .chip2 { font-family: inherit; font-size: 1.05rem; background: #fff; border: 2px solid #c9d1de; border-radius: 999px; padding: 4px 12px; cursor: grab; color: inherit; }
  .act-sort .chip2.sel { border-color: #1d4ea0; background: #e8f0ff; }
  .act-sort .chip2.ok { border-color: #2f6f4f; background: #e3f3ea; } .act-sort .chip2.bad { border-color: #a3222c; background: #fdecec; }
  .act-sort .pool:empty::before { content: "Todo clasificado"; color: #8a93a6; }
  /* verdadero o falso */
  .act-vf { max-width: 640px; margin: 0 auto; text-align: center; }
  .act-vf .st { font-size: 1.6rem; min-height: 4.5em; display: grid; place-items: center; padding: 10px; border-radius: 10px; transition: background .2s; }
  .act-vf .st.ok { background: #e3f3ea; } .act-vf .st.bad { background: #fdecec; }
  .act-vf .bar { height: 8px; background: #e7ecf4; border-radius: 99px; overflow: hidden; margin: 8px 0 14px; }
  .act-vf .bar i { display: block; height: 100%; background: #1d4ea0; transform-origin: left; }
  .act-vf .btns { display: flex; gap: 14px; justify-content: center; }
  .act-vf .btns button { font: 700 1.3rem var(--hand, cursive); border: 0; border-radius: 10px; padding: 14px 26px; cursor: pointer; color: #fff; }
  .act-vf .btns [data-v="1"] { background: #2f6f4f; } .act-vf .btns [data-v="0"] { background: #a3222c; }
  /* diagrama etiquetado */
  .act-dg .pic { position: relative; max-width: 900px; margin: 0 auto; border-radius: 8px; overflow: hidden; border: 1px solid #d5dce8; background: #fff; }
  .act-dg .pic img { display: block; width: 100%; height: auto; user-select: none; -webkit-user-drag: none; }
  .act-dg .pin { position: absolute; transform: translate(-50%, -50%); border: 2px solid #1d4ea0; background: #fff; color: #1d4ea0; border-radius: 999px;
    min-width: 30px; height: 30px; padding: 0 8px; font: 700 .95rem system-ui, sans-serif; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,.25); white-space: nowrap; }
  .act-dg .pin.filled { background: #fff7d6; color: #1f2a44; font: 1rem var(--hand, cursive); border-color: #c9a227; }
  .act-dg .pin.over { outline: 3px dashed #1d4ea0; }
  .act-dg .pin.ok { background: #e3f3ea; border-color: #2f6f4f; } .act-dg .pin.bad { background: #fdecec; border-color: #a3222c; }
  .act-dg .pin .fix { display: block; font-size: .75rem; color: #2f6f4f; }
  .act-dg .bank { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 12px 0 0; min-height: 40px; }
  .act-dg .bank:empty::before { content: "Todas las etiquetas ubicadas"; color: #8a93a6; }
  .act-dg .lab { font-family: inherit; font-size: 1.05rem; background: #fff; border: 2px solid #c9d1de; border-radius: 999px; padding: 4px 12px; cursor: grab; color: inherit; }
  .act-dg .lab.sel { border-color: #1d4ea0; background: #e8f0ff; }
  @media (max-width: 600px) { .act-unir { gap: 10px 40px; } .act-ws .grid button { width: 24px; height: 24px; font-size: .85rem; } .act-cw td { width: 26px; height: 26px; } }
  `;
  function injectCss() {
    if (document.getElementById('act-css')) return;
    const st = document.createElement('style'); st.id = 'act-css'; st.textContent = CSS; document.head.appendChild(st);
  }
 
  /* Las plantillas verificables reciben V = nVista(...) (sin soluciones) y corrigen con ctx.corregir(respuestas),
     que en práctica corrige acá y en «Con registro» lo hace el servidor. ctx.practica = true solo en práctica. */
 
  /* ---------- 1. Unir con flechas ---------- */
  function unir(root, V, done, ctx) {
    const n = V.izq.length;
    const COLORS = ['#1d4ea0', '#c2185b', '#2f6f4f', '#e67e22', '#6a1b9a', '#00838f', '#795548', '#5d6d7e'];
    root.innerHTML = `<div class="act-unir"><svg class="act-lines"></svg>
      <div class="col">${V.izq.map((t, i) => `<button class="act-chip" data-l="${i}">${esc(t)}</button>`).join('')}</div>
      <div class="col">${V.der.map((t, j) => `<button class="act-chip" data-r="${j}">${esc(t)}</button>`).join('')}</div></div>
      <div class="act-bar"><button class="act-btn" data-check>${ctx.practica ? 'Comprobar' : 'Entregar'}</button></div>`;
    const box = root.querySelector('.act-unir'), svg = root.querySelector('svg');
    const links = {}; let selL = null, selR = null, checked = false, res = null;
    function draw() {
      const b = box.getBoundingClientRect();
      svg.innerHTML = Object.entries(links).map(([l, r]) => {
        const L = box.querySelector(`[data-l="${l}"]`).getBoundingClientRect(), R = box.querySelector(`[data-r="${r}"]`).getBoundingClientRect();
        const x1 = L.right - b.left, y1 = L.top + L.height / 2 - b.top, x2 = R.left - b.left, y2 = R.top + R.height / 2 - b.top;
        const col = res ? (res.items[l] ? '#2f6f4f' : '#a3222c') : COLORS[l % COLORS.length];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${x1}" cy="${y1}" r="5" fill="${col}"/><circle cx="${x2}" cy="${y2}" r="5" fill="${col}"/>`;
      }).join('');
    }
    function link(l, r) {
      for (const k in links) if (links[k] === r) delete links[k];
      links[l] = r; selL = selR = null;
      box.querySelectorAll('.sel').forEach(e => e.classList.remove('sel'));
      draw();
    }
    root.addEventListener('click', e => {
      if (checked) return;
      const l = e.target.closest('[data-l]'), r = e.target.closest('[data-r]');
      if (l) { box.querySelectorAll('[data-l].sel').forEach(x => x.classList.remove('sel')); selL = Number(l.dataset.l); l.classList.add('sel'); if (selR != null) link(selL, selR); }
      if (r) { box.querySelectorAll('[data-r].sel').forEach(x => x.classList.remove('sel')); selR = Number(r.dataset.r); r.classList.add('sel'); if (selL != null) link(selL, selR); }
      if (e.target.closest('[data-check]')) check(1400);
    });
    function check(wait) {
      if (checked) return; checked = true;
      ctx.corregir(V.izq.map((_, i) => links[i] != null ? V.der[links[i]] : null)).then(R => {
        res = R;
        V.izq.forEach((_, i) => box.querySelector(`[data-l="${i}"]`).classList.add(R.items[i] ? 'ok' : 'bad'));
        draw();
        ctx.later(() => done(R.puntaje, R.total, ''), wait);
      });
    }
    ctx.onTimeout = () => check(0);
    ctx.on(window, 'resize', draw);
  }
 
 
  /* ---------- 2. Memotest ---------- */
  function memotest(root, pairs, done, ctx) {
    const n = pairs.length;
    const cards = shuffle(pairs.flatMap((p, i) => [{ i, t: p.a }, { i, t: p.b || p.a }]));
    root.innerHTML = `<div class="act-info">Intentos: <b data-tries>0</b> · Parejas: <b data-found>0</b> de ${n}</div>
      <div class="act-memo">${cards.map((c, k) => `<button class="act-card" data-k="${k}"><div class="in"><div class="f">?</div><div class="bk">${esc(c.t)}</div></div></button>`).join('')}</div>
      <div class="act-bar"><button class="act-btn alt" data-finish>Terminar</button></div>`;
    let open = [], tries = 0, found = 0, busy = false;
    // puntaje: parejas encontradas, descontando los intentos de más (perfecto = un intento por pareja)
    const score = () => Math.round(found * found / Math.max(tries, 1));
    const finishNow = () => done(score(), n, `${found} de ${n} parejas en ${tries} intentos`);
    ctx.onTimeout = finishNow;
    root.addEventListener('click', e => {
      if (e.target.closest('[data-finish]')) {
        if (found < n && !confirm(`Faltan ${n - found} parejas. ¿Terminar igual? Se guarda lo hecho hasta ahora.`)) return;
        return finishNow();
      }
      const el = e.target.closest('.act-card'); if (!el || busy || el.classList.contains('open') || el.classList.contains('done')) return;
      el.classList.add('open'); open.push(el);
      if (open.length < 2) return;
      tries++; root.querySelector('[data-tries]').textContent = tries;
      const [x, y] = open, cx = cards[x.dataset.k], cy = cards[y.dataset.k];
      if (cx.i === cy.i) {
        x.classList.add('done'); y.classList.add('done'); open = []; found++;
        root.querySelector('[data-found]').textContent = found;
        if (found === n) ctx.later(() => done(score(), n, `${tries} intentos`), 700);
      } else {
        busy = true;
        ctx.later(() => { x.classList.remove('open'); y.classList.remove('open'); open = []; busy = false; }, 900);
      }
    });
  }
 
  /* ---------- 3. Crucigrama ---------- */
  function crucigrama(root, V, done, ctx) {
    if (!V.pistas.length) { root.innerHTML = '<p class="act-info">Hacen falta palabras de 2 letras o más.</p>'; return; }
    const isCell = {}, nums = {};
    V.celdas.forEach(k => { isCell[k] = true; });
    V.pistas.forEach(p => { nums[p.r + ',' + p.c] = p.num; });
    const cellsOf = p => Array.from({ length: p.largo }, (_, i) => (p.r + (p.dir === 'v' ? i : 0)) + ',' + (p.c + (p.dir === 'h' ? i : 0)));
    let html = '<table aria-label="Crucigrama">';
    for (let r = 0; r < V.filas; r++) {
      html += '<tr>';
      for (let c = 0; c < V.cols; c++) {
        const k = r + ',' + c;
        html += isCell[k] ? `<td class="l" data-c="${k}">${nums[k] ? `<span class="n">${nums[k]}</span>` : ''}<input maxlength="1" data-c="${k}" aria-label="Casilla"></td>` : '<td></td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    const clue = d => V.pistas.map((p, i) => ({ p, i })).filter(x => x.p.dir === d).sort((a, b) => a.p.num - b.p.num)
      .map(({ p, i }) => `<li data-w="${i}"><b>${p.num}.</b> ${esc(p.pista)} <small>(${p.largo})</small></li>`).join('');
    root.innerHTML = `<div class="act-cw"><div style="overflow:auto;max-width:100%">${html}</div>
      <div class="clues"><h4>Horizontales</h4><ol>${clue('h')}</ol><h4>Verticales</h4><ol>${clue('v')}</ol></div></div>
      <div class="act-bar"><button class="act-btn" data-check>${ctx.practica ? 'Comprobar' : 'Entregar'}</button></div>`;
    let dir = 'h', busy = false, closed = false;
    root.addEventListener('focusin', e => { const inp = e.target.closest('input[data-c]'); if (inp) inp.select(); });
    root.addEventListener('input', e => {
      const inp = e.target.closest('input[data-c]'); if (!inp) return;
      inp.value = word(inp.value).slice(-1);
      if (!inp.value) return;
      const [r, c] = inp.dataset.c.split(',').map(Number);
      const nextH = root.querySelector(`input[data-c="${r},${c + 1}"]`), nextV = root.querySelector(`input[data-c="${r + 1},${c}"]`);
      if (dir === 'h' && !nextH && nextV) dir = 'v'; else if (dir === 'v' && !nextV && nextH) dir = 'h';
      const nx = dir === 'h' ? nextH : nextV; if (nx) nx.focus();
    });
    root.addEventListener('keydown', e => {
      const inp = e.target.closest('input[data-c]'); if (!inp) return;
      const [r, c] = inp.dataset.c.split(',').map(Number);
      const mv = { ArrowRight: [0, 1, 'h'], ArrowLeft: [0, -1, 'h'], ArrowDown: [1, 0, 'v'], ArrowUp: [-1, 0, 'v'] }[e.key];
      if (mv) { const t = root.querySelector(`input[data-c="${r + mv[0]},${c + mv[1]}"]`); if (t) { dir = mv[2]; t.focus(); e.preventDefault(); } }
      if (e.key === 'Backspace' && !inp.value) { const t = root.querySelector(dir === 'h' ? `input[data-c="${r},${c - 1}"]` : `input[data-c="${r - 1},${c}"]`); if (t) { t.focus(); e.preventDefault(); } }
    });
    // final = true: es la entrega (siempre en «Con registro»; en práctica, al terminar o al acertar todo)
    function check(final) {
      if (busy || closed) return; busy = true;
      const ans = {}; root.querySelectorAll('input[data-c]').forEach(i => { ans[i.dataset.c] = i.value; });
      if (!ctx.practica) final = true;
      if (final) { closed = true; root.querySelectorAll('input[data-c]').forEach(i => { i.readOnly = true; }); }
      ctx.corregir(ans).then(R => {
        busy = false;
        root.querySelectorAll('td.l').forEach(td => td.classList.remove('ok', 'bad'));
        V.pistas.forEach((p, i) => {
          const good = !!R.items[i];
          root.querySelector(`li[data-w="${i}"]`).classList.toggle('ok', good);
          cellsOf(p).forEach(k => { const td = root.querySelector(`td[data-c="${k}"]`); if (good) { td.classList.remove('bad'); td.classList.add('ok'); } else if (!td.classList.contains('ok')) td.classList.add('bad'); });
        });
        if (final || R.puntaje === R.total) { closed = true; ctx.later(() => done(R.puntaje, R.total, ''), 900); }
        else root.querySelector('.act-bar').innerHTML = `<span class="act-info">${R.puntaje} de ${R.total} correctas.</span>
          <button class="act-btn alt" data-check>Comprobar de nuevo</button><button class="act-btn" data-finish>Terminar</button>`;
      });
    }
    root.addEventListener('click', e => {
      if (e.target.closest('[data-check]')) {
        if (!ctx.practica && !confirm('¿Entregar el crucigrama? Se corrige una sola vez.')) return;
        check(false);
      }
      if (e.target.closest('[data-finish]')) check(true);
    });
    ctx.onTimeout = () => check(true);
  }
 
 
  /* ---------- 4. Sopa de letras ---------- */
  function sopa(root, pairs, done, ctx) {
    const list = pairs.map(p => ({ w: word(p.a), label: p.b || p.a })).filter(x => x.w.length > 1).slice(0, 18);
    if (!list.length) { root.innerHTML = '<p class="act-info">Hacen falta palabras de 2 letras o más.</p>'; return; }
    const longest = Math.max(...list.map(x => x.w.length)), letters = list.reduce((s, x) => s + x.w.length, 0);
    const N = Math.min(16, Math.max(8, longest + 1, Math.ceil(Math.sqrt(letters * 2.3))));
    const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
    const g = Array.from({ length: N }, () => Array(N).fill(''));
    const placed = [];
    list.sort((a, b) => b.w.length - a.w.length).forEach(x => {
      for (let t = 0; t < 400; t++) {
        const [dr, dc] = dirs[t < 200 ? rnd(4) : rnd(8)], r = rnd(N), c = rnd(N);
        const er = r + dr * (x.w.length - 1), ec = c + dc * (x.w.length - 1);
        if (er < 0 || er >= N || ec < 0 || ec >= N) continue;
        let ok = true;
        for (let i = 0; i < x.w.length; i++) { const v = g[r + dr * i][c + dc * i]; if (v && v !== x.w[i]) { ok = false; break; } }
        if (!ok) continue;
        for (let i = 0; i < x.w.length; i++) g[r + dr * i][c + dc * i] = x.w[i];
        placed.push({ ...x, r, c, dr, dc, found: false }); return;
      }
    });
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) g[r][c] = LETTERS[rnd(26)];
    root.innerHTML = `<div class="act-ws"><div class="grid" style="grid-template-columns:repeat(${N},auto)">
      ${g.map((row, r) => row.map((ch, c) => `<button data-rc="${r},${c}">${ch}</button>`).join('')).join('')}</div>
      <ul>${placed.map((p, k) => `<li data-k="${k}">${esc(p.label)}</li>`).join('')}</ul></div>
      <div class="act-bar"><span class="act-info"><b data-f>0</b> de ${placed.length}</span><button class="act-btn alt" data-finish>Terminar</button></div>`;
    let start = null, found = 0;
    ctx.onTimeout = () => done(found, placed.length, 'se terminó el tiempo');
    const btn = (r, c) => root.querySelector(`[data-rc="${r},${c}"]`);
    root.addEventListener('click', e => {
      if (e.target.closest('[data-finish]')) {
        if (found < placed.length && !confirm(`Faltan ${placed.length - found} palabras. ¿Terminar igual?`)) return;
        return done(found, placed.length, '');
      }
      const b = e.target.closest('[data-rc]'); if (!b) return;
      const [r, c] = b.dataset.rc.split(',').map(Number);
      if (!start) { start = [r, c]; b.classList.add('start'); return; }
      btn(...start).classList.remove('start');
      const [r0, c0] = start; start = null;
      const dr = Math.sign(r - r0), dc = Math.sign(c - c0), len = Math.max(Math.abs(r - r0), Math.abs(c - c0)) + 1;
      if (!(r0 === r || c0 === c || Math.abs(r - r0) === Math.abs(c - c0))) return;
      const p = placed.find(p => !p.found && p.w.length === len && (
        (p.r === r0 && p.c === c0 && p.dr === dr && p.dc === dc) ||
        (p.r === r && p.c === c && p.dr === -dr && p.dc === -dc)));
      if (!p) { b.classList.add('act-shake'); ctx.later(() => b.classList.remove('act-shake'), 300); return; }
      p.found = true; found++;
      for (let i = 0; i < len; i++) btn(r0 + dr * i, c0 + dc * i).classList.add('found');
      root.querySelector(`li[data-k="${placed.indexOf(p)}"]`).classList.add('ok');
      root.querySelector('[data-f]').textContent = found;
      if (found === placed.length) ctx.later(() => done(found, placed.length, ''), 700);
    });
  }
 
  /* ---------- 5. Ahorcado ---------- */
  function ahorcado(root, pairs, done, ctx) {
    const list = shuffle(pairs.map(p => ({ w: word(p.a), clue: p.b })).filter(x => x.w));
    let idx = 0, ok = 0, guessed, errors;
    const parts = [
      '<circle cx="140" cy="60" r="16"/>', '<line x1="140" y1="76" x2="140" y2="126"/>',
      '<line x1="140" y1="90" x2="118" y2="110"/>', '<line x1="140" y1="90" x2="162" y2="110"/>',
      '<line x1="140" y1="126" x2="122" y2="156"/>', '<line x1="140" y1="126" x2="158" y2="156"/>'];
    function round() {
      if (idx >= list.length) return done(ok, list.length, '');
      guessed = new Set(); errors = 0; paint();
    }
    function paint() {
      const x = list[idx];
      const shown = [...x.w].map(ch => /[0-9]/.test(ch) || guessed.has(ch) ? ch : '_').join('');
      root.innerHTML = `<div class="act-info">Palabra ${idx + 1} de ${list.length}</div>
        <div class="act-prompt">${x.clue ? esc(x.clue) : '&nbsp;'}</div>
        <div class="act-hm"><svg width="200" height="180" viewBox="0 0 200 180" stroke="#1f2a44" stroke-width="4" fill="none" stroke-linecap="round">
          <line x1="20" y1="170" x2="120" y2="170"/><line x1="60" y1="170" x2="60" y2="20"/><line x1="60" y1="20" x2="140" y2="20"/><line x1="140" y1="20" x2="140" y2="44"/>
          ${parts.slice(0, errors).join('')}</svg>
          <div><div class="word">${shown}</div><div class="act-info">Errores: ${errors} de 6</div></div></div>
        <div class="act-keys">${[...LETTERS].map(L => `<button data-k="${L}" class="${guessed.has(L) ? (x.w.includes(L) ? 'hit' : 'miss') : ''}" ${guessed.has(L) ? 'disabled' : ''}>${L}</button>`).join('')}</div>`;
      if (!shown.includes('_')) { ok++; idx++; ctx.later(round, 900); disable(); }
      else if (errors >= 6) {
        root.querySelector('.word').textContent = x.w; root.querySelector('.word').style.color = '#a3222c';
        idx++; ctx.later(round, 1600); disable();
      }
    }
    const disable = () => root.querySelectorAll('.act-keys button').forEach(b => b.disabled = true);
    ctx.onTimeout = () => done(ok, list.length, 'se terminó el tiempo');
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-k]'); if (!b || b.disabled) return;
      guessed.add(b.dataset.k); if (!list[idx].w.includes(b.dataset.k)) errors++;
      paint();
    });
    ctx.on(document, 'keydown', e => {
      const L = e.key && e.key.toUpperCase();
      if (L && L.length === 1 && LETTERS.includes(L) && root.isConnected) { const b = root.querySelector(`[data-k="${L}"]`); if (b && !b.disabled) b.click(); }
    });
    round();
  }
 
  /* ---------- 6 y 7. Atrapa el topo / Explotar globos ---------- */
  function arcade(root, pairs, done, ctx, kind) {
    const rounds = shuffle(pairs.filter(p => p.a)), all = pairs.map(p => p.a);
    const COLORS = ['#ffd3e2', '#cfeaff', '#d6f0bf', '#ffdcb0', '#e3d8ff', '#fff1a8'];
    let idx = -1, ok = 0, misses = 0, roundTimer = null;
    ctx.onTimeout = () => done(ok, rounds.length, 'se terminó el tiempo');
    root.innerHTML = `<div class="act-prompt" data-prompt></div>
      <div class="act-field ${kind}"><div class="act-score">✔ <b data-ok>0</b> · ronda <b data-r>1</b>/${rounds.length}</div>
      ${kind === 'topo' ? Array.from({ length: 6 }, (_, i) => `<div class="act-hole" data-h="${i}"></div>`).join('') : ''}</div>`;
    const field = root.querySelector('.act-field');
    function options() {
      const correct = rounds[idx].a;
      return shuffle([correct, ...shuffle(all.filter(x => x !== correct)).slice(0, 4)]);
    }
    function next() {
      clearTimeout(roundTimer); idx++;
      field.querySelectorAll('.act-mole, .act-balloon').forEach(e => e.remove());
      if (idx >= rounds.length) return done(ok, rounds.length, misses ? `${misses} toques equivocados` : '');
      root.querySelector('[data-prompt]').textContent = rounds[idx].b || rounds[idx].a;
      root.querySelector('[data-r]').textContent = idx + 1;
      const opts = options(); let k = 0, sinceCorrect = 0;
      const spawn = () => {
        if (!root.isConnected) return;
        let t = opts[k++ % opts.length];
        if (t === rounds[idx].a) sinceCorrect = 0; else if (++sinceCorrect >= 3) { t = rounds[idx].a; sinceCorrect = 0; }
        kind === 'topo' ? mole(t) : balloon(t);
      };
      spawn(); ctx.every(spawn, kind === 'topo' ? 900 : 1100, 'spawn');
      roundTimer = ctx.later(() => next(), 12000);
    }
    function hit(el, text) {
      if (text === rounds[idx].a) {
        ok++; root.querySelector('[data-ok]').textContent = ok;
        el.classList.add('act-pop'); ctx.stop('spawn'); ctx.later(next, 450);
      } else { misses++; el.classList.add('act-shake'); ctx.later(() => el.classList.remove('act-shake'), 300); }
    }
    function mole(text) {
      const free = [...field.querySelectorAll('.act-hole')].filter(h => !h.firstElementChild);
      if (!free.length) return;
      const h = free[rnd(free.length)], m = document.createElement('button');
      m.className = 'act-mole'; m.textContent = text; h.appendChild(m);
      requestAnimationFrame(() => m.classList.add('up'));
      m.onclick = () => hit(m, text);
      ctx.later(() => { m.classList.remove('up'); ctx.later(() => m.remove(), 220); }, 1700);
    }
    function balloon(text) {
      const b = document.createElement('button');
      b.className = 'act-balloon'; b.textContent = text;
      b.style.left = (5 + rnd(75)) + '%'; b.style.background = COLORS[rnd(COLORS.length)];
      b.style.animationDuration = (5 + Math.random() * 2) + 's';
      b.onclick = () => hit(b, text);
      b.addEventListener('animationend', ev => { if (ev.animationName === 'act-rise') b.remove(); });
      field.appendChild(b);
    }
    next();
  }
 
  /* ---------- 8. Tarjetas ---------- */
  function tarjetas(root, pairs, done, ctx) {
    const list = shuffle(pairs); let idx = 0, known = 0;
    ctx.onTimeout = () => done(known, list.length, 'se terminó el tiempo');
    function show() {
      if (idx >= list.length) return done(known, list.length, '');
      const p = list[idx];
      root.innerHTML = `<div class="act-info">Tarjeta ${idx + 1} de ${list.length} · Sabidas: ${known}</div>
        <div class="act-flash" data-flip><div class="in"><div class="f">${esc(p.a)}</div><div class="bk">${esc(p.b || '—')}</div></div></div>
        <div class="act-bar"><span class="act-info" data-hint>Tocar la tarjeta para darla vuelta</span>
        <button class="act-btn alt" data-no hidden>No la sabía</button><button class="act-btn" data-yes hidden>¡La sabía!</button></div>`;
    }
    root.addEventListener('click', e => {
      if (e.target.closest('[data-flip]')) {
        root.querySelector('.act-flash').classList.toggle('flip');
        root.querySelectorAll('[data-no],[data-yes]').forEach(b => b.hidden = false);
        const h = root.querySelector('[data-hint]'); if (h) h.hidden = true;
      }
      if (e.target.closest('[data-yes]')) { known++; idx++; show(); }
      if (e.target.closest('[data-no]')) { idx++; show(); }
    });
    show();
  }
 
  /* ---------- 9. Ruleta ---------- */
  function ruleta(root, pairs, done, ctx) {
    let list = pairs.slice(), angle = 0, spinning = false, last = -1;
    const COLORS = ['#ffd3e2', '#cfeaff', '#d6f0bf', '#ffdcb0', '#e3d8ff', '#fff1a8'];
    root.innerHTML = `<div class="act-wheel"><div class="wrap"><div class="pin"></div><canvas width="760" height="760"></canvas></div>
      <div class="res"><div data-res class="act-prompt">Girar la ruleta</div><div data-ans class="act-info"></div>
      <div class="act-bar"><button class="act-btn" data-spin>Girar</button><button class="act-btn alt" data-show hidden>Ver respuesta</button>
      <button class="act-btn alt" data-remove hidden>Quitar de la ruleta</button></div></div></div>`;
    const cv = root.querySelector('canvas'), g = cv.getContext('2d');
    function draw() {
      const n = list.length, R = 370, step = 2 * Math.PI / Math.max(n, 1);
      g.clearRect(0, 0, 760, 760); g.save(); g.translate(380, 380); g.rotate(angle);
      list.forEach((p, i) => {
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, i * step, (i + 1) * step); g.closePath();
        g.fillStyle = COLORS[i % COLORS.length]; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
        g.save(); g.rotate(i * step + step / 2); g.textAlign = 'right'; g.fillStyle = '#1f2a44';
        g.font = `${n > 16 ? 22 : 28}px "Patrick Hand", sans-serif`;
        const t = p.a.length > 22 ? p.a.slice(0, 21) + '…' : p.a; g.fillText(t, R - 18, 9); g.restore();
      });
      g.restore();
      g.beginPath(); g.arc(380, 380, 30, 0, 2 * Math.PI); g.fillStyle = '#1d4ea0'; g.fill();
    }
    draw();
    root.addEventListener('click', e => {
      if (e.target.closest('[data-spin]') && !spinning && list.length) {
        spinning = true; root.querySelector('[data-ans]').textContent = '';
        root.querySelectorAll('[data-show],[data-remove]').forEach(b => b.hidden = true);
        const start = angle, total = 6 * Math.PI + Math.random() * 2 * Math.PI, t0 = performance.now(), dur = 3800;
        const anim = now => {
          const k = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - k, 3);
          angle = start + total * ease; draw();
          if (k < 1) return requestAnimationFrame(anim);
          spinning = false;
          const n = list.length, step = 2 * Math.PI / n;
          const a = ((-Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
          last = Math.floor(a / step) % n;
          root.querySelector('[data-res]').textContent = list[last].a;
          root.querySelector('[data-show]').hidden = !list[last].b;
          root.querySelector('[data-remove]').hidden = false;
        };
        requestAnimationFrame(anim);
      }
      if (e.target.closest('[data-show]') && last >= 0) root.querySelector('[data-ans]').textContent = list[last].b;
      if (e.target.closest('[data-remove]') && last >= 0) {
        list.splice(last, 1); last = -1; draw();
        root.querySelector('[data-res]').textContent = list.length ? 'Girar la ruleta' : '¡No quedan opciones!';
        root.querySelectorAll('[data-show],[data-remove]').forEach(b => b.hidden = true);
        root.querySelector('[data-ans]').textContent = '';
      }
    });
  }
 
  /* ---------- 10. Abrir la caja ---------- */
  function caja(root, pairs) {
    const list = shuffle(pairs);
    root.innerHTML = `<div class="act-boxes">${list.map((_, i) => `<button class="act-box" data-i="${i}"><span>${i + 1}</span></button>`).join('')}</div>
      <div class="act-reveal" data-rev hidden></div>`;
    root.addEventListener('click', e => {
      const b = e.target.closest('.act-box');
      if (b) {
        b.classList.add('used'); const p = list[b.dataset.i];
        const rev = root.querySelector('[data-rev]'); rev.hidden = false;
        rev.innerHTML = `<div>${esc(p.a)}</div>${p.b ? `<div class="act-bar"><button class="act-btn alt" data-ans>Ver respuesta</button></div><div class="ans" hidden>${esc(p.b)}</div>` : ''}`;
        rev.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      if (e.target.closest('[data-ans]')) { root.querySelector('.act-reveal .ans').hidden = false; e.target.closest('.act-bar').remove(); }
    });
  }
 
  /* ---------- 11. Ordenar líneas (Parsons) ---------- */
  function ordenar(root, V, done, ctx) {
    const ej = V.bloques;
    if (!ej.length) { root.innerHTML = '<p class="act-info">Hacen falta al menos dos líneas.</p>'; return; }
    const orders = ej.map(b => b.slice());    // orden actual de cada ejercicio (textos)
    const correctas = ctx.practica ? nBloques(nBase('ordenar', ctx.pares)) : null;   // solo en práctica
    let bi = 0, checking = false, from = null, sent = false;
    function paint() {
      const order = orders[bi], last = bi === ej.length - 1;
      root.innerHTML = `${ej.length > 1 ? `<div class="act-info">Ejercicio ${bi + 1} de ${ej.length}</div>` : ''}
        <ol class="act-parsons">${order.map((t, pos) => `<li draggable="true" data-pos="${pos}"><span class="grip" aria-hidden="true">⋮⋮</span><code>${esc(t)}</code>
          <span class="mv"><button type="button" data-up="${pos}" aria-label="Subir" ${pos ? '' : 'disabled'}>▲</button><button type="button" data-down="${pos}" aria-label="Bajar" ${pos < order.length - 1 ? '' : 'disabled'}>▼</button></span></li>`).join('')}</ol>
        <div class="act-bar"><button class="act-btn" data-check>${ctx.practica ? 'Comprobar' : last ? 'Entregar' : 'Siguiente ejercicio'}</button></div>`;
    }
    function move(a, b) { const order = orders[bi]; if (checking || b < 0 || b >= order.length || a === b) return; const [x] = order.splice(a, 1); order.splice(b, 0, x); paint(); }
    function entregar(wait) {
      if (sent) return; sent = true; checking = true;
      ctx.corregir(orders).then(R => {
        if (!ctx.practica) {
          const lis = root.querySelectorAll('.act-parsons li');
          (R.items[bi] || []).forEach((g, pos) => { if (lis[pos]) lis[pos].classList.add(g ? 'ok' : 'bad'); });
          root.querySelector('.act-bar').innerHTML = `<span class="act-info">${R.puntaje} de ${R.total} líneas en su lugar</span>`;
        }
        ctx.later(() => done(R.puntaje, R.total, ''), wait);
      });
    }
    function check() {
      if (checking) return;
      if (!ctx.practica) {      // «Con registro»: sin corrección parcial; se corrige todo al entregar
        if (bi < ej.length - 1) { bi++; paint(); return; }
        if (!confirm('¿Entregar? Se corrige una sola vez.')) return;
        return entregar(1600);
      }
      checking = true;
      const good = orders[bi].map((t, pos) => t === correctas[bi][pos]);
      root.querySelectorAll('.act-parsons li').forEach((li, pos) => li.classList.add(good[pos] ? 'ok' : 'bad'));
      root.querySelector('.act-bar').innerHTML = `<span class="act-info">${good.filter(Boolean).length} de ${good.length} líneas en su lugar</span>`;
      ctx.later(() => { if (bi < ej.length - 1) { bi++; checking = false; paint(); } else entregar(0); }, 1600);
    }
    ctx.onTimeout = () => entregar(0);
    root.addEventListener('click', e => {
      const u = e.target.closest('[data-up]'), d = e.target.closest('[data-down]');
      if (u) move(+u.dataset.up, +u.dataset.up - 1);
      if (d) move(+d.dataset.down, +d.dataset.down + 1);
      if (e.target.closest('[data-check]')) check();
    });
    root.addEventListener('dragstart', e => { const li = e.target.closest('li[data-pos]'); if (!li) return; from = +li.dataset.pos; li.classList.add('drag'); try { e.dataTransfer.setData('text/plain', String(from)); } catch (err) {} });
    root.addEventListener('dragend', () => root.querySelectorAll('.drag,.over').forEach(x => x.classList.remove('drag', 'over')));
    root.addEventListener('dragover', e => { const li = e.target.closest('li[data-pos]'); if (!li) return; e.preventDefault(); root.querySelectorAll('.over').forEach(x => x.classList.remove('over')); li.classList.add('over'); });
    root.addEventListener('drop', e => { const li = e.target.closest('li[data-pos]'); if (!li || from == null) return; e.preventDefault(); const to = +li.dataset.pos; const f = from; from = null; move(f, to); });
    paint();
  }
 
  /* ---------- 12. Clasificar en grupos ---------- */
  function clasificar(root, V, done, ctx) {
    const items = V.items.map((t, i) => ({ t, i })), groups = V.grupos;
    if (groups.length < 2) { root.innerHTML = '<p class="act-info">Hacen falta al menos dos grupos (elemento | grupo).</p>'; return; }
    const COLORS = ['#fff7d6', '#ffe4ee', '#e1f1ff', '#e6f6da', '#ffecd6', '#ece6ff'];
    const place = {}; let sel = null, checked = false, dragI = null;
    function paint() {
      const chip = x => `<button type="button" class="chip2${sel === x.i ? ' sel' : ''}" draggable="true" data-i="${x.i}">${esc(x.t)}</button>`;
      root.innerHTML = `<div class="act-sort"><div class="pool" data-bin="">${items.filter(x => place[x.i] == null).map(chip).join('')}</div>
        <div class="bins">${groups.map((g, k) => `<div class="bin" data-bin="${esc(g)}" style="--bc:${COLORS[k % COLORS.length]}"><h4>${esc(g)}</h4>${items.filter(x => place[x.i] === g).map(chip).join('')}</div>`).join('')}</div></div>
        <div class="act-bar"><button class="act-btn" data-check>${ctx.practica ? 'Comprobar' : 'Entregar'}</button></div>`;
    }
    function put(i, g) { if (checked) return; if (g === '' || g == null) delete place[i]; else place[i] = g; sel = null; paint(); }
    function check(wait) {
      if (checked) return; checked = true;
      ctx.corregir(items.map(x => ({ t: x.t, r: place[x.i] == null ? null : place[x.i] }))).then(R => {
        items.forEach((x, k) => { const el = root.querySelector(`[data-i="${x.i}"]`); if (el) el.classList.add(R.items[k] ? 'ok' : 'bad'); });
        root.querySelector('.act-bar').innerHTML = `<span class="act-info">${R.puntaje} de ${R.total} bien clasificados</span>`;
        ctx.later(() => done(R.puntaje, R.total, ''), wait);
      });
    }
    ctx.onTimeout = () => check(0);
    root.addEventListener('click', e => {
      if (e.target.closest('[data-check]')) {
        const faltan = items.filter(x => place[x.i] == null).length;
        if (faltan && !confirm(`Faltan clasificar ${faltan}. ¿Comprobar igual?`)) return;
        return check(1500);
      }
      if (checked) return;
      const c = e.target.closest('[data-i]');
      if (c) { sel = sel === +c.dataset.i ? null : +c.dataset.i; paint(); return; }
      const b = e.target.closest('[data-bin]');
      if (b && sel != null) put(sel, b.dataset.bin);
    });
    root.addEventListener('dragstart', e => { const c = e.target.closest('[data-i]'); if (!c) return; dragI = +c.dataset.i; try { e.dataTransfer.setData('text/plain', String(dragI)); } catch (err) {} });
    root.addEventListener('dragover', e => { const b = e.target.closest('[data-bin]'); if (!b) return; e.preventDefault(); root.querySelectorAll('.over').forEach(x => x.classList.remove('over')); b.classList.add('over'); });
    root.addEventListener('drop', e => { const b = e.target.closest('[data-bin]'); if (!b || dragI == null) return; e.preventDefault(); const i = dragI; dragI = null; put(i, b.dataset.bin); });
    root.addEventListener('dragend', () => root.querySelectorAll('.over').forEach(x => x.classList.remove('over')));
    paint();
  }
 
  /* ---------- 13. Verdadero o falso rápido ---------- */
  function vf(root, V, done, ctx) {
    const list = V.items;
    if (!list.length) { root.innerHTML = '<p class="act-info">Cada afirmación necesita «| V» o «| F».</p>'; return; }
    // en práctica se muestra el acierto al momento; en «Con registro», recién al final (lo corrige el servidor)
    const clave = ctx.practica ? nBase('vf', ctx.pares).map(p => ({ t: p.a, v: nValorVF(p.b) })).filter(x => x.v !== null) : null;
    const SEG = 10, resp = list.map(t => ({ t, r: null }));
    let idx = -1, ok = 0, busy = false, timer = null, sent = false;
    root.innerHTML = `<div class="act-vf"><div class="act-info" data-n></div><div class="st" data-st></div><div class="bar"><i data-bar></i></div>
      <div class="btns"><button type="button" data-v="1">Verdadero</button><button type="button" data-v="0">Falso</button></div></div>`;
    const st = root.querySelector('[data-st]'), bar = root.querySelector('[data-bar]');
    function entregar() {
      if (sent) return; sent = true; clearTimeout(timer); busy = true;
      ctx.corregir(resp).then(R => done(R.puntaje, R.total, ''));
    }
    function next() {
      clearTimeout(timer); idx++; busy = false; st.className = 'st';
      if (idx >= list.length) return entregar();
      root.querySelector('[data-n]').textContent = `${idx + 1} de ${list.length}` + (clave ? ` · aciertos: ${ok}` : '');
      st.textContent = list[idx];
      bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth;
      bar.style.transition = `transform ${SEG}s linear`; bar.style.transform = 'scaleX(0)';
      timer = ctx.later(() => answer(null), SEG * 1000);
    }
    function answer(v) {
      if (busy || sent || idx < 0 || idx >= list.length) return; busy = true; clearTimeout(timer);
      resp[idx].r = v;
      if (!clave) {     // sin pistas: solo se marca que se respondió
        st.textContent = list[idx] + (v === null ? '  (se acabó el tiempo)' : '  ✓');
        return ctx.later(next, 450);
      }
      const k = clave.find(x => x.t === list[idx]), good = !!k && v === k.v; if (good) ok++;
      st.classList.add(good ? 'ok' : 'bad');
      if (!good && k) st.textContent = list[idx] + (v === null ? '  (se acabó el tiempo)' : '') + '  →  ' + (k.v ? 'Verdadero' : 'Falso');
      ctx.later(next, good ? 600 : 1500);
    }
    ctx.onTimeout = entregar;
    root.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) answer(b.dataset.v === '1'); });
    ctx.on(document, 'keydown', e => { if (!root.isConnected) return; const k = (e.key || '').toLowerCase(); if (k === 'v') answer(true); if (k === 'f') answer(false); });
    next();
  }
 
  /* ---------- 14. Diagrama etiquetado ---------- */
  function diagrama(root, V, done, ctx) {
    const pins = V.pins, labs = V.etiquetas;
    if (!V.img || pins.length < 2) { root.innerHTML = '<p class="act-info">Falta la imagen o ubicar al menos dos etiquetas (en «editar contenido» → «📍 Ubicar etiquetas»).</p>'; return; }
    const at = {};          // pin -> índice de etiqueta
    let sel = null, checked = false, dragI = null;
    const where = i => Object.keys(at).find(k => at[k] === i);
    function paint() {
      root.innerHTML = `<div class="act-dg"><div class="pic"><img src="${esc(V.img)}" alt="Diagrama" draggable="false">
        ${pins.map((p, k) => `<button type="button" class="pin${at[k] != null ? ' filled' : ''}" data-pin="${k}" style="left:${p.x}%;top:${p.y}%"
          aria-label="Punto ${k + 1}${at[k] != null ? ': ' + esc(labs[at[k]]) : ''}">${at[k] != null ? esc(labs[at[k]]) : k + 1}</button>`).join('')}</div>
        <div class="bank">${labs.map((t, i) => i).filter(i => where(i) == null).map(i => `<button type="button" class="lab${sel === i ? ' sel' : ''}" draggable="true" data-lab="${i}">${esc(labs[i])}</button>`).join('')}</div></div>
        <div class="act-bar"><button class="act-btn" data-check>${ctx.practica ? 'Comprobar' : 'Entregar'}</button></div>`;
    }
    function put(i, k) {
      if (checked) return;
      const prev = where(i); if (prev != null) delete at[prev];
      at[k] = i; sel = null; paint();
    }
    function check(wait) {
      if (checked) return; checked = true;
      ctx.corregir(pins.map((p, k) => ({ x: p.x, y: p.y, t: at[k] != null ? labs[at[k]] : null }))).then(R => {
        pins.forEach((p, k) => {
          const good = !!R.items[k], el = root.querySelector(`[data-pin="${k}"]`);
          el.classList.add(good ? 'ok' : 'bad');
          // la etiqueta correcta solo se muestra si el servidor la manda (práctica o un solo intento)
          if (!good) el.innerHTML = (at[k] != null ? esc(labs[at[k]]) : '—') + (R.sol ? `<span class="fix">${esc(R.sol[k])}</span>` : '');
        });
        root.querySelector('.act-bar').innerHTML = `<span class="act-info">${R.puntaje} de ${R.total} bien ubicadas</span>`;
        ctx.later(() => done(R.puntaje, R.total, ''), wait);
      });
    }
    ctx.onTimeout = () => check(0);
    root.addEventListener('click', e => {
      if (e.target.closest('[data-check]')) {
        const faltan = pins.length - Object.keys(at).length;
        if (faltan && !confirm(`Faltan ubicar ${faltan} etiquetas. ¿Comprobar igual?`)) return;
        return check(2200);
      }
      if (checked) return;
      const l = e.target.closest('[data-lab]');
      if (l) { sel = sel === +l.dataset.lab ? null : +l.dataset.lab; paint(); return; }
      const p = e.target.closest('[data-pin]');
      if (p) {
        const k = +p.dataset.pin;
        if (sel != null) put(sel, k);
        else if (at[k] != null) { delete at[k]; paint(); }   // tocar una etiqueta ya puesta la devuelve
      }
    });
    root.addEventListener('dragstart', e => { const l = e.target.closest('[data-lab]'); if (!l) return; dragI = +l.dataset.lab; try { e.dataTransfer.setData('text/plain', String(dragI)); } catch (err) {} });
    root.addEventListener('dragover', e => { const p = e.target.closest('[data-pin]'); if (!p) return; e.preventDefault(); root.querySelectorAll('.over').forEach(x => x.classList.remove('over')); p.classList.add('over'); });
    root.addEventListener('drop', e => { const p = e.target.closest('[data-pin]'); if (!p || dragI == null) return; e.preventDefault(); const i = dragI; dragI = null; put(i, +p.dataset.pin); });
    root.addEventListener('dragend', () => root.querySelectorAll('.over').forEach(x => x.classList.remove('over')));
    paint();
  }
 
  const IMPL = { unir, memotest, crucigrama, sopa, ahorcado, tarjetas, ruleta, caja, ordenar, clasificar, vf, diagrama,
                 topo: (r, p, d, c) => arcade(r, p, d, c, 'topo'), globos: (r, p, d, c) => arcade(r, p, d, c, 'globos') };
 
  /* ---------- reproductor común ---------- */
  function play(el, opts) {
    injectCss();
    const t = TEMPLATES[opts.template] || TEMPLATES.unir, key = TEMPLATES[opts.template] ? opts.template : 'unir';
    const pairs = (opts.pairs || []).filter(p => p && p.a);
    // «Con registro» verificado: el servidor manda la vista (sin soluciones) y corrige con opts.corregir
    const remoto = VERIFICABLES.indexOf(key) >= 0 && !!opts.vista && typeof opts.corregir === 'function';
    let ctx = null;
    function makeCtx() {
      const timers = [], named = {}, offs = [];
      return {
        later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; },
        every(fn, ms, name) { const id = setInterval(fn, ms); timers.push(id); if (name) { clearInterval(named[name]); named[name] = id; } return id; },
        stop(name) { clearInterval(named[name]); },
        on(target, ev, fn) { target.addEventListener(ev, fn); offs.push(() => target.removeEventListener(ev, fn)); },
        clear() { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); offs.forEach(f => f()); }
      };
    }
    function start() {
      if (ctx) ctx.clear();
      ctx = makeCtx();
      const limit = t.scored ? Math.max(0, Number(opts.timeLimit) || 0) : 0;
      el.innerHTML = `<div class="act"><div class="act-head"><b>${t.icon} ${esc(t.name)}</b><span>${esc(remoto ? t.help.replace('«Comprobar»', '«Entregar»') : t.help)}${limit ? ` Tiempo: ${limit} min.` : ''}</span>${limit ? '<span class="act-timer" aria-live="off"></span>' : ''}</div><div class="act-stage"></div></div>`;
      const stage = el.querySelector('.act-stage');
      const minimo = key === 'memotest' || key === 'unir' ? 2 : 1;
      if (!remoto && pairs.length < minimo) { stage.innerHTML = '<p class="act-info">Esta actividad todavía no tiene contenido.</p>'; return; }
      const t0 = Date.now();
      let ended = false;
      // Corrección: en práctica, acá mismo; con registro, la hace (y la guarda) el servidor
      ctx.practica = !remoto;
      ctx.pares = remoto ? null : pairs;
      let guardado = '';
      const aviso = (html, btn) => {
        let o = stage.querySelector('.act-send');
        if (!o) { o = document.createElement('div'); o.className = 'act-end act-send'; stage.appendChild(o); }
        o.innerHTML = `<div>${html}${btn ? `<div class="act-bar"><button class="act-btn" data-retry>${btn}</button></div>` : ''}</div>`;
        return o;
      };
      ctx.corregir = ans => {
        if (!remoto) return Promise.resolve(nCorregir(key, pairs, ans));
        ctx.stop('timer');     // lo entregado ya no depende del reloj
        return new Promise(resolve => {
          const go = () => {
            const o = aviso('<p class="act-info">Enviando y corrigiendo…</p>');
            Promise.resolve(opts.corregir(ans, Math.round((Date.now() - t0) / 1000))).then(r => {
              if (r && r.ok) { o.remove(); guardado = 'Resultado guardado ✓ (corregido en el servidor)'; return resolve(r); }
              ended = true; ctx.clear();
              aviso(`<h3>No se guardó</h3><p class="act-info">${esc((r && r.error) || 'Error del servidor')}</p>`);
            }).catch(() => {
              const o2 = aviso('<p class="act-info">Sin conexión: el resultado todavía no se envió.</p>', 'Reintentar');
              o2.querySelector('[data-retry]').addEventListener('click', go, { once: true });
            });
          };
          go();
        });
      };
      const finish = (score, total, detail) => {
        if (ended) return; ended = true;     // una sola vez (por si coinciden el final y el tiempo)
        const secs = Math.round((Date.now() - t0) / 1000);
        ctx.clear();
        const end = document.createElement('div'); end.className = 'act-end';
        end.innerHTML = `<div><h3>¡Terminado!</h3><div class="big">${score} de ${total}</div>
          <div class="act-info">${detail ? esc(detail) + ' · ' : ''}${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} min</div>
          <div class="act-info" data-saved></div>
          <div class="act-bar">${opts.canReplay === false ? '' : '<button class="act-btn" data-again>Jugar de nuevo</button>'}</div></div>`;
        stage.appendChild(end);
        end.addEventListener('click', e => { if (e.target.closest('[data-again]')) start(); });
        if (guardado) end.querySelector('[data-saved]').textContent = guardado;
        else if (opts.onResult && !remoto) {
          Promise.resolve(opts.onResult(score, total, secs, detail)).then(msg => {
            if (msg) { const s = end.querySelector('[data-saved]'); if (s) s.textContent = msg; }
          }).catch(() => {});
        }
      };
      const datos = VERIFICABLES.indexOf(key) >= 0 ? (remoto ? opts.vista : nVista(key, pairs))
        : ['ruleta', 'caja', 'ordenar'].includes(key) ? pairs : pairs.slice(0, 40);
      IMPL[key](stage, datos, finish, ctx);
      if (limit) {
        const tm = el.querySelector('.act-timer'), end = t0 + limit * 60000;
        const tick = () => {
          const left = Math.max(0, Math.round((end - Date.now()) / 1000));
          tm.textContent = '⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
          tm.classList.toggle('low', left <= 30);
          if (!left && !ended) { ctx.stop('timer'); if (ctx.onTimeout) ctx.onTimeout(); else finish(0, pairs.length, 'se terminó el tiempo'); }
        };
        tick(); ctx.every(tick, 1000, 'timer');
      }
    }
    start();
    return { restart: start, destroy() { if (ctx) ctx.clear(); el.innerHTML = ''; } };
  }
 
  window.Actividades = { TEMPLATES, VERIFICABLES, play, parse, format, imgUrl, diagramOf, nVista, nCorregir };
})();
 
