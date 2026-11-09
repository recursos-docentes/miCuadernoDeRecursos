# Cuaderno de recursos

Marcadores con etiquetas, anotaciones y páginas que se pueden compartir o dejar privadas.

| Archivo | Para qué |
|---|---|
| `index.html` | La página (va al repo de GitHub) |
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

En `index.html`, cerca del comienzo del `<script>`:

```js
const API_URL = 'https://script.google.com/macros/s/XXXX/exec';
const AUTORA = '';   // opcional: nombre que se muestra en las páginas compartidas
```

Subir `index.html` al repo y activar GitHub Pages.

## 3. Primer uso

1. Abrir la página → **Entrar** → escribir la clave.
2. Como la planilla está vacía, aparece **«Subir las notas de este navegador»**: carga las 52 notas iniciales (o las que ya tenías en ese navegador).

## Cómo se usa

- **Páginas del cuaderno**: «+ página» crea un separador nuevo. 🔒 = privada, 🌐 = compartida. Se cambia tocando el botón de la página.
- **Compartir**: en una página 🌐 aparece «Copiar link» (`…/?p=nombre-de-la-pagina`). Quien abre el link solo ve esa página, sin poder editar.
- **Una nota en varias páginas**: al editarla, marcar todas las páginas donde tiene que aparecer.
- **Etiquetas**: separadas por comas. La nube de etiquetas filtra; si se eligen varias, muestra las notas que tienen todas.
- **Anotaciones**: texto largo de cada nota (📝). Si se marca «Anotación privada», no aparece en las páginas compartidas.
- **📌 Guardar desde webs**: arrastrar el botón amarillo a la barra de marcadores. En cualquier sitio, tocarlo abre una ventanita para guardar esa página (si antes se selecciona texto, queda en las anotaciones).
- **Exportar / Restaurar**: copia de seguridad en un archivo JSON.

## Si se cambia `Codigo.gs`

Después de editar el código: **Implementar → Administrar implementaciones → ✎ → Versión: nueva → Implementar**. Así la URL sigue siendo la misma.
