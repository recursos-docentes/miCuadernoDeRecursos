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
const HOJA_INCIDENTES = 'Incidentes';
const HOJA_RESULTADOS = 'Resultados';
const HOJA_SECCIONES = 'Secciones';
 
const COLS_M = ['id', 'url', 'nombre', 'icono', 'categoria', 'descripcion', 'nota', 'notaPrivada',
                'etiquetas', 'color', 'favorita', 'paginas', 'agregado', 'incrustar'];
const COLS_P = ['id', 'titulo', 'slug', 'visibilidad', 'descripcion', 'color', 'orden',
                'tipo', 'consigna', 'lista', 'abierto', 'revelado', 'anonimo', 'devolucion',
                'bloqueado', 'codigo', 'plantilla', 'contenido', 'modoActividad', 'intentoUnico', 'seccion', 'portafolio', 'tiempo'];
const COLS_R = ['id', 'pagina', 'estudiante', 'texto', 'creado', 'editado', 'nota', 'comentario', 'token'];
const COLS_I = ['id', 'pagina', 'estudiante', 'tipo', 'detalle', 'fecha'];
const COLS_S = ['id', 'nombre', 'color', 'lista'];
const COLS_A = ['id', 'pagina', 'estudiante', 'plantilla', 'puntaje', 'total', 'segundos', 'detalle', 'fecha', 'verificado'];
 
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
      case 'incidente':   return registrarIncidente(d);
      case 'desbloquear': return desbloquear(d);
      case 'estadoBloqueo': return estadoBloqueo(d);
      case 'resultado':   return guardarResultado(d);
      case 'corregir':    return corregirActividad(d);
      // con clave
      case 'verificar':   verificar(d.clave); return { ok: true };
      case 'cargar':      verificar(d.clave); return Object.assign({ ok: true }, leerTodo());
      case 'guardar':     verificar(d.clave); return guardar(d);
      case 'respuestas':  verificar(d.clave); return { ok: true, respuestas: respuestasDe(d.pagina) };
      case 'calificar':   verificar(d.clave); return calificar(d);
      case 'borrarRespuesta': verificar(d.clave); return borrarRespuesta(d);
      case 'incidentes':  verificar(d.clave); return { ok: true, incidentes: incidentesDe(d.pagina) };
      case 'desbloquearDesde': verificar(d.clave); return desbloquearDesde(d);
      case 'resultados':  verificar(d.clave); return { ok: true, resultados: resultadosDe(d.pagina) };
      case 'borrarResultado': verificar(d.clave); return borrarFila(HOJA_RESULTADOS, COLS_A, d.id);
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
// nombres: tabulaciones, espacios dobles o espacios «duros» (pegados desde una planilla) cuentan como un espacio
const limpiarNombre = v => String(v == null ? '' : v).replace(/[\s\u00a0]+/g, ' ').trim();
const canon = v => limpiarNombre(v).toLowerCase();
const lineas = v => String(v || '').split(/\r?\n/).map(limpiarNombre).filter(String);
/* Devuelve el nombre tal como está en la lista (o null si no está); sin lista, acepta el nombre */
function nombreEnLista(roster, nombre) {
  const n = limpiarNombre(nombre);
  if (!n) return null;
  if (!roster.length) return n;
  return roster.find(x => canon(x) === canon(n)) || null;
}
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
    type: ['pizarron', 'actividad'].indexOf(String(f.tipo)) >= 0 ? String(f.tipo) : 'recursos',
    prompt: String(f.consigna || ''), roster: String(f.lista || ''),
    open: boolDef(f.abierto, true), revealed: bool(f.revelado),
    anonymous: bool(f.anonimo), feedback: bool(f.devolucion),
    locked: bool(f.bloqueado), code: String(f.codigo || ''),
    template: String(f.plantilla || 'unir'), pairs: jsonLista(f.contenido),
    actMode: String(f.modoActividad) === 'registro' ? 'registro' : 'practica', single: bool(f.intentoUnico),
    section: String(f.seccion || ''), porta: jsonLista(f.portafolio),
    timeLimit: Math.max(0, Math.min(180, Number(f.tiempo) || 0))
  };
}
function jsonLista(v) { try { const a = JSON.parse(String(v || '[]')); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
 
/* Grupos del índice, con su lista de estudiantes */
function leerSecciones() {
  const filas = leerFilas(HOJA_SECCIONES, COLS_S);
  if (filas.length) return filas.map(f => ({ id: String(f.id), name: String(f.nombre), color: String(f.color || 'yellow'), roster: String(f.lista || '') }));
  // versión anterior: los grupos estaban en una propiedad
  return jsonLista(PropertiesService.getScriptProperties().getProperty('SECCIONES')).map(x => ({ ...x, roster: '' }));
}
/* Lista que usa una página: la propia si tiene; si no, la de su grupo */
function listaEfectiva(pag) {
  const propia = lineas(pag.roster);
  if (propia.length || !pag.section) return propia;
  const g = leerSecciones().find(x => x.id === pag.section);
  return g ? lineas(g.roster) : [];
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
    paginas: leerFilas(HOJA_PAGINAS, COLS_P).map(aPagina).sort((a, b) => a.order - b.order),
    secciones: leerSecciones()
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
 
  const pagina = { title: pag.title, slug: pag.slug, desc: pag.desc, color: pag.color, type: pag.type,
                   locked: pag.locked };
  // el código de desbloqueo nunca sale del servidor
  const lista = listaEfectiva(pag);
  if (pag.locked) pagina.roster = lista;
  if (pag.type === 'actividad') {
    pagina.prompt = pag.prompt;
    // una ruleta sin contenido gira con los nombres del grupo
    const pares = pag.template === 'ruleta' && !pag.pairs.length ? lista.map(n => ({ a: n, b: '' })) : pag.pairs;
    pagina.activity = { template: pag.template, mode: pag.actMode, single: pag.single, timeLimit: pag.timeLimit };
    if (pag.actMode === 'registro' && VERIFICABLES.indexOf(pag.template) >= 0) {
      // con registro, las soluciones no salen del servidor: se manda la vista mezclada y se corrige acá
      pagina.activity.vista = nVista(pag.template, pag.pairs);
    } else {
      pagina.activity.pairs = pares;
    }
    if (pag.actMode === 'registro') pagina.roster = lista;
  }
  const salida = { ok: true, pagina: pagina, marcadores: marcadores };
 
  if (pag.type === 'pizarron') {
    const resp = leerFilas(HOJA_RESPUESTAS, COLS_R).map(aRespuesta).filter(r => r.pagina === pag.id);
    Object.assign(pagina, {
      prompt: pag.prompt, roster: lista, open: pag.open,
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
 
    if (!limpiarNombre(d.estudiante)) throw new Error('Falta elegir el nombre');
    const estudiante = nombreEnLista(listaEfectiva(pag), d.estudiante);
    if (!estudiante) throw new Error('Ese nombre no está en la lista');
    const texto = String(d.texto || '').trim();
    if (!texto) throw new Error('La respuesta está vacía');
    if (texto.length > MAX_TEXTO) throw new Error('La respuesta es demasiado larga (máximo ' + MAX_TEXTO + ' caracteres)');
 
    const filas = leerFilas(HOJA_RESPUESTAS, COLS_R);
    const previa = filas.find(f => String(f.pagina) === pag.id && canon(f.estudiante) === canon(estudiante));
    const ahora = Date.now();
 
    if (previa) {
      if (!d.token || String(d.token) !== String(previa.token)) {
        throw new Error('Ya hay una respuesta con ese nombre enviada desde otro dispositivo. Avisale a la docente.');
      }
      previa.texto = seguro(texto); previa.editado = ahora;
      escribirFila(HOJA_RESPUESTAS, COLS_R, previa._fila, previa);
      return { ok: true, id: String(previa.id), token: String(previa.token), editado: ahora, estudiante: String(previa.estudiante) };
    }
    const nueva = { id: Utilities.getUuid().slice(0, 8), pagina: pag.id, estudiante: seguro(estudiante),
                    texto: seguro(texto), creado: ahora, editado: '', nota: '', comentario: '',
                    token: Utilities.getUuid() };
    const h = hoja(HOJA_RESPUESTAS, COLS_R);
    const cab = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0];
    h.appendRow(cab.map(c => (c in nueva ? nueva[c] : '')));
    return { ok: true, id: nueva.id, token: nueva.token, creado: ahora, estudiante: estudiante };
  } finally {
    lock.releaseLock();
  }
}
 
function miRespuesta(d) {
  const pag = paginaPublica(d.p);
  const f = leerFilas(HOJA_RESPUESTAS, COLS_R)
    .find(r => String(r.pagina) === pag.id && canon(r.estudiante) === canon(d.estudiante));
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
 
/* ---------- modo bloqueado ---------- */
function registrarIncidente(d) {
  const pag = paginaPublica(d.p);
  if (!pag.locked) return { ok: true };
  const tipos = ['inicio', 'salida'];   // un desbloqueo nunca se registra desde la computadora del estudiante
  const tipo = tipos.indexOf(d.tipo) >= 0 ? d.tipo : 'salida';
  const estudiante = String(d.estudiante || '').trim().slice(0, 80);
  hoja(HOJA_INCIDENTES, COLS_I).appendRow([Utilities.getUuid().slice(0, 8), pag.id, seguro(estudiante), tipo,
    seguro(String(d.detalle || '').slice(0, 120)), Date.now()]);
  return { ok: true };
}
 
function desbloquear(d) {
  const pag = paginaPublica(d.p);
  if (!pag.locked) return { ok: true };
  // la planilla puede guardar «0482» como el número 482: se comparan normalizados
  const norm = v => { const t = String(v == null ? '' : v).trim(); return /^\d+$/.test(t) ? String(Number(t)) : t; };
  if (!pag.code || norm(d.codigo) !== norm(pag.code)) {
    Utilities.sleep(800);
    throw new Error('Código incorrecto');
  }
  hoja(HOJA_INCIDENTES, COLS_I).appendRow([Utilities.getUuid().slice(0, 8), pag.id,
    seguro(String(d.estudiante || '').slice(0, 80)), 'desbloqueo', 'con código', Date.now()]);
  return { ok: true };
}
 
/* La docente desbloquea a un estudiante desde su propia vista: no hace falta escribir nada en la computadora del estudiante */
function desbloquearDesde(d) {
  const pag = leerFilas(HOJA_PAGINAS, COLS_P).map(aPagina).find(p => p.id === String(d.pagina));
  if (!pag) throw new Error('No se encontró la página');
  hoja(HOJA_INCIDENTES, COLS_I).appendRow([Utilities.getUuid().slice(0, 8), pag.id,
    seguro(limpiarNombre(d.estudiante).slice(0, 80)), 'desbloqueo', 'desde la vista docente', Date.now()]);
  return { ok: true };
}
 
/* La página bloqueada del estudiante pregunta si ya la desbloquearon (el último evento posterior a su última salida) */
function estadoBloqueo(d) {
  const pag = paginaPublica(d.p);
  if (!pag.locked) return { ok: true, desbloqueado: true };
  const evs = leerFilas(HOJA_INCIDENTES, COLS_I)
    .filter(f => String(f.pagina) === pag.id && canon(f.estudiante) === canon(d.estudiante) && (f.tipo === 'salida' || f.tipo === 'desbloqueo'))
    .sort((a, b) => Number(a.fecha) - Number(b.fecha));
  const ult = evs[evs.length - 1];
  return { ok: true, desbloqueado: !!ult && ult.tipo === 'desbloqueo' };
}
 
function incidentesDe(paginaId) {
  return leerFilas(HOJA_INCIDENTES, COLS_I)
    .filter(f => String(f.pagina) === String(paginaId))
    .map(f => ({ id: String(f.id), estudiante: String(f.estudiante), tipo: String(f.tipo),
                 detalle: String(f.detalle), fecha: Number(f.fecha) || 0 }))
    .sort((a, b) => a.fecha - b.fecha);
}
 
/* ---------- actividades ---------- */
function guardarResultado(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const pag = paginaPublica(d.p);
    if (pag.type !== 'actividad' || pag.actMode !== 'registro') return { ok: true, sinRegistro: true };
    if (VERIFICABLES.indexOf(pag.template) >= 0) throw new Error('Esta actividad se corrige en el servidor: recargar la página.');
    if (!limpiarNombre(d.estudiante)) throw new Error('Falta el nombre');
    const estudiante = nombreEnLista(listaEfectiva(pag), d.estudiante);
    if (!estudiante) throw new Error('Ese nombre no está en la lista');
    if (pag.single && leerFilas(HOJA_RESULTADOS, COLS_A).some(r => String(r.pagina) === pag.id && canon(r.estudiante) === canon(estudiante))) {
      throw new Error('Ya hay un resultado registrado con ese nombre (un solo intento).');
    }
    const num = v => Math.max(0, Math.min(10000, Number(v) || 0));
    hoja(HOJA_RESULTADOS, COLS_A).appendRow([Utilities.getUuid().slice(0, 8), pag.id, seguro(estudiante),
      seguro(String(d.plantilla || pag.template).slice(0, 20)), num(d.puntaje), num(d.total), num(d.segundos),
      seguro(String(d.detalle || '').slice(0, 120)), Date.now(), 'no']);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
 
/* Actividades con registro verificables: el servidor corrige y guarda (el navegador no manda el puntaje) */
function corregirActividad(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const pag = paginaPublica(d.p);
    if (pag.type !== 'actividad' || pag.actMode !== 'registro' || VERIFICABLES.indexOf(pag.template) < 0) {
      throw new Error('Esta actividad no se corrige en el servidor: recargar la página.');
    }
    if (!limpiarNombre(d.estudiante)) throw new Error('Falta el nombre');
    const estudiante = nombreEnLista(listaEfectiva(pag), d.estudiante);
    if (!estudiante) throw new Error('Ese nombre no está en la lista');
    if (pag.single && leerFilas(HOJA_RESULTADOS, COLS_A).some(r => String(r.pagina) === pag.id && canon(r.estudiante) === canon(estudiante))) {
      throw new Error('Ya hay un resultado registrado con ese nombre (un solo intento).');
    }
    if (JSON.stringify(d.respuestas || null).length > 50000) throw new Error('Respuesta demasiado grande');
    const r = nCorregir(pag.template, pag.pairs, d.respuestas);
    if (r.error) throw new Error(r.error);
    const seg = Math.max(0, Math.min(100000, Math.round(Number(d.segundos) || 0)));
    hoja(HOJA_RESULTADOS, COLS_A).appendRow([Utilities.getUuid().slice(0, 8), pag.id, seguro(estudiante),
      seguro(pag.template), r.puntaje, r.total, seg, '', Date.now(), 'sí']);
    // la solución solo se devuelve si no hay otro intento (si no, serviría para el siguiente)
    return { ok: true, puntaje: r.puntaje, total: r.total, items: r.items, sol: pag.single ? r.sol : null };
  } finally {
    lock.releaseLock();
  }
}
 
function resultadosDe(paginaId) {
  return leerFilas(HOJA_RESULTADOS, COLS_A)
    .filter(f => String(f.pagina) === String(paginaId))
    .map(f => ({ id: String(f.id), estudiante: String(f.estudiante), plantilla: String(f.plantilla),
                 puntaje: Number(f.puntaje) || 0, total: Number(f.total) || 0, segundos: Number(f.segundos) || 0,
                 detalle: String(f.detalle), fecha: Number(f.fecha) || 0, verificado: String(f.verificado) === 'sí' }))
    .sort((a, b) => a.fecha - b.fecha);
}
 
function borrarFila(nombre, cols, id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const f = leerFilas(nombre, cols).find(r => String(r.id) === String(id));
    if (!f) throw new Error('No se encontró el registro');
    hoja(nombre, cols).deleteRow(f._fila);
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
      ['pizarron', 'actividad'].indexOf(p.type) >= 0 ? p.type : 'recursos', seguro(p.prompt), seguro(p.roster),
      p.open !== false, !!p.revealed, !!p.anonymous, !!p.feedback,
      !!p.locked, /^\d+$/.test(String(p.code || '')) ? "'" + p.code : seguro(p.code), // texto, para no perder ceros
      seguro(p.template || ''), JSON.stringify(Array.isArray(p.pairs) ? p.pairs.map(x => ({ a: String(x.a || ''), b: String(x.b || '') })) : []),
      p.actMode === 'registro' ? 'registro' : 'practica', !!p.single, seguro(p.section || ''),
      JSON.stringify(Array.isArray(p.porta) ? p.porta.slice(0, 10) : []),
      Math.max(0, Math.min(180, Number(p.timeLimit) || 0))
    ]));
    // grupos del índice, con su lista de estudiantes
    if (Array.isArray(d.secciones)) {
      escribir(HOJA_SECCIONES, COLS_S, d.secciones.filter(x => x && x.id && x.name).slice(0, 100).map(x => [
        seguro(String(x.id).slice(0, 20)), seguro(String(x.name).slice(0, 60)), seguro(String(x.color || 'yellow').slice(0, 10)),
        seguro(String(x.roster || '').slice(0, 5000))
      ]));
    }
 
    props.setProperty('REV', String(rev + 1));
    return { ok: true, rev: rev + 1 };
  } finally {
    lock.releaseLock();
  }
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
 
