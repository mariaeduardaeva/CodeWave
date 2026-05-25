const params = new URLSearchParams(window.location.search);
const from = params.get('from');
const voltarLink = document.querySelector('.voltar-login');

if (from === 'cadastro') {
  voltarLink.href = 'cadastro.html';
  voltarLink.innerHTML = '‹ Voltar para o cadastro';
} else {
  voltarLink.href = 'login.html';
  voltarLink.innerHTML = '‹ Voltar para o login';
}