(() => {
  const controls = document.querySelectorAll('.language');
  const nodes = [...document.querySelectorAll('[data-en]')].map(node => ({ node, es: node.textContent, en: node.dataset.en }));
  const spanishTitle = document.title;
  const description = document.querySelector('meta[name="description"]');
  const spanishDescription = description?.content;
  const isProfile = document.body.classList.contains('profile-page');
  let lang = 'es';
  try { lang = new URL(location.href).searchParams.get('lang') || localStorage.getItem('ag-brand-language') || 'es'; } catch {}
  function setLanguage(value) {
    lang = value === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    document.title = lang === 'es' ? spanishTitle : (isProfile ? 'Ángel Garzón · AI Solutions Architect' : 'Ángel Garzón · AI that works for your business');
    if (description) description.content = lang === 'es' ? spanishDescription : (isProfile ? 'Professional profile of Ángel Garzón Sarzosa: AI architecture, automation, digital products and robotics. Projects, experience and contact.' : 'AI systems, voice agents and automation to support your customers and connect your operations. Explore the work of Ángel Garzón.');
    nodes.forEach(({ node, es, en }) => { node.textContent = lang === 'en' ? en : es; });
    controls.forEach(button => { button.textContent = lang === 'en' ? 'ES' : 'EN'; button.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English'); });
    try { localStorage.setItem('ag-brand-language', lang); } catch {}
  }
  controls.forEach(button => button.addEventListener('click', () => setLanguage(lang === 'es' ? 'en' : 'es')));
  document.querySelectorAll('.print-profile').forEach(button => button.addEventListener('click', () => window.print()));
  setLanguage(lang);
})();
