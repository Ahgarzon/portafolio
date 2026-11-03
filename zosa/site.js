document.querySelectorAll('.mobile-menu a').forEach(link => { link.addEventListener('click', () => { link.closest('details').open = false; }); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.mobile-menu[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); }); });
