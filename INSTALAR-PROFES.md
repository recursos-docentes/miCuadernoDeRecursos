# Instalar el cuaderno a otro docente

Un mismo sitio sirve a varios docentes. Cada docente tiene **su planilla de Google y su Apps Script** (sus datos quedan en su cuenta) y entra por **su dirección**: `https://EL-SITIO/?c=CODIGO`.

Quien administra el sitio decide qué códigos existen: cada código es un archivo en la carpeta `profes/`. Sin ese archivo, la dirección responde «Este cuaderno no está activo».

## Una sola vez: la planilla modelo

1. Crear una planilla de Google nueva y llamarla **«Cuaderno de recursos – modelo»**.
2. **Extensiones → Apps Script**. Borrar lo que haya, pegar todo `Codigo.gs` y guardar.
3. Cerrar y volver a abrir la planilla: aparece el menú **📒 Cuaderno**.
4. No cargar clave ni datos en el modelo: tiene que quedar vacío.
5. Para entregarla, usar el link de la planilla cambiando el final `/edit…` por **`/copy`**. Quien abre ese link recibe su propia copia, con el Apps Script adentro.

Compartir el modelo como «Cualquier persona con el enlace: lector».

## Por cada docente nuevo

Lo que hace el docente (unos 5 minutos):

1. Abrir el link `/copy` y aceptar **Hacer una copia**.
2. En su copia, menú **📒 Cuaderno → 1. Elegir o cambiar la clave**. La primera vez, Google pide autorización: aceptar con su cuenta.
3. **📒 Cuaderno → 2. Preparar las hojas**.
4. **Extensiones → Apps Script → Implementar → Nueva implementación**: tipo **Aplicación web**, «Ejecutar como: Yo», «Quién tiene acceso: Cualquier usuario» → **Implementar**.
5. De vuelta en la planilla, **📒 Cuaderno → 3. Ver la dirección de conexión** y enviar esa dirección (termina en `/exec`). **La clave no se envía a nadie.**

Lo que hace quien administra el sitio (2 minutos):

1. Copiar `profes/_ejemplo.js` como `profes/CODIGO.js`. El código va en minúsculas, sin espacios ni tildes (letras, números y guiones), por ejemplo `profes/mgarcia.js`.
2. Pegar adentro la dirección de conexión y el nombre del docente.
3. Subir el archivo al repositorio. En uno o dos minutos, el cuaderno del docente queda en `https://EL-SITIO/?c=CODIGO`.

**📒 Cuaderno → Comprobar la instalación** dice qué paso falta.

## Mantenimiento

| Tarea | Cómo |
| --- | --- |
| Dar de baja a un docente | Borrar su archivo de `profes/`. Su dirección y los links de sus estudiantes dejan de funcionar; su planilla queda intacta en su cuenta |
| Actualizar la página | Subir los archivos nuevos al repositorio: todos los docentes reciben la versión nueva |
| Actualizar el Apps Script | Cada docente reemplaza `Codigo.gs` en su planilla y hace **Implementar → Gestionar implementaciones → ✏️ → Nueva versión**. Si no lo hizo, al entrar ve el aviso «Hay que actualizar el Apps Script de la planilla» |
| Cambiar la clave | El docente, desde **📒 Cuaderno → 1** |

Al cambiar `Codigo.gs` de forma que la página lo necesite, subir en `Codigo.gs` el número `VERSION` y en `index.html` el número `API_MIN`.

## Qué queda compartido y qué no

- **Compartido:** los archivos de la página (`index.html`, `actividades.js`, `anep.html`).
- **De cada docente:** su planilla, su clave, sus listas, respuestas y notas. No pasan por la cuenta de quien administra el sitio.
- **Los links de los estudiantes** llevan el código: `https://EL-SITIO/?c=CODIGO&p=…`.
- Sin `?c=`, el sitio usa `config.js`, como siempre.
