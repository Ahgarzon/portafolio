# Voces locales viables para Boro

16 de octubre de 2026.

Catálogo para escuchar: https://angelszs.site/boroaios/voces-viables/

## Resultado de la prueba

Se descartó Edge Neural: el VPS recibió HTTP 403 y por eso no es una ruta confiable para instalar Lorenzo ni las otras muestras de Edge. Las opciones de este documento se ejecutaron localmente en el VPS, sin cuota por carácter ni conexión al proveedor durante una respuesta.

## 1. Miro — recomendación colombiana

Escuchar: https://angelszs.site/boroaios/assets/catalogo-voces-viables-20261016/miro-co.mp3

Voz masculina configurada para español colombiano. Motor ONNX/CPU. En tres corridas calientes de la misma frase generó audio en 0,905, 0,684 y 0,563 segundos. Está preparada en aislamiento y se puede integrar sin descargar ni depender de Edge.

Uso sin costo para Boro personal no comercial, con atribución: su modelo es CC BY-NC-ND 4.0. No se debe usar para vender Boro, sublicenciar la voz ni modificar el modelo sin acordar otra licencia. La voz no representa la identidad de una persona colombiana real: el propio proyecto la describe como timbre de donante con pronunciación colombiana sintética.

## 2. Ald — alternativa local rápida

Escuchar: https://angelszs.site/boroaios/assets/catalogo-voces-viables-20261016/ald-mx.mp3

Voz masculina mexicana de Piper. En tres corridas calientes generó la frase en 0,649, 0,314 y 0,279 segundos. Es local, gratuita y técnicamente muy rápida, pero no se presenta como colombiana.

## 3. Claude — referencia activa

Escuchar: https://angelszs.site/boroaios/assets/catalogo-voces-viables-20261016/claude-mx-actual.mp3

Es la voz mexicana que Boro conserva hoy. En tres solicitudes al servicio vivo dio 0,844, 0,665 y 0,564 segundos. No se cambió durante esta evaluación.

## Qué elegir

Si quieres identidad colombiana y uso personal: Miro. Si priorizas solamente el tiempo de síntesis: Ald. La elección no instala nada todavía; al confirmar una se hace una integración reversible y se prueba contra Claude en respuestas cortas, largas y avisos antes de dejarla activa.

Fuente de Miro: https://huggingface.co/OpenVoiceOS/phoonnx_es-CO_miro_espeak
