# Manual de usuario — Cuaderno de recursos

Nov 12, 2026 · @Someone

El Cuaderno de recursos es una sola página web: el docente entra con su clave y ve todo; cada estudiante ve solo la página cuyo link recibe. Este manual parte de un cuaderno ya instalado y conectado a la planilla de Google.

## Antes de empezar

**Entrar como docente**

1. Abrir la dirección del cuaderno (por ejemplo, `https://recursos-docentes.github.io/miCuadernoDeRecursos/`).
2. Tocar **Entrar** y escribir la clave (la propiedad CLAVE del Apps Script).
3. Marcar **Recordar** solo en la computadora propia. En una computadora de la sala, no: quien la use después entraría como docente.

Arriba a la derecha tiene que decir **Conectado a la planilla**. Si no, todo se guarda solo en ese navegador.

**Partes de la pantalla**

| Parte | Dónde está | Para qué |
| --- | --- | --- |
| Pestañas de la derecha | Borde derecho, como un cuaderno | Índice, cada grupo, «Sin grupo» y «+» para crear grupo |
| Pestañas de arriba | Bajo el título | «Todo» (todas las notas), cada página del grupo y «+ página» |
| Barra de herramientas | Bajo las pestañas | Buscar, ordenar, «+ Pegar nota», «Guardar desde webs», «Exportar», «Restaurar» |
| Pie | Abajo | Estado de la conexión y **Salir** |

**Lo que ve un estudiante:** solo la página compartida cuyo link recibió. No ve el índice, los grupos ni las otras páginas, y el botón «Entrar» no aparece en las páginas compartidas.

## El índice y los grupos

Cada grupo (por ejemplo «Lógica, La Paz») es una pestaña a la derecha y junta sus páginas y su lista de estudiantes.

- **Índice:** la primera pestaña. Muestra cada grupo con sus páginas, cuántos estudiantes tiene y los enlaces **+ página** y **editar grupo**. Tocar el nombre de una página la abre. Los íconos indican si es pública (🌐), privada (🔒) o bloqueada (🔐).
- **Crear un grupo:** la pestaña **+** al pie de las pestañas. En el nombre, la materia va en el primer renglón y el lugar en el segundo («Prog1» / «La Paz»).
- **Editar un grupo:** **editar grupo** en el índice. Ahí se cambia el nombre, el color, se borra el grupo, y se carga la **lista de estudiantes**: un nombre por renglón (se puede pegar una columna de una planilla).
- **Lista copiada del Portafolio de ANEP:** pegar la columna de nombres y tocar **✂️ Acortar nombres de ANEP**, debajo de la lista. «PÉREZ GÓMEZ, ANA MARÍA» queda «Ana Pérez»; si dos quedan iguales, se les agrega el segundo apellido (y, si hace falta, el segundo nombre). Quita el número de lista y la cédula. **deshacer** vuelve a la lista pegada. Revisar y **Guardar**.
- **Para qué sirve la lista:** la usan todas las páginas del grupo: pizarrones, actividades con registro, modo bloqueado y ruletas sin contenido. Una página puede tener su propia lista (por ejemplo, un subgrupo); si se deja vacía, usa la del grupo.
- **Sin grupo:** las páginas que no pertenecen a ningún grupo.

Conviene que la lista salga del Portafolio de ANEP, completa o acortada: así el paso de notas empareja los nombres solo.

## Notas

Una nota es un enlace guardado (un repositorio, una página de Vercel, un video, un formulario) con su nombre, etiquetas y anotaciones.

**Agregar una nota**

1. Tocar **+ Pegar nota** y pegar el link.
2. Completar nombre, ícono, categoría, etiquetas (separadas por comas) y color.
3. **Anotación:** texto libre. Marcar **anotación privada** si no debe verse en las páginas compartidas.
4. **Incrustar:** si se quiere ver el contenido dentro de la nota (un video de YouTube, un cuestionario), pegar ahí su link o su código de inserción. Los videos se ven del tamaño de la nota y se agrandan al tocarlos.
5. En **Páginas**, marcar en qué páginas aparece la nota.

**Guardar desde otras webs:** arrastrar el botón amarillo **📌 Guardar desde webs** a la barra de marcadores. Después, en cualquier sitio, tocarlo guarda esa página en el cuaderno; si hay texto seleccionado, queda en la anotación.

**Buscar y ordenar**

- El buscador revisa nombres, anotaciones y etiquetas. Atajo: la tecla `/`.
- En una página compartida, el buscador busca solo dentro de esa página.
- Orden: **Por categoría**, **A–Z**, **Abiertas hace poco** o **Agregadas hace poco**. Tocar una etiqueta filtra por ella.

**Respaldo:** **Exportar** baja un archivo con todas las notas; **Restaurar** las vuelve a cargar. Guardar ese archivo en la computadora o en Drive, nunca en un repositorio público.

## Páginas

Una página es una hoja del cuaderno que se puede compartir con un grupo; hay tres tipos: **Recursos** (una lista de notas), **Pizarrón** y **Actividad**.

**Crear una página:** **+ página** (arriba o en el índice) → título, grupo, tipo y color → **Guardar**.

| Opción | Qué hace |
| --- | --- |
| Pública | Se ve con su link, sin clave. El link lleva un código al azar: no se puede adivinar ni listar |
| Privada | Solo la ve la docente con su clave |
| Lista de estudiantes de esta página | Opcional; si se deja vacía, usa la del grupo |
| Modo bloqueado | Para trabajar en clase con pantalla completa (ver más abajo) |

**Arriba de cada página abierta:**

- **Copiar link:** el link para pasarles a los estudiantes. Cada página tiene el suyo: un subgrupo no ve lo que se compartió con otro.
- **ver como visitante:** abre la página como la ve un estudiante, sin datos guardados de pruebas anteriores.
- **editar página:** cambia título, tipo, lista, modo bloqueado y, en las actividades, el contenido.
- **copiar a otro grupo:** hace una copia de la página en otro grupo, con su propio link. Si el otro grupo no tiene lista, ofrece copiar la de este.

## Pizarrón

En un pizarrón cada estudiante responde una consigna; las respuestas quedan ocultas para los compañeros hasta que la docente las revela.

**Armarlo:** **+ página** → tipo **Pizarrón** → escribir la **consigna** (puede llevar el link de un video, que se ve dentro del pizarrón) → **Guardar** → **Copiar link** y pasárselo al grupo.

**Lo que hace el estudiante:** elige su nombre de la lista, escribe y envía. Puede corregir su respuesta mientras el pizarrón esté abierto.

**Lo que controla la docente, en el panel del pizarrón:**

| Control | Efecto |
| --- | --- |
| Abierto / cerrado | Si se aceptan respuestas nuevas o cambios |
| Revelar respuestas | Los estudiantes ven las respuestas de todos |
| Anónimo | Al revelar, se ven sin nombres |
| Devoluciones visibles | Cada estudiante ve su nota y su devolución, solo la suya |
| Nota y devolución | Se escriben al lado de cada respuesta |
| Descargar CSV | Baja todas las respuestas con nota y devolución |
| 📋 Copiar para ANEP | Copia nombre, nota y devolución para el Portafolio de ANEP |

El panel también muestra quiénes faltan responder.

## Actividades

Una actividad es un juego estilo Wordwall armado con una lista de pares; con la misma lista se puede cambiar de plantilla en cualquier momento.

**Armarla:** **+ página** → tipo **Actividad** → elegir la **plantilla** → escribir el **contenido**, un par por renglón separado por `|` (por ejemplo `clase | Molde para crear objetos`) → **Guardar**. La ayuda bajo el cuadro dice qué va en cada lado.

| Plantilla | Contenido | Corrección con registro |
| --- | --- | --- |
| Unir con flechas | concepto \| definición | 🔒 servidor |
| Clasificar en grupos | elemento \| grupo | 🔒 servidor |
| Verdadero o falso | afirmación \| V o F | 🔒 servidor |
| Ordenar líneas | líneas en orden; ejercicios separados por `---` | 🔒 servidor |
| Diagrama etiquetado | `#imagen \| link` y una etiqueta por renglón | 🔒 servidor |
| Crucigrama | palabra \| pista | 🔒 servidor |
| Memotest | carta \| su pareja | ⚠ navegador |
| Sopa de letras, Ahorcado | palabra \| pista | ⚠ navegador |
| Atrapa el topo, Explotar globos | respuesta \| pregunta | ⚠ navegador |
| Tarjetas | frente \| dorso | ⚠ navegador |
| Ruleta | una opción por renglón (vacía = nombres del grupo) | sin puntaje |
| Abrir la caja | pregunta \| respuesta | sin puntaje |

**Resultados**

- **Práctica libre:** no se guarda nada; se puede repetir.
- **Con registro:** cada estudiante elige su nombre y se guarda el puntaje, el tiempo y la fecha. Se puede limitar a **un solo intento**.
- **🔒 Corregidas en el servidor:** con registro, las soluciones no llegan a la página del estudiante y el puntaje no se puede falsificar. **Para una nota, usar estas plantillas con un solo intento.**
- **⚠ Corregidas en el navegador:** el puntaje se puede falsificar; sirven para practicar. En los resultados aparecen con «⚠ no verificado».
- **Tiempo límite** (opcional, en minutos): al terminarse, el juego se cierra y se guarda lo hecho.

**Vista docente de una actividad con registro:** mejor puntaje, último, intentos, quién falta, **reiniciar** (borra los intentos de un estudiante), **Descargar CSV** y **📋 Copiar para ANEP**. Lo que juega la docente en su vista es una vista previa y no se registra.

## Diagrama etiquetado

En el diagrama, los estudiantes ubican etiquetas sobre puntos numerados de una imagen; la imagen tiene que estar publicada en internet.

1. **Subir la imagen** a la carpeta `imagen` del repositorio del cuaderno. Su link queda `…/miCuadernoDeRecursos/imagen/NOMBRE.png`, con el nombre exacto, respetando mayúsculas. Esperar un minuto a que GitHub la publique. También sirve una imagen de Drive compartida como «Cualquier persona con el enlace».
2. En la actividad (plantilla 🏷️ Diagrama etiquetado), **editar contenido** → **📍 Ubicar etiquetas sobre la imagen**.
3. Pegar el link de la imagen y escribir las etiquetas.
4. Tocar en la imagen dónde va cada etiqueta; pasa sola a la siguiente. **Listo** → **Guardar**.

El contenido queda escrito como `etiqueta | x, y`: x es cuánto se corre a la derecha y y cuánto baja, en porcentaje desde la esquina de arriba a la izquierda (el centro es `50, 50`). Se puede retocar a mano. Si dos etiquetas son iguales (dos «Subclase»), cualquiera vale en cualquiera de sus puntos.

Si la imagen no se ve, revisar que el link coincida con el nombre del archivo y recargar con **Ctrl+F5**.

## Modo bloqueado

El modo bloqueado pide pantalla completa y registra con nombre y hora cada vez que un estudiante sale de la página; frena a la mayoría, pero no reemplaza a la docente mirando.

**Activarlo:** en **editar página**, marcar **Modo bloqueado**. Funciona en páginas de recursos, pizarrones y actividades.

**Lo que pasa en la computadora del estudiante:**

1. Elige su nombre y entra en pantalla completa.
2. Si sale de pantalla completa, cambia de pestaña o de ventana, minimiza, recarga o aprieta F12 (o Ctrl+Shift+I, Ctrl+U), la pantalla se tapa y queda registrado.
3. Para seguir, necesita que la docente lo desbloquee.

**Desbloquear (mejor desde la vista docente):** en la página, arriba del registro, aparece **🔒 Bloqueados ahora** con un botón **Desbloquear** por estudiante. A los pocos segundos, en su pantalla aparece **Seguir**. Así el código nunca se escribe en la computadora del estudiante.

**El código de desbloqueo** también sirve, pero quien tenga las herramientas del navegador abiertas podría verlo. Si se usó delante de los estudiantes, tocar **nuevo código**.

**Registro:** muestra cada entrada, salida y desbloqueo con la hora, y cuántas salidas tuvo cada estudiante.

**Lo que no puede evitar:** un celular al lado, otra pantalla, o alguien con conocimientos que ya tenía abiertas las herramientas del navegador. En iPhone y iPad no hay pantalla completa para páginas web.

## Pasar notas al Portafolio Docente de ANEP

Las notas de actividades y pizarrones se copian del cuaderno y se pegan en una evaluación del Portafolio con el marcador **📋 Pegar notas**, que completa los casilleros pero nunca guarda.

**Una sola vez:** abrir `…/miCuadernoDeRecursos/anep.html` y arrastrar el botón **📋 Pegar notas** a la barra de marcadores (`Ctrl+Shift+B` la muestra). Si hay una versión vieja en la barra, borrarla.

**Cada vez:**

1. En el cuaderno, en los resultados de la actividad o en el panel del pizarrón: **📋 Copiar para ANEP**.
2. En el Portafolio: **Calificaciones → Evaluar a todo el grupo → Nueva evaluación grupal**, con período, tipo de actividad, fecha y «Calificaciones del 1 al 10».
3. Con la evaluación abierta, tocar el marcador **📋 Pegar notas**. Lo copiado aparece solo en el cuadro.
4. Si se quiere el comentario («Unir con flechas: 3/4» o la devolución del pizarrón), marcar **Escribir también el comentario**.
5. **Completar** y revisar: verde = nota puesta, amarillo = quedó sin nota; el cuadro avisa nombres dudosos o que no están. **Deshacer** vuelve todo atrás.
6. Apretar **Guardar** en el Portafolio.

**Cómo salen las notas**

- Actividades: el puntaje llevado a 10, con mínimo 1 (4 de 10 → 4; 7 de 12 → 6). Con varios intentos, el mejor.
- Puntajes ⚠ no verificados: al copiar pregunta si se incluyen igual.
- Pizarrones: la nota puesta en cada respuesta.
- Si un casillero ya tenía otra nota, no se cambia salvo que se marque **Reemplazar notas ya escritas**.

**Nombres:** se emparejan sin importar mayúsculas, tildes ni el orden nombre/apellido. Si dos estudiantes coinciden, o un nombre está escrito distinto (Johan / Iohan), queda como dudoso para completar a mano.

## Problemas frecuentes y cuidados

| Pasa esto | Hacer esto |
| --- | --- |
| No dice «Conectado a la planilla» | Revisar que `config.js` (en minúsculas) tenga la URL del Apps Script que termina en `/exec` |
| Un cambio nuevo no aparece | Recargar con **Ctrl+F5**; GitHub tarda uno o dos minutos en publicar |
| «Ese nombre no está en la lista» | Revisar la lista del grupo o de la página; el estudiante tiene que elegir su nombre tal como está |
| La actividad con registro da error al terminar | Después de actualizar `Codigo.gs`, hacer **Implementar → Nueva versión** en Apps Script |
| Un estudiante quedó bloqueado | **Desbloquear** en «🔒 Bloqueados ahora», desde la vista docente |
| Un estudiante necesita repetir una actividad de un solo intento | **reiniciar** al lado de su nombre en los resultados |
| El video de una nota no se ve | En «Incrustar» tiene que ir un link o código de inserción; algunos sitios no permiten verse dentro de otra página |

**Cuidados**

- No marcar **Recordar** al entrar desde una computadora que usan estudiantes; al terminar, tocar **Salir**.
- Los datos (notas, páginas, respuestas, resultados) viven en la planilla de Google; el repositorio solo tiene el código. No subir respaldos ni listas de estudiantes a un repositorio público.
- Para notas que cuentan, usar actividades 🔒 con un solo intento, o un pizarrón calificado a mano.
- El cuaderno no es una herramienta oficial de ANEP: lo que se pega en el Portafolio se revisa antes de guardar.
