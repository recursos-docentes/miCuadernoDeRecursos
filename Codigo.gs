/**
 * Cuaderno de recursos — servidor en Google Apps Script
 *
 * Guarda marcadores, páginas y respuestas de pizarrones en esta planilla.
 * - Las páginas COMPARTIDAS se ven sin clave, solo con su link (?p=slug).
 * - En los pizarrones, los estudiantes responden sin clave; ver todas las
 *   respuestas, calificar y cambiar el estado exige la CLAVE.
 *
 * Configuración: Configuración del proyecto ⚙ → Propiedades de la secuencia
 * de comandos → agregar la propiedad  CLAVE  con la clave que se quiera usar.
 */
 
const HOJA_MARCADORES = 'Marcadores';
const HOJA_PAGINAS = 'Paginas';
const HOJA_RESPUESTAS = 'Respuestas';
 
const COLS_M = ['id', 'url', 'nombre', 'icono', 'categoria', 'descripcion', 'nota', 'notaPrivada',
                'etiquetas', 'color', 'favorita', 'paginas', 'agregado', 'incrustar'];
const COLS_P = ['id', 'titulo', 'slug', 'visibilidad', 'descripcion', 'color', 'orden',
                'tipo', 'consigna', 'lista', 'abierto', 'revelado', 'anonimo', 'devolucion'];
const COLS_R = ['id', 'pagina', 'estudiante', 'texto', 'creado', 'editado', 'nota', 'comentario', 'token'];
 
const MAX_TEXTO = 3000;
 
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
      // sin clave
      case 'publico':     return publico(d.p);
      case 'responder':   return responderPizarron(d);
      case 'mirespuesta': return miRespuesta(d);
      // con clave
      case 'verificar':   verificar(d.clave); return { ok: true };
      case 'cargar':      verificar(d.clave); return Object.assign({ ok: true }, leerTodo());
      case 'guardar':     verificar(d.clave); return guardar(d);
      case 'respuestas':  verificar(d.clave); return { ok: true, respuestas: respuestasDe(d.pagina) };
      case 'calificar':   verificar(d.clave); return calificar(d);
      case 'borrarRespuesta': verificar(d.clave); return borrarRespuesta(d);
      default:            return { ok: false, error: 'Acción desconocida' };
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
 
/* ---------- hojas ---------- */
function hoja(nombre, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    h.setFrozenRows(1);
  } else {
    // agrega columnas nuevas si la hoja es de una versión anterior
    const cab = h.getRange(1, 1, 1, Math.max(1, h.getLastColumn())).getValues()[0];
    const faltan = cols.filter(c => cab.indexOf(c) < 0);
    if (faltan.length) h.getRange(1, cab.filter(String).length + 1, 1, faltan.length).setValues([faltan]).setFontWeight('bold');
  }
  return h;
}
 
function leerFilas(nombre, cols) {
  const valores = hoja(nombre, cols).getDataRange().getValues();
  const cab = valores.shift() || [];
  return valores
    .map((f, i) => {
      const o = { _fila: i + 2 };
      cols.forEach(c => { const k = cab.indexOf(c); o[c] = k < 0 ? '' : f[k]; });
      return o;
    })
    .filter(o => String(o.id) !== '');
}
 
function escribirFila(nombre, cols, fila, obj) {
  const h = hoja(nombre, cols);
  const cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
  const valores = cab.map(c => (c in obj ? obj[c] : ''));
  h.getRange(fila, 1, 1, valores.length).setValues([valores]);
}
 
const lista = v => String(v || '').split(',').map(x => x.trim()).filter(String);
const lineas = v => String(v || '').split(/\r?\n/).map(x => x.trim()).filter(String);
const bool = v => v === true || String(v).toUpperCase() === 'TRUE' || v === 1 || v === '1';
const boolDef = (v, def) => (v === '' || v == null ? def : bool(v));
 
function aMarcador(f) {
  return {
    id: String(f.id), url: String(f.url), name: String(f.nombre), icon: String(f.icono),
    cat: String(f.categoria), desc: String(f.descripcion), note: String(f.nota),
    notePrivate: bool(f.notaPrivada), tags: lista(f.etiquetas), color: String(f.color || 'yellow'),
    fav: bool(f.favorita), pages: lista(f.paginas), added: Number(f.agregado) || 0,
    embed: String(f.incrustar || '')
  };
}
function aPagina(f) {
  return {
    id: String(f.id), title: String(f.titulo), slug: String(f.slug),
    visibility: String(f.visibilidad) === 'publica' ? 'publica' : 'privada',
    desc: String(f.descripcion), color: String(f.color || 'yellow'), order: Number(f.orden) || 0,
    type: String(f.tipo) === 'pizarron' ? 'pizarron' : 'recursos',
    prompt: String(f.consigna || ''), roster: String(f.lista || ''),
    open: boolDef(f.abierto, true), revealed: bool(f.revelado),
    anonymous: bool(f.anonimo), feedback: bool(f.devolucion)
  };
}
function aRespuesta(f) {
  return {
    id: String(f.id), pagina: String(f.pagina), estudiante: String(f.estudiante), texto: String(f.texto),
    creado: Number(f.creado) || 0, editado: Number(f.editado) || 0,
    nota: String(f.nota), comentario: String(f.comentario)
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
 
function paginaPublica(slug) {
  if (!slug) throw new Error('Falta el link de la página');
  const pag = leerFilas(HOJA_PAGINAS, COLS_P).map(aPagina)
    .find(p => p.slug === String(slug) && p.visibility === 'publica');
  if (!pag) throw new Error('Esta página no existe o no es pública');
  return pag;
}
 
/* ---------- vista pública (sin clave) ---------- */
function publico(slug) {
  // Nunca se entrega la lista de páginas: cada una se ve solo con su link.
  const pag = paginaPublica(slug);
 
  const marcadores = leerFilas(HOJA_MARCADORES, COLS_M).map(aMarcador)
    .filter(m => m.pages.indexOf(pag.id) >= 0)
    .map(m => ({
      id: m.id, url: m.url, name: m.name, icon: m.icon, cat: m.cat, desc: m.desc,
      note: m.notePrivate ? '' : m.note, tags: m.tags, color: m.color, fav: m.fav,
      added: m.added, embed: m.embed
    }));
 
  const pagina = { title: pag.title, slug: pag.slug, desc: pag.desc, color: pag.color, type: pag.type };
  const salida = { ok: true, pagina: pagina, marcadores: marcadores };
 
  if (pag.type === 'pizarron') {
    const resp = leerFilas(HOJA_RESPUESTAS, COLS_R).map(aRespuesta).filter(r => r.pagina === pag.id);
    Object.assign(pagina, {
      prompt: pag.prompt, roster: lineas(pag.roster), open: pag.open,
      revealed: pag.revealed, anonymous: pag.anonymous, feedback: pag.feedback,
      respondieron: resp.length
    });
    // Las respuestas de los demás solo salen del servidor cuando la docente las revela.
    if (pag.revealed) {
      salida.respuestas = resp
        .sort((a, b) => pag.anonymous ? (a.id < b.id ? -1 : 1) : a.creado - b.creado)
        .map(r => ({ id: r.id, estudiante: pag.anonymous ? '' : r.estudiante, texto: r.texto }));
    }
  }
  return salida;
}
 
/* ---------- pizarrón: estudiantes (sin clave) ---------- */
function responderPizarron(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const pag = paginaPublica(d.p);
    if (pag.type !== 'pizarron') throw new Error('Esta página no es un pizarrón');
    if (pag.revealed) throw new Error('Las respuestas ya se mostraron: no se pueden enviar ni cambiar');
    if (!pag.open) throw new Error('El pizarrón no está recibiendo respuestas');
 
    const estudiante = String(d.estudiante || '').trim();
    const roster = lineas(pag.roster);
    if (!estudiante) throw new Error('Falta elegir el nombre');
    if (roster.length && roster.indexOf(estudiante) < 0) throw new Error('Ese nombre no está en la lista');
    const texto = String(d.texto || '').trim();
    if (!texto) throw new Error('La respuesta está vacía');
    if (texto.length > MAX_TEXTO) throw new Error('La respuesta es demasiado larga (máximo ' + MAX_TEXTO + ' caracteres)');
 
    const filas = leerFilas(HOJA_RESPUESTAS, COLS_R);
    const previa = filas.find(f => String(f.pagina) === pag.id && String(f.estudiante) === estudiante);
    const ahora = Date.now();
 
    if (previa) {
      if (!d.token || String(d.token) !== String(previa.token)) {
        throw new Error('Ya hay una respuesta con ese nombre enviada desde otro dispositivo. Avisale a la docente.');
      }
      previa.texto = seguro(texto); previa.editado = ahora;
      escribirFila(HOJA_RESPUESTAS, COLS_R, previa._fila, previa);
      return { ok: true, id: String(previa.id), token: String(previa.token), editado: ahora };
    }
    const nueva = { id: Utilities.getUuid().slice(0, 8), pagina: pag.id, estudiante: seguro(estudiante),
                    texto: seguro(texto), creado: ahora, editado: '', nota: '', comentario: '',
                    token: Utilities.getUuid() };
    const h = hoja(HOJA_RESPUESTAS, COLS_R);
    const cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
    h.appendRow(cab.map(c => (c in nueva ? nueva[c] : '')));
    return { ok: true, id: nueva.id, token: nueva.token, creado: ahora };
  } finally {
    lock.releaseLock();
  }
}
 
function miRespuesta(d) {
  const pag = paginaPublica(d.p);
  const f = leerFilas(HOJA_RESPUESTAS, COLS_R)
    .find(r => String(r.pagina) === pag.id && String(r.estudiante) === String(d.estudiante || ''));
  if (!f || !d.token || String(f.token) !== String(d.token)) return { ok: false, error: 'Sin respuesta' };
  const r = aRespuesta(f);
  return { ok: true, id: r.id, texto: r.texto,
           nota: pag.feedback ? r.nota : '', comentario: pag.feedback ? r.comentario : '' };
}
 
/* ---------- pizarrón: docente (con clave) ---------- */
function respuestasDe(paginaId) {
  return leerFilas(HOJA_RESPUESTAS, COLS_R).map(aRespuesta)
    .filter(r => r.pagina === String(paginaId))
    .sort((a, b) => a.creado - b.creado);
}
 
function calificar(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const f = leerFilas(HOJA_RESPUESTAS, COLS_R).find(r => String(r.id) === String(d.id));
    if (!f) throw new Error('No se encontró la respuesta');
    if ('nota' in d) f.nota = seguro(d.nota);
    if ('comentario' in d) f.comentario = seguro(d.comentario);
    escribirFila(HOJA_RESPUESTAS, COLS_R, f._fila, f);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
 
function borrarRespuesta(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const f = leerFilas(HOJA_RESPUESTAS, COLS_R).find(r => String(r.id) === String(d.id));
    if (!f) throw new Error('No se encontró la respuesta');
    hoja(HOJA_RESPUESTAS, COLS_R).deleteRow(f._fila);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
 
/* ---------- guardado del cuaderno (con clave) ---------- */
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
      !!m.fav, seguro((m.pages || []).join(',')), Number(m.added) || 0, seguro(m.embed)
    ]));
    escribir(HOJA_PAGINAS, COLS_P, paginas.map((p, i) => [
      seguro(p.id), seguro(p.title), seguro(p.slug), p.visibility === 'publica' ? 'publica' : 'privada',
      seguro(p.desc), seguro(p.color), i,
      p.type === 'pizarron' ? 'pizarron' : 'recursos', seguro(p.prompt), seguro(p.roster),
      p.open !== false, !!p.revealed, !!p.anonymous, !!p.feedback
    ]));
 
    props.setProperty('REV', String(rev + 1));
    return { ok: true, rev: rev + 1 };
  } finally {
    lock.releaseLock();
  }
}
 
