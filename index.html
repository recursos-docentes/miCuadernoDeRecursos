# Cuaderno de recursos
 
Marcadores con etiquetas, anotaciones y páginas que se pueden compartir o dejar privadas.
 
**Dirección del cuaderno:** https://recursos-docentes.github.io/miCuadernoDeRecursos/
 
Las páginas compartidas usan esa misma dirección con `?p=` y el nombre de la página al final (por ejemplo `…/miCuadernoDeRecursos/?p=grupo-a-9d9f3`).
 
| Archivo | Para qué |
|---|---|
| `index.html` | La página (va al repo de GitHub) |
| `config.js` | La URL de Apps Script y el nombre (va al repo, junto a `index.html`) |
| `actividades.js` | Los juegos de las páginas de actividad (va al repo, junto a `index.html`) |
| `Codigo.gs` | El servidor (va en Apps Script, dentro de una planilla de Google) |
 
Sin conectar la planilla, el cuaderno funciona igual, pero todo queda guardado **solo en ese navegador** y no se pueden compartir páginas.
 
## 1. Crear la planilla y el servidor
 
1. Crear una planilla nueva en Google Sheets (por ejemplo «Cuaderno de recursos»).
2. **Extensiones → Apps Script**. Borrar lo que hay y pegar todo `Codigo.gs`. Guardar.
3. **Configuración del proyecto** (ícono ⚙) → **Propiedades de la secuencia de comandos** → **Agregar propiedad**:
   - Propiedad: `CLAVE`
   - Valor: la clave para entrar al cuaderno
4. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Autorizar los permisos y copiar la **URL de la aplicación web** (termina en `/exec`).
«Cualquier usuario» es necesario para que las páginas compartidas se vean sin cuenta de Google. La planilla en sí sigue siendo privada: el servidor solo entrega las páginas marcadas como compartidas, y para todo lo demás exige la clave.
 
## 2. Conectar la página
 
La configuración está en un archivo aparte, `config.js`, para no tener que volver a pegarla cada vez que se actualiza `index.html`:
 
```js
window.CUADERNO_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXX/exec',
  AUTORA: ''
};
```
 
Subir `index.html` y `config.js` al repo y activar GitHub Pages.
 
## 3. Primer uso
 
1. Abrir la página → **Entrar** → escribir la clave.
2. Como la planilla está vacía, aparece **«Subir las notas de este navegador»**: carga las 52 notas iniciales (o las que ya tenías en ese navegador).
## Índice por grupos
 
El cuaderno abre en el **Índice**: una hoja con todos los grupos y sus páginas. A la derecha hay **pestañas de colores**, una por grupo (en el celular quedan arriba, en una fila).
 
- La primera vez, el Índice ofrece crear los grupos escribiendo uno por línea. Después: pestaña **+** para un grupo nuevo, «editar grupo» para renombrarlo, cambiarle el color o borrarlo (sus páginas pasan a «Sin grupo», no se borran).
- Al tocar la pestaña de un grupo, arriba aparecen solo las páginas de ese grupo.
- Cada página tiene su grupo en «editar página» → «Grupo». «📚 Todo» sigue mostrando todas las notas.
- **Copiar una página a otro grupo**: en la página, «copiar a otro grupo». Se elige el grupo de destino y se crea una copia con su propio link y sus propios resultados, con la misma consigna, contenido y materiales. La lista de estudiantes se toma de otra página de ese grupo (si hay); si no, cargarla en «editar página».
- **Lista de estudiantes del grupo**: en el Índice, «editar grupo» → «Estudiantes del grupo» (un nombre por línea; se puede pegar una columna de Google Sheets). Todas las páginas del grupo la usan: pizarrones, actividades con registro, modo bloqueado y ruletas sin contenido. Si un estudiante entra o se va, se cambia en un solo lugar. Una página puede tener su propia lista si la necesita (por ejemplo, un subgrupo): si se deja vacía, usa la del grupo.
- Los grupos y sus listas se guardan en la hoja **Secciones** de la planilla, y no cambian los links de las páginas compartidas.
## Cómo se usa
 
- **Páginas del cuaderno**: «+ página» crea un separador nuevo. 🔒 = privada, 🌐 = compartida. Se cambia tocando el botón de la página.
- **Compartir**: en una página 🌐 aparece «Copiar link» (`…/?p=nombre-xxxxx`, con un final al azar para que no se pueda adivinar). Quien abre el link solo ve esa página, sin poder editar. La dirección principal no muestra ninguna lista de páginas.
- **Cortar un link**: en «editar página», marcar «Generar un link nuevo». El link viejo deja de funcionar.
- **Una nota en varias páginas**: al editarla, marcar todas las páginas donde tiene que aparecer.
- **Etiquetas**: separadas por comas. La nube de etiquetas filtra; si se eligen varias, muestra las notas que tienen todas.
- **Anotaciones**: texto largo de cada nota (📝). Si se marca «Anotación privada», no aparece en las páginas compartidas.
- **📌 Guardar desde webs**: arrastrar el botón amarillo a la barra de marcadores. En cualquier sitio, tocarlo abre una ventanita para guardar esa página (si antes se selecciona texto, queda en las anotaciones).
- **Exportar / Restaurar**: copia de seguridad en un archivo JSON.
- **Contenido incrustado**: en cada nota, el campo «Contenido para incrustar» acepta links de YouTube, Vimeo, Google Forms/Docs/Slides/Drive, Genially, Wordwall, etc., o un código `<iframe>`. El botón ▶ lo abre dentro del cuaderno. Algunos sitios no permiten mostrarse dentro de otra página: para esos queda «Abrir en pestaña nueva».
## Pizarrón (los estudiantes responden)
 
1. «+ página» → tipo **Pizarrón**. Escribir la consigna y pegar la lista del grupo (un nombre por línea). Un pizarrón es siempre una página compartida.
2. Pasar el link a los estudiantes. Cada uno elige su nombre, escribe y envía. Puede corregir su respuesta hasta que se muestren todas, solo desde el mismo dispositivo.
3. Las respuestas empiezan **ocultas**: los estudiantes no reciben las de los demás (el servidor no las manda), solo ven cuántos respondieron.
4. En la vista docente: quién falta, nota y devolución por respuesta (se guardan solas al salir del campo), «Descargar CSV» (se abre en Excel).
5. Botones de estado:
   - **Recibiendo / No recibe respuestas**
   - **Respuestas ocultas / visibles para todos** (al mostrarlas ya no se pueden enviar ni cambiar)
   - **Compañeros: con nombre / sin nombre** (la docente siempre ve los nombres)
   - **Devoluciones ocultas / visibles**: cada estudiante ve solo su nota y devolución, en el dispositivo desde el que respondió.
6. «borrar respuesta» permite que un estudiante vuelva a responder (por ejemplo, si eligió el nombre equivocado).
Las respuestas quedan en la hoja **Respuestas** de la planilla.
 
Límite: como no hay usuarios con contraseña, un estudiante podría elegir el nombre de un compañero que todavía no respondió. Si pasa, se borra esa respuesta y se avisa al grupo.
 
 
## Actividades (estilo Wordwall)
 
«+ página» → tipo **🎮 Actividad**. Se escribe una consigna (opcional), se elige la plantilla y se carga el contenido: **un par por línea, separado por «|»**.
 
```
clase | Molde para crear objetos
objeto | Instancia de una clase
herencia | Mecanismo para reutilizar una clase
```
 
La misma lista sirve para todas las plantillas, y se puede cambiar de plantilla con un clic desde la página:
 
| Plantilla | Qué usa de cada par |
|---|---|
| 🔗 Unir con flechas | concepto ↔ definición |
| 🃏 Memotest | carta A ↔ carta B |
| ✏️ Crucigrama | palabra · pista |
| 🔎 Sopa de letras | palabra (la pista es opcional) |
| 🪢 Ahorcado | palabra · pista |
| 🔨 Atrapa el topo / 🎈 Explotar globos | respuesta · pregunta (las demás respuestas sirven de distractores) |
| 🗂️ Tarjetas | frente · dorso |
| 🎡 Ruleta / 🎁 Abrir la caja | opción o pregunta · respuesta opcional (para usar en el proyector, sin puntaje) |
 
En crucigrama, sopa y ahorcado las palabras se pasan a mayúsculas sin tildes ni espacios (la Ñ se respeta).
 
**Resultados**: «Práctica libre» no guarda nada. «Con registro» pide elegir el nombre de la lista y guarda puntaje, tiempo y fecha en la hoja **Resultados**; se puede limitar a **un solo intento**. En la vista docente se ve la tabla (mejor resultado, último, intentos, quién falta), «reiniciar» para que alguien vuelva a jugar y «Descargar CSV». Lo que juega la docente en su vista es una vista previa y no se registra.
 
Las actividades también se pueden usar con el **modo bloqueado**.
 
Límite: en los juegos, las respuestas están en la página (como en Wordwall), así que alguien con conocimientos podría verlas con F12. Para una evaluación seria conviene un pizarrón o el escrito digital.
 
## Pasar notas al Portafolio de Clase
 
En los resultados de un pizarrón o de una actividad con registro: **📒 Pasar al Portafolio**.
 
1. Se elige el **grupo del Portafolio** (se propone el que más se parece al grupo del cuaderno, y después se recuerda) y la **clase** (por defecto, la última dictada). «+ Clase nueva…» crea una clase: cuenta como horas dictadas para las faltas, así que solo conviene si ese día hubo clase.
2. **Nombre de la columna**: si coincide con una ya usada (por ejemplo «Escrito»), el resumen del Portafolio las promedia juntas.
3. Se revisa la tabla: cada estudiante del cuaderno con su nota y con quién se empareja en el Portafolio (se emparejan solos por nombre; «Ana» encuentra a «Ana Pérez» si es la única). Las notas se pueden corregir.
4. **Pasar notas**. Se guardan como una columna de nota de ese día en la clase elegida, sin tocar asistencia ni lo demás.
En las actividades la nota es proporcional de 1 a 10 (4 de 4 → 10, 2 de 4 → 6; se puede elegir el mejor intento o el último). En los pizarrones se pasa la nota que se puso en cada respuesta.
 
La conexión usa la misma URL y clave que el Portafolio. Si el Portafolio ya está conectado en ese navegador, no hay que hacer nada; si no, se pide una vez.
 
## Modo bloqueado
 
En «editar página», marcar **🔒 Modo bloqueado** (sirve para páginas de recursos y para pizarrones). Se completa la lista del grupo y un código de desbloqueo (se propone uno al azar). La página pasa a ser compartida.
 
- El estudiante elige su nombre y toca **Comenzar**: la página pasa a pantalla completa.
- Todos los recursos se abren **dentro** de la página (no se abren pestañas nuevas ni se ve el botón «Abrir en pestaña nueva»). Los sitios que no permiten mostrarse dentro de otra página no se van a ver: conviene probarlos antes con «ver como visitante».
- Si sale de la pantalla completa, cambia de pestaña o de ventana, minimiza o recarga, la pantalla se tapa y queda registrado con nombre y hora. Para seguir, la docente escribe el código en esa computadora. Recargar la página no lo destraba.
- En la vista docente aparece el **Registro del modo bloqueado** (quién salió, cuándo y cuántas veces) y, en los pizarrones, una columna «Salidas» en el CSV. Todo queda también en la hoja **Incidentes**.
- Si se desmarca el modo bloqueado, en menos de medio minuto se libera en todas las computadoras.
Límites: una página web no puede bloquear la computadora. No detecta un celular al lado, una segunda pantalla ni otro dispositivo. En iPhone/iPad no existe la pantalla completa para páginas web: ahí solo se detecta el cambio de app o de pestaña.
 
## Si se cambia `Codigo.gs`
 
Después de editar el código: **Implementar → Administrar implementaciones → ✎ → Versión: nueva → Implementar**. Así la URL sigue siendo la misma.
 
