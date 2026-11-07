# Quiz de Afinidad Express

Aplicación web interactiva para medir la afinidad entre dos personas que formarán un equipo de proyecto. Ambos participantes responden el mismo cuestionario de 6 preguntas en un solo dispositivo y, al finalizar, la aplicación calcula el porcentaje de compatibilidad y muestra una comparación detallada de las respuestas.

## Características

- 6 preguntas de opción múltiple con 4 respuestas cada una.
- Turnos separados para los dos participantes.
- Las respuestas del primer participante permanecen ocultas durante el turno del segundo.
- Barra de progreso y validación para no avanzar sin responder.
- Cálculo automático de afinidad: `(respuestas coincidentes / 6) * 100`.
- Indicador circular animado con el porcentaje final.
- Mensaje dinámico según el nivel de afinidad.
- Comparación pregunta por pregunta con indicadores de coincidencia y diferencia.
- Botones para repetir el cuestionario o volver al inicio.
- Diseño responsive para celulares, tablets y computadoras.
- Sin frameworks, sin backend y sin base de datos.
- Estado en memoria: al recargar la página se inicia una nueva sesión.

## Tecnologías

- HTML5
- CSS3
- JavaScript puro (Vanilla JavaScript)
- Google Fonts (Plus Jakarta Sans)

## Estructura del proyecto

```text
quiz-afinidad-express/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Ejecutar el proyecto localmente

No requiere instalación de dependencias ni proceso de compilación. El proyecto es completamente estático.

### Opción 1: servidor local con Node.js

Desde la carpeta del proyecto:

```bash
npx serve .
```

Abre la URL que indique la terminal (normalmente `http://localhost:3000`).

### Opción 2: servidor local con Python

```bash
python -m http.server 8000
```

Abre `http://localhost:8000` en tu navegador.

### Opción 3: Visual Studio Code

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.

> También puedes abrir `index.html` directamente en el navegador, aunque se recomienda usar un servidor local para una experiencia más cercana al despliegue.

## Cómo probar la aplicación

1. Haz clic en **Comenzar**.
2. Escribe dos nombres distintos. Intenta continuar con campos vacíos o con el mismo nombre para ver las validaciones.
3. Responde las 6 preguntas del participante 1.
4. Verifica que aparece la pantalla de cambio de turno sin mostrar las respuestas anteriores.
5. Responde las 6 preguntas del participante 2.
6. Haz clic en **Ver resultados**.
7. Comprueba:
   - Que el porcentaje coincide con la fórmula `(coincidencias / 6) * 100`.
   - Que el indicador circular y el contador de coincidencias/diferencias son correctos.
   - Que el mensaje corresponde al rango del porcentaje.
   - Que la comparación de las 6 preguntas muestra ambas respuestas y el indicador correcto.
8. Prueba **Repetir cuestionario** y **Volver al inicio**.
9. Redimensiona la ventana o usa la vista de dispositivo móvil del navegador para comprobar el diseño responsive.

### Casos de prueba del porcentaje

| Coincidencias | Porcentaje |
| ------------- | ---------- |
| 6             | 100%       |
| 5             | 83.33%     |
| 4             | 66.67%     |
| 3             | 50%        |
| 2             | 33.33%     |
| 1             | 16.67%     |
| 0             | 0%         |

## Subir el proyecto a GitHub

1. Crea un repositorio nuevo y vacío en [GitHub](https://github.com/new).
2. Desde la carpeta del proyecto, ejecuta:

```bash
git init
git add .
git commit -m "Proyecto Quiz de Afinidad Express"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/quiz-afinidad-express.git
git push -u origin main
```

Reemplaza `TU-USUARIO` por tu nombre de usuario de GitHub.

## Desplegar en Vercel

### Desde el panel de Vercel (recomendado)

1. Inicia sesión en [Vercel](https://vercel.com/).
2. Haz clic en **Add New → Project**.
3. Importa el repositorio de GitHub que acabas de crear.
4. En la configuración del proyecto:
   - **Framework Preset:** Other
   - **Build Command:** dejar vacío
   - **Output Directory:** dejar vacío
   - **Install Command:** dejar vacío
5. Haz clic en **Deploy**.
6. Vercel publicará el sitio en una URL como `https://quiz-afinidad-express.vercel.app`.

Cada `git push` a la rama `main` generará un nuevo despliegue automático.

### Con Vercel CLI

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones de la terminal. Para producción:

```bash
vercel --prod
```

## Notas

- La aplicación no guarda datos personales ni respuestas en el servidor.
- No se usa `localStorage`: toda la información vive en memoria durante la sesión.
- Al recargar la página, el cuestionario se reinicia.
- El proyecto está listo para desplegarse en Vercel sin variables de entorno ni configuración adicional.
