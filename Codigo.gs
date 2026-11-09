/**
 * Cuaderno de recursos — servidor en Google Apps Script
 *
 * Guarda marcadores y páginas en esta planilla.
 * - Las páginas PÚBLICAS se pueden ver sin clave (?p=slug).
 * - Todo lo demás (páginas privadas, notas privadas, editar) exige la CLAVE.
 *
 * Configuración: Configuración del proyecto ⚙ → Propiedades de la secuencia
 * de comandos → agregar la propiedad  CLAVE  con la clave que se quiera usar.
 */

const HOJA_MARCADORES = 'Marcadores';
const HOJA_PAGINAS = 'Paginas';

const COLS_M = ['id', 'url', 'nombre', 'icono', 'categoria', 'descripcion', 'nota', 'notaPrivada',
                'etiquetas', 'color', 'favorita', 'paginas', 'agregado'];
const COLS_P = ['id', 'titulo', 'slug', 'visibilidad', 'descripcion', 'color', 'orden'];

/* ---------- entrada ---------- */
function doGet(e) { return responder(manejar((e && e.parameter) || {})); }
function doPost(e) {
  let datos = {};
  try { datos = JSON.parse(e.postData.contents); } catch (err) {}
  return responder(manejar(datos));
}
function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function manejar(d) {
  try {
    switch (d.accion) {
      case 'publico':   return publico(d.p);
      case 'verificar': verificar(d.clave); return { ok: true };
      case 'cargar':    verificar(d.clave); return Object.assign({ ok: true }, leerTodo());
      case 'guardar':   verificar(d.clave); return guardar(d);
      default:          return { ok: false, error: 'Acción desconocida' };
    }
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  }
}

function verificar(clave) {
  const real = PropertiesService.getScriptProperties().getProperty('CLAVE');
  if (!real) throw new Error('Falta configurar la propiedad CLAVE en Apps Script');
  if (String(clave || '') !== real) {
    Utilities.sleep(1000); // frena los intentos a ciegas
    throw new Error('Clave incorrecta');
  }
}

/* ---------- lectura ---------- */
function hoja(nombre, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    h.setFrozenRows(1);
  }
  return h;
}

function leerFilas(nombre, cols) {
  const valores = hoja(nombre, cols).getDataRange().getValues();
  const cab = valores.shift() || [];
  return valores
    .filter(f => String(f[0]) !== '')
    .map(f => {
      const o = {};
      cols.forEach(c => { const i = cab.indexOf(c); o[c] = i < 0 ? '' : f[i]; });
      return o;
    });
}

const lista = v => String(v || '').split(',').map(x => x.trim()).filter(String);
const bool = v => v === true || String(v).toUpperCase() === 'TRUE' || v === 1 || v === '1';

function aMarcador(f) {
  return {
    id: String(f.id), url: String(f.url), name: String(f.nombre), icon: String(f.icono),
    cat: String(f.categoria), desc: String(f.descripcion), note: String(f.nota),
    notePrivate: bool(f.notaPrivada), tags: lista(f.etiquetas), color: String(f.color || 'yellow'),
    fav: bool(f.favorita), pages: lista(f.paginas), added: Number(f.agregado) || 0
  };
}
function aPagina(f) {
  return {
    id: String(f.id), title: String(f.titulo), slug: String(f.slug),
    visibility: String(f.visibilidad) === 'publica' ? 'publica' : 'privada',
    desc: String(f.descripcion), color: String(f.color || 'yellow'), order: Number(f.orden) || 0
  };
}

function leerTodo() {
  const rev = Number(PropertiesService.getScriptProperties().getProperty('REV') || 0);
  return {
    rev: rev,
    marcadores: leerFilas(HOJA_MARCADORES, COLS_M).map(aMarcador),
    paginas: leerFilas(HOJA_PAGINAS, COLS_P).map(aPagina).sort((a, b) => a.order - b.order)
  };
}

/* ---------- vista pública (sin clave) ---------- */
function publico(slug) {
  const paginas = leerFilas(HOJA_PAGINAS, COLS_P).map(aPagina)
    .filter(p => p.visibility === 'publica').sort((a, b) => a.order - b.order);
  // Nunca se entrega la lista de páginas: cada una se ve solo con su link.
  if (!slug) return { ok: false, error: 'Falta el link de la página' };

  const pag = paginas.find(p => p.slug === String(slug));
  if (!pag) return { ok: false, error: 'Esta página no existe o no es pública' };

  const marcadores = leerFilas(HOJA_MARCADORES, COLS_M).map(aMarcador)
    .filter(m => m.pages.indexOf(pag.id) >= 0)
    .map(m => ({
      id: m.id, url: m.url, name: m.name, icon: m.icon, cat: m.cat, desc: m.desc,
      note: m.notePrivate ? '' : m.note, tags: m.tags, color: m.color, fav: m.fav, added: m.added
    }));
  return { ok: true, pagina: { title: pag.title, slug: pag.slug, desc: pag.desc, color: pag.color },
           marcadores: marcadores };
}

/* ---------- guardado (con clave) ---------- */
function seguro(v) { // evita que un texto se interprete como fórmula
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function escribir(nombre, cols, filas) {
  const h = hoja(nombre, cols);
  h.getRange(1, 1, 1, cols.length).setValues([cols]);
  const ultima = h.getLastRow();
  if (ultima > 1) h.getRange(2, 1, ultima - 1, Math.max(h.getLastColumn(), cols.length)).clearContent();
  if (filas.length) h.getRange(2, 1, filas.length, cols.length).setValues(filas);
}

function guardar(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const props = PropertiesService.getScriptProperties();
    const rev = Number(props.getProperty('REV') || 0);
    if (!d.forzar && Number(d.rev) !== rev) return { ok: false, conflicto: true, rev: rev };

    const marcadores = Array.isArray(d.marcadores) ? d.marcadores : [];
    const paginas = Array.isArray(d.paginas) ? d.paginas : [];

    escribir(HOJA_MARCADORES, COLS_M, marcadores.map(m => [
      seguro(m.id), seguro(m.url), seguro(m.name), seguro(m.icon), seguro(m.cat), seguro(m.desc),
      seguro(m.note), !!m.notePrivate, seguro((m.tags || []).join(', ')), seguro(m.color),
      !!m.fav, seguro((m.pages || []).join(',')), Number(m.added) || 0
    ]));
    escribir(HOJA_PAGINAS, COLS_P, paginas.map((p, i) => [
      seguro(p.id), seguro(p.title), seguro(p.slug), p.visibility === 'publica' ? 'publica' : 'privada',
      seguro(p.desc), seguro(p.color), i
    ]));

    props.setProperty('REV', String(rev + 1));
    return { ok: true, rev: rev + 1 };
  } finally {
    lock.releaseLock();
  }
}
