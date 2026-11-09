# Cuaderno de recursos
 
Marcadores con etiquetas, anotaciones y páginas que se pueden compartir o dejar privadas.
 
| Archivo | Para qué |
|---|---|
| `index.html` | La página (va al repo de GitHub) |
| `config.js` | La URL de Apps Script y el nombre (va al repo, junto a `index.html`) |
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
 
 
## Si se cambia `Codigo.gs`
 
Después de editar el código: **Implementar → Administrar implementaciones → ✎ → Versión: nueva → Implementar**. Así la URL sigue siendo la misma.
 
