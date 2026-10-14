const stages = {
  wifi: ['La ESP32-CAM se conecta al router', 'El firmware usa el nombre y la contraseña de la red. La placa obtiene una dirección local. Estar conectada al Wi-Fi es sólo el primer paso: todavía debe comprobar que puede llegar al servidor.', 'Si falla aquí: revisar señal, credenciales, alimentación y acceso a la red.'],
  internet: ['El router permite llegar al servidor', 'La conexión a internet transporta los datos fuera de la huerta. El nombre del servicio se resuelve mediante DNS para encontrar su dirección. Una red con portal de acceso o restricciones puede necesitar configuración especial.', 'Si falla aquí: revisar salida a internet, DNS y restricciones de la red.'],
  https: ['La placa verifica una conexión cifrada', 'HTTPS protege el intercambio con TLS. La ESP32 valida el certificado del servidor con una raíz de confianza o un conjunto de certificados. También debe mantener la hora correcta cuando la validación la necesite. Después presenta su credencial de estación.', 'Si falla aquí: revisar certificado, hora, dirección del servicio y credencial. No desactivar la validación del certificado para ocultar el error.'],
  api: ['El servicio recibe y procesa', 'Una ruta de la API recibe la imagen y sus datos. El servidor valida el contenido, evita duplicados, ejecuta el modelo y registra visitas según una regla definida. Un acuse de recepción puede llegar antes de terminar la IA.', 'Si falla aquí: distinguir solicitud rechazada, captura recibida y procesamiento fallido. Reintentar con el mismo identificador cuando corresponda.'],
  web: ['La página consulta resultados guardados', 'La web pide los datos al servidor y muestra la imagen, las visitas y la última actualización. El botón de monitoreo guarda una orden; la estación la consulta y confirma al aplicarla. El navegador no necesita permanecer abierto para que siga contando.', 'Si falla aquí: revisar URL de la API, autorización, CORS cuando haya otro origen y estado de conexión de la estación.']
};
const detail = document.getElementById('stage-detail');
document.querySelectorAll('[data-stage]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const [title, description, check] = stages[button.dataset.stage];
    detail.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = title;
    const paragraph = document.createElement('p'); paragraph.textContent = description;
    const hint = document.createElement('p'); hint.className = 'stage-check'; hint.textContent = check;
    detail.append(heading, paragraph, hint);
  });
});
