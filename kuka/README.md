# KUKA · Guía académica de integración

Preparado por ingeniero Ángel Garzón Sarzosa.

Publicación: https://angelszs.site/kuka/

Sitio estático en español: tres diagramas Archify, laboratorio local de comunicación, archivos/YAML, comandos, mensajes y referencias. Base Ubuntu 22.04 y ROS 2 Humble.

Fuentes del repositorio KUKA fijadas en REZ3LIET/KUKA-ROS2@8f2c2a35a2d45d5739c7a247d5872e514a8d4895. Contiene simulación, no integración de hardware. Esta página no establece conexiones con robots.

Los mapas simple y técnico son propuestas; archivos.html reconstruye el código con evidencia enlazada. Los comandos no se ejecutaron en ROS ni hardware y no acreditan compilación.

El logo horizontal proviene de https://www.unicauca.edu.co/la-universidad/simbolos/ ; el material es una guía preparada por el autor. La captura Unity fue entregada por el autor, sin alteración. La carpeta Drive se enlaza por solicitud del autor; no se modifican sus permisos.

Abrir index.html localmente o servir esta carpeta con un servidor estático. Se conserva una copia local de las preferencias de tema y preparación. No hay backend, telemetría ni envío de comandos.

## Glosario y orden de lectura

Panel de consulta cerrado por defecto con 48 conceptos, cinco áreas, búsqueda sin distinguir tildes, explicación aplicada y referencia primaria por concepto. La tabla tiene desplazamiento propio para mantener la página compacta; en móvil se muestra como fichas. Una ruta de lectura precede los mapas y la base técnica aparece antes del detalle de archivos.

El HTML contiene todas las definiciones: no necesita una descarga de datos para consultar el glosario. `glossary.js` añade los filtros. Para mantener definiciones y estructura, editar `actualizar-glosario.py` y ejecutar `python kuka/actualizar-glosario.py` desde la raíz (mantenimiento opcional; requiere beautifulsoup4). La web publicada sigue siendo estática.

## Video de explicación

Apartado #video cerca del inicio, enlace en la portada y menú. MP4 H.264/AAC, 1920×1080, 30 fps, acelerado en el archivo a 1,2× con audio atempo para conservar el tono. Reproductor nativo y botón reproducir/pausar, volumen, avance y pantalla completa; sin autoplay, carga inicial de metadatos y portada local. La grabación recorre la guía web. Se conserva el archivo original fuera del repositorio.
