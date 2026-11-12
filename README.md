# Cuaderno de recursos

Cuaderno digital para docentes: marcadores con etiquetas y anotaciones, páginas privadas o compartidas, pizarrones donde responden los estudiantes, actividades estilo Wordwall, modo bloqueado para trabajar en clase y paso de notas al Portafolio Docente de ANEP.

**Dirección del cuaderno:** https://recursos-docentes.github.io/miCuadernoDeRecursos/

Las páginas compartidas usan esa misma dirección con `?p=` y el nombre de la página al final (por ejemplo `…/miCuadernoDeRecursos/?p=grupo-a-9d9f3`). La dirección principal no muestra ninguna lista: cada página se ve solo con su link.

## Archivos

| Archivo | Dónde va | Para qué |
|---|---|---|
| `index.html` | repo de GitHub | La página |
| `actividades.js` | repo de GitHub, junto a `index.html` | Los juegos de las páginas de actividad |
| `config.js` | repo de GitHub, junto a `index.html` | La URL de Apps Script y el nombre de la autora |
| `Codigo.gs` | Apps Script, dentro de una planilla de Google | El servidor |
| `anep.html` | repo de GitHub, junto a `index.html` | Instala el marcador «📋 Pegar notas» para el Portafolio de ANEP |
| `imagen/` | repo de GitHub | Imágenes para las actividades (por ejemplo, los diagramas etiquetados) |

Sin conectar la planilla, el cuaderno funciona igual, pero todo queda guardado **solo en ese navegador** y no se pueden compartir páginas.

## Instalación

### 1. Planilla y servidor

1. Crear una planilla nueva en Google Sheets (por ejemplo «Cuaderno de recursos»).
2. **Extensiones → Apps Script**. Borrar lo que hay, pegar todo `Codigo.gs` y guardar.
3. **Configuración del proyecto** (⚙) → **Propiedades de la secuencia de comandos** → agregar la propiedad `CLAVE` con la clave para entrar al cuaderno.
4. **Implementar → Nueva implementación → Aplicación web**: ejecutar como **Yo**, acceso **Cualquier usuario**.
5. Autorizar los permisos y copiar la URL (termina en `/exec`).

«Cualquier usuario» es necesario para que las páginas compartidas se vean sin cuenta de Google. La planilla sigue siendo privada: sin la clave, el servidor solo entrega las páginas compartidas, de a una y con su link.

### 2. Conectar la página

En `config.js`:

```js
window.CUADERNO_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXX/exec',
  AUTORA: 'Nombre que aparece como subtítulo'
};
```

Subir `index.html`, `actividades.js` y `config.js` al repo y activar GitHub Pages. `config.js` se completa una sola vez: las actualizaciones de `index.html` no lo tocan.

### 3. Primer uso

Abrir la página → **Entrar** → escribir la clave. Si la planilla está vacía, el cuaderno ofrece subir las notas que haya en ese navegador, o se puede usar **Restaurar** con un archivo de respaldo.

### Actualizar

- Cambios en `index.html` o `actividades.js`: subir el archivo nuevo al repo y recargar sin caché (Ctrl + Fn + F5).
- Cambios en `Codigo.gs`: pegar el código nuevo en Apps Script y hacer **Implementar → Administrar implementaciones → ✎ → Versión: nueva → Implementar**. Así la URL sigue siendo la misma.

## Índice y grupos

El cuaderno abre en el **Índice**: todos los grupos con sus páginas, como el índice de un cuaderno. A la derecha hay una **pestaña de color por grupo**, con la asignatura arriba y el lugar abajo (en el celular quedan en una fila arriba).

- La primera vez, el Índice ofrece crear los grupos escribiendo uno por línea. Después: pestaña **+** para uno nuevo y «editar grupo» para renombrarlo, cambiarle el color o borrarlo (sus páginas pasan a «Sin grupo», no se borran).
- **Lista de estudiantes del grupo**: en «editar grupo», un nombre por línea (se puede pegar una columna de Google Sheets). La usan todas las páginas del grupo: pizarrones, actividades con registro, modo bloqueado y ruletas sin contenido. Una página puede tener su propia lista (por ejemplo, un subgrupo); si se deja vacía, usa la del grupo.
- Al tocar la pestaña de un grupo, arriba aparecen solo sus páginas. «📚 Todo» muestra todas las notas.
- **Copiar una página a otro grupo**: en la página, «copiar a otro grupo». Se crea una copia con su propio link y sus propios resultados, con la misma consigna, contenido y materiales.

## Notas (marcadores)

- **+ Pegar nota**: dirección, nombre, ícono, descripción, categoría, color y páginas donde aparece (una nota puede estar en varias).
- **Etiquetas**: separadas por comas. La nube de etiquetas filtra; si se eligen varias, muestra las notas que tienen todas.
- **Anotaciones** (📝): texto largo de cada nota. «Anotación privada» no aparece en las páginas compartidas.
- **Videos**: los de YouTube y Vimeo se ven dentro de la nota (miniatura, se reproducen ahí mismo; ⤢ los agranda). Los Google Forms, Docs, Slides y archivos de Drive se abren dentro del cuaderno con ▶. Para otros sitios (Genially, Wordwall…), pegar su link o su código `<iframe>` en «Contenido para incrustar».
- **📌 Guardar desde webs**: arrastrar el botón amarillo a la barra de marcadores; en cualquier sitio, tocarlo guarda esa página (el texto seleccionado queda en las anotaciones).
- **Exportar / Restaurar**: copia de seguridad en un archivo JSON.

## Páginas

- **+ página** crea una página en el grupo actual. Tipos: 📚 Recursos, 🧑‍🏫 Pizarrón y 🎮 Actividad.
- 🔒 Privada (solo con la clave) o 🌐 Compartida (cualquiera con el link). Pizarrones y actividades son siempre compartidas.
- **Copiar link** da el link para los estudiantes, con un final al azar para que no se pueda adivinar. «editar página» → «Generar un link nuevo» corta el link anterior.
- **ver como visitante** abre la página como la ve un estudiante, empezando de cero (sin nombre ni bloqueo guardados de pruebas anteriores).
- Las páginas de los estudiantes no muestran el link «Entrar»: la docente entra desde la dirección principal del cuaderno.

## Pizarrón

1. Tipo **🧑‍🏫 Pizarrón**, con una consigna. Los videos y contenidos incrustados de la página aparecen abiertos debajo de la consigna.
2. Cada estudiante elige su nombre de la lista, escribe y envía. Puede corregir su respuesta hasta que se muestren todas, desde el mismo dispositivo.
3. Las respuestas empiezan **ocultas**: el servidor no le manda a nadie las de los demás; solo se ve cuántos respondieron.
4. Vista docente: quién falta, **nota y devolución** por respuesta (se guardan solas), «Descargar CSV», «📒 Pasar al Portafolio» y «borrar respuesta» (para que alguien vuelva a responder).
5. Botones de estado: recibiendo / no recibe respuestas · respuestas ocultas / visibles para todos · compañeros con nombre / sin nombre · devoluciones ocultas / visibles (cada estudiante ve solo la suya, en el dispositivo desde el que respondió).

## Actividades (estilo Wordwall)

Tipo **🎮 Actividad**: consigna opcional, plantilla y contenido con **un par por línea, separado por «|»**:

```
clase | Molde para crear objetos
objeto | Instancia de una clase
herencia | Mecanismo para reutilizar una clase
```

La misma lista sirve para todas las plantillas; se cambia de plantilla con un clic desde la página.

| Plantilla | Qué usa de cada par |
|---|---|
| 🔗 Unir con flechas | concepto ↔ definición |
| 🃏 Memotest | carta A ↔ carta B |
| ✏️ Crucigrama | palabra · pista |
| 🔎 Sopa de letras | palabra (pista opcional) |
| 🪢 Ahorcado | palabra · pista |
| 🔨 Atrapa el topo / 🎈 Explotar globos | respuesta · pregunta (las otras respuestas sirven de distractores) |
| 🗂️ Tarjetas | frente · dorso |
| 🎡 Ruleta / 🎁 Abrir la caja | opción o pregunta · respuesta opcional (para el proyector, sin puntaje) |
| 📦 Clasificar en grupos | elemento · grupo (ej. `int \| Primitivo`, `CREATE TABLE \| DDL`) |
| ✔️ Verdadero o falso | afirmación · V o F (10 segundos por afirmación; también con las teclas V y F) |

**🏷️ Diagrama etiquetado**: una imagen (un MER, un circuito, un robot…) con puntos donde hay que poner cada etiqueta. En «editar contenido», con la plantilla elegida, aparece **📍 Ubicar etiquetas sobre la imagen**: se pega el link de la imagen, se agregan las etiquetas y se toca en la imagen dónde va cada una. El contenido queda así (se puede editar a mano):

```
#imagen | https://drive.google.com/file/d/…/view
Entidad | 18.7, 48.8
Relación | 50, 48.7
Atributo | 18.7, 15.4
```

Las posiciones son porcentajes del ancho y del alto de la imagen. La imagen tiene que tener un link público: en Google Drive, compartirla como «Cualquier persona con el enlace» (el cuaderno convierte el link para poder mostrarla); también sirve una imagen subida a un repo de GitHub Pages. Si hay dos etiquetas iguales (dos «Entidad»), cualquiera de las dos vale en cualquiera de sus puntos.

**🧩 Ordenar líneas** usa otro formato: las líneas en el **orden correcto**, una por renglón, sin «|» (se respetan las sangrías y el «|» del código, como `||`, no corta). El juego las mezcla. Para varios ejercicios en la misma actividad, separarlos con una línea que diga `---`. El puntaje es la cantidad de líneas que quedan en su lugar.

```
for (int i = 0; i < v.length; i++) {
    suma += v[i];
}
---
Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
```

Una **ruleta sin contenido** gira con los nombres de la lista del grupo.

**Resultados**: «Práctica libre» no guarda nada. «Con registro» pide elegir el nombre y guarda puntaje, tiempo y fecha; se puede limitar a **un solo intento**.

**Corrección en el servidor (🔒)**: con registro, **Unir, Clasificar, Verdadero o falso, Ordenar líneas, Diagrama etiquetado y Crucigrama** se corrigen en el Apps Script. La página del estudiante recibe los elementos mezclados, sin las soluciones (con F12 no se ven), y el puntaje lo calcula el servidor (no se puede falsificar).
- Con registro no hay pistas durante el juego: en Verdadero o falso no se ve el acierto al momento, en Ordenar líneas se entregan todos los ejercicios juntos, y el crucigrama se entrega una vez. En práctica libre todo sigue igual que antes.
- La respuesta correcta (por ejemplo, la etiqueta que iba en el diagrama) solo se muestra si la actividad es de **un solo intento**; si se permiten varios, solo se marca qué estuvo bien y qué no. **Para una nota, usar un solo intento.**
- Las otras plantillas (memotest, sopa, ahorcado, topo, globos, tarjetas) necesitan las respuestas en la página para funcionar: con registro se pueden usar, pero su puntaje se marca con ⚠ («no verificado») en los resultados y al pasar al Portafolio. Sirven para practicar, no para notas. El editor lo avisa al elegir la plantilla.
- Los resultados guardados antes de esta versión también aparecen con ⚠.

**Tiempo límite** (opcional, en minutos): se ve un reloj; al terminarse, el juego se cierra y se guarda lo hecho hasta ese momento. En el memotest y la sopa de letras también hay un botón **Terminar** que guarda lo hecho (en el memotest, el puntaje descuenta los intentos de más: 10 parejas en 10 intentos = 10; en 20 intentos = 5). Vista docente: mejor resultado, último, intentos, quién falta, «reiniciar», «Descargar CSV» y «📒 Pasar al Portafolio». Lo que juega la docente en su vista es una vista previa y no se registra.

## Modo bloqueado

En «editar página», **🔒 Modo bloqueado** (para cualquier tipo de página), con un código de desbloqueo.

- El estudiante elige su nombre y toca **Comenzar**: pantalla completa, y todos los recursos se abren dentro de la página.
- Si sale de la pantalla completa, cambia de pestaña o de ventana, minimiza, recarga o intenta abrir las herramientas del navegador (F12, Ctrl+Shift+I, Ctrl+U), la pantalla se tapa y queda registrado con nombre y hora.
- **Para desbloquear, mejor desde la vista docente**: arriba del registro aparece «🔒 Bloqueados ahora» con un botón **Desbloquear** por estudiante; en su pantalla aparece «Seguir» a los pocos segundos. Así el código nunca se escribe en la computadora del estudiante (con F12 abierto, lo que se escribe ahí se puede ver).
- También se puede escribir el código en esa computadora. Si se usó delante de los estudiantes, «nuevo código» (al lado del código) genera otro.
- No marcar «Recordar en este dispositivo» al entrar desde una computadora de estudiantes: la clave quedaría guardada en ese navegador.
- Vista docente: **Registro del modo bloqueado** (quién salió, cuándo, cuántas veces); en pizarrones, columna «Salidas» en el CSV.
- Al desmarcar el modo bloqueado, se libera en todas las computadoras en menos de medio minuto.

## Pasar notas al Portafolio Docente de ANEP

1. **Instalar el marcador** (una sola vez): abrir [anep.html](https://recursos-docentes.github.io/miCuadernoDeRecursos/anep.html) y arrastrar el botón **📋 Pegar notas** a la barra de marcadores.
2. **Copiar las notas**: en los resultados de una actividad con registro o en el panel de un pizarrón, **📋 Copiar para ANEP** (copia nombre, nota y un comentario).
3. **Crear la evaluación en el Portafolio**: Calificaciones → Evaluar a todo el grupo → Nueva evaluación grupal, con «Calificaciones del 1 al 10».
4. **Pegar**: con la evaluación abierta, tocar el marcador **📋 Pegar notas** → **Completar**. Si se quiere el comentario (por ejemplo «Unir con flechas: 3/4» o la devolución del pizarrón), marcar «Escribir también el comentario».
5. **Revisar y guardar**: las notas puestas quedan en verde y los casilleros sin nota en amarillo; el cuadro avisa nombres dudosos o que no están. **El marcador no guarda**: se aprieta «Guardar» en el Portafolio.

- Actividades: el puntaje se lleva a 10, con mínimo 1 (4 de 10 → 4; 7 de 12 → 6); con varios intentos se copia el mejor. Los puntajes ⚠ no verificados piden confirmación antes de copiarse. Pizarrones: la nota puesta en cada respuesta.
- Los nombres se emparejan sin importar mayúsculas, tildes ni el orden nombre/apellido; conviene que la lista del grupo tenga los nombres como en el Portafolio.
- El marcador también sirve con lo copiado desde dos columnas de cualquier planilla. Todo pasa dentro del navegador; no es una herramienta oficial de ANEP.

## Hojas de la planilla

| Hoja | Qué guarda |
|---|---|
| Marcadores | Las notas |
| Paginas | Las páginas |
| Secciones | Los grupos y sus listas de estudiantes |
| Respuestas | Las respuestas de los pizarrones, con nota y devolución |
| Resultados | Los resultados de las actividades con registro |
| Incidentes | Entradas, salidas y desbloqueos del modo bloqueado |

No conviene editar estas hojas a mano: el cuaderno las reescribe al guardar.

## Límites

- Los estudiantes no tienen usuario y contraseña: alguien podría elegir el nombre de un compañero que todavía no respondió. Si pasa, se borra esa respuesta y se avisa al grupo. Una respuesta ya enviada no se puede cambiar desde otro dispositivo.
- En práctica libre, y en memotest, sopa, ahorcado, topo, globos y tarjetas aun con registro, las respuestas están dentro de la página: con F12 se podrían ver. Para notas, usar las plantillas que se corrigen en el servidor (🔒) con un solo intento.
- Cualquiera puede elegir de la lista el nombre de un compañero. Con un solo intento eso le «gasta» el intento, pero queda registrado con la hora y se nota enseguida.
- El modo bloqueado no puede bloquear la computadora: no detecta un celular al lado ni otra pantalla, y con las herramientas del navegador ya abiertas alguien con conocimientos podría quitar la pantalla de bloqueo (lo que sí queda es el registro de la salida). En iPhone/iPad no hay pantalla completa para páginas web.
- Algunos sitios no permiten mostrarse dentro de otra página; esos no se ven incrustados.

## Extensiones a futuro

### Pasar notas al Portafolio de Clase

Ya está programado en el cuaderno, pero queda para más adelante, cuando se use la libreta de clase de la docente (Portafolio de Clase). En los resultados de un pizarrón o de una actividad con registro, el botón **📒 Pasar al Portafolio** pasa las notas a esa libreta:

1. Elegir el **grupo del Portafolio** (se propone el más parecido y después se recuerda) y la **clase** (por defecto, la última dictada). «+ Clase nueva…» crea una clase, que cuenta como horas dictadas para las faltas.
2. **Nombre de la columna**: si coincide con una ya usada (por ejemplo «Escrito»), el Portafolio las promedia juntas.
3. Revisar la tabla: nota de cada estudiante y con quién se empareja en el Portafolio (se emparejan solos por nombre, sin importar mayúsculas, tildes ni el orden nombre/apellido). Las notas se pueden corregir.
4. **Pasar notas**: se guardan como columna de nota de ese día, sin tocar asistencia ni lo demás.

- Actividades: el puntaje llevado a 10, con mínimo 1 (4 de 10 → 4; 7 de 12 → 6) (el mejor intento, el primero o el último). Si el puntaje no fue corregido en el servidor, la tabla lo marca «⚠ no verificado». Pizarrones: la nota puesta en cada respuesta.
- En la página queda escrito **cuándo se pasó a la libreta**, a qué grupo, clase y columna, y cuántas notas.
- Es una **copia**: borrar o cambiar una nota en el cuaderno no la cambia en la libreta. Para actualizarla, volver a pasarla a la misma clase y columna (pregunta antes de reemplazar), o corregirla en el Portafolio.
- La conexión usa la misma URL y clave del Portafolio; si el Portafolio ya está conectado en ese navegador, se toma sola.

---

<div align="center">

***

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Licencia Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a> 

####  **Prof. Elizabeth Izquierdo con asistencia de Claude**
</div>
