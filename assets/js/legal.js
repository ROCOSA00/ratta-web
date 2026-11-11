/* RATTA MUSIK · página de aviso legal: rellena los datos del titular desde datos.js */
(function () {
  var D = window.RATTA || {};
  var L = D.legal || {};
  document.querySelectorAll('[data-legal]').forEach(function (el) {
    var v = (L[el.getAttribute('data-legal')] || '').trim();
    if (v) { el.textContent = v; el.classList.add('is-set'); }
  });
  var email = D.contacto && D.contacto.email;
  if (email) {
    document.querySelectorAll('[data-contact="email"]').forEach(function (a) {
      a.href = 'mailto:' + email;
      a.textContent = email;
    });
  }
  var f = document.querySelector('[data-legal-form]');
  if (f && D.formulario && D.formulario.endpoint) {
    f.textContent = 'Los mensajes del formulario se envían a través de Formspree (Formspree, Inc.), que solo los reenvía a nuestro email.';
  }
})();
