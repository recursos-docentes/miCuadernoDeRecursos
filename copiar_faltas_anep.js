/* Copiar faltas fictas del Portafolio Docente de ANEP — marcador (bookmarklet).
   Se usa en «Evaluación individual»: copia «nombre <TAB> fictas» de la columna «In.Fictas»,
   para pegarlo en la Libreta de clase (Resumen → 🤖 Juicios con IA → «Faltas fictas del Portafolio»).
   No cambia nada en la página y no envía datos a ningún lado. */
(function () {
  'use strict';
  const viejo = document.getElementById('copiar-faltas-anep'); if (viejo) viejo.remove();
 
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const palabras = s => norm(s).split(' ').filter(t => t.length > 1 && !/^\d+$/.test(t));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function documentos() {
    const out = [document];
    document.querySelectorAll('iframe,frame').forEach(f => { try { if (f.contentDocument && f.contentDocument.body) out.push(f.contentDocument); } catch (e) { /* de otro sitio */ } });
    return out;
  }
  const texto = el => (el.innerText || el.textContent || '');
  const esNombre = c => /^\s*nombre\s*$/i.test(c.textContent), esFictas = c => /fictas/i.test(c.textContent);
 
  function leer() {
    const filas = [];
    documentos().forEach(d => d.querySelectorAll('table').forEach(t => {
      const cab = Array.prototype.find.call(t.rows, r => Array.prototype.some.call(r.cells, esFictas) && Array.prototype.some.call(r.cells, esNombre));
      if (!cab) return;
      const ci = Array.prototype.findIndex.call(cab.cells, esNombre), cf = Array.prototype.findIndex.call(cab.cells, esFictas);
      Array.prototype.forEach.call(t.rows, r => {
        if (r === cab || r.cells.length <= Math.max(ci, cf)) return;
        // nombre sin el ícono, el número de lista ni etiquetas cortas como «AR»
        const nombre = texto(r.cells[ci]).split(/\n+/).map(x => x.trim()).filter(x => x && !/^[A-ZÁÉÍÓÚ]{1,3}$/.test(x)).join(' ')
          .replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '').replace(/\s+/g, ' ').trim();
        const f = texto(r.cells[cf]).replace(/\s+/g, ' ').trim();
        if (palabras(nombre).length >= 2) filas.push([nombre, /^\d+(?:[.,]\d+)?$/.test(f) ? f : 'N/D']);
      });
    }));
    return filas;
  }
 
  /* ---------- panel ---------- */
  const host = document.createElement('div'); host.id = 'copiar-faltas-anep';
  host.style.cssText = 'position:fixed;top:12px;left:12px;z-index:2147483647';
  const sh = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  sh.innerHTML = '<style>' +
    '.p{width:340px;background:#fffdf3;color:#1f2a44;border:2px solid #2f6f4f;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.3);font:14px/1.45 system-ui,sans-serif;padding:12px 14px}' +
    'h2{margin:0 0 6px;font-size:16px;color:#2f6f4f}button{font:inherit;border:0;border-radius:6px;padding:6px 12px;cursor:pointer;background:#2f6f4f;color:#fff;margin:8px 6px 0 0}' +
    'button.alt{background:#eef1f6;color:#1f2a44}.x{position:absolute;top:6px;right:8px;background:none;color:#1f2a44;font-size:20px;padding:0 6px;margin:0}' +
    '.ok{color:#2f6f4f}.mal{color:#a3222c}small{color:#5b6478}' +
    '</style><div class="p"><button class="x" title="Cerrar">×</button><h2>📥 Copiar faltas fictas</h2><div class="r"></div>' +
    '<button class="cp" hidden>Copiar de nuevo</button><button class="alt cerrar">Cerrar</button></div>';
  const $ = s => sh.querySelector(s), out = $('.r');
  document.body.appendChild(host);
  $('.x').addEventListener('click', () => host.remove());
  $('.cerrar').addEventListener('click', () => host.remove());
 
  if (/recursos-docentes\.github\.io/i.test(location.hostname)) {
    out.innerHTML = '<span class="mal">Esta es tu libreta (o el cuaderno), no el Portafolio de ANEP. Este marcador se usa en el Portafolio Docente, en «Evaluación individual».</span>';
    return;
  }
  const filas = leer();
  if (!filas.length) {
    out.innerHTML = '<span class="mal">No encontré la columna «In.Fictas». Abrir en el Portafolio la <b>Evaluación individual</b> del grupo y tocar el marcador de nuevo.</span>';
    return;
  }
  // el título identifica lo copiado: así no se puede pegar como notas con el otro marcador
  const txt = 'FALTAS FICTAS\tIn.Fictas\n' + filas.map(f => f.join('\t')).join('\n');
  const nd = filas.filter(f => f[1] === 'N/D').length;
  function copiar() {
    const listo = ok => {
      out.innerHTML = ok
        ? '<b class="ok">✓ Copiadas las faltas fictas de ' + filas.length + ' estudiantes</b>' + (nd ? ' (' + nd + ' sin dato, «N/D»)' : '') + '.<br><small>Pegarlas en la Libreta de clase: <b>Resumen → 🤖 Juicios con IA → «Faltas fictas del Portafolio»</b>.</small>'
        : '<span class="mal">El navegador no dejó copiar solo. Tocar «Copiar de nuevo».</span>';
      $('.cp').hidden = false;
    };
    (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(txt).then(() => listo(true)) : Promise.reject()).catch(() => {
      const ta = document.createElement('textarea'); ta.value = txt; sh.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); listo(ok);
    });
  }
  $('.cp').addEventListener('click', copiar);
  out.innerHTML = 'Copiando ' + filas.length + ' estudiantes…';
  copiar();
})();
 
