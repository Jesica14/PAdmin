# Salesforce Platform Administrator — Simulador

Aplicación web estática basada en el archivo **Plat-Admn-201 (1).pdf** proporcionado por el usuario.

## Qué incluye

- 158 preguntas extraídas del documento.
- Preguntas de respuesta única y múltiple.
- Selección limitada al número de respuestas requeridas por cada pregunta.
- Validación inmediata de correcto / incorrecto.
- Explicación incluida en el documento cuando está disponible.
- Examen configurable de 10, 25, 50, 75, 100 o 158 preguntas.
- Opción de mezclar preguntas y opciones.
- Resultado final y repaso de respuestas incorrectas.
- Diseño responsive y modo claro/oscuro.
- Sin backend y sin dependencias externas.

## Ejecutar localmente

Puedes abrir `index.html` directamente en el navegador.

También puedes servirlo con un servidor local:

```bash
python -m http.server 8000
```

Después visita `http://localhost:8000`.

## Publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub mostrará la URL pública cuando termine el despliegue.

## Estructura

- `index.html`: interfaz.
- `styles.css`: estilos.
- `app.js`: lógica del simulador.
- `questions.js`: banco de preguntas generado desde el PDF.

## Nota sobre la clave de respuestas

La aplicación califica usando exactamente la clave incluida en el archivo proporcionado. No se realizó una verificación externa ni se corrigieron respuestas del documento.
