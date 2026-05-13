document.addEventListener('DOMContentLoaded', () => {
  const filtros = document.querySelectorAll('.filtro[data-filter]');
  const cards = Array.from(document.querySelectorAll('.curso-card'));
  const porPagina = 6;
  let paginaAtual = 1;
  let filtroAtivo = 'todos';

  function cardsVisiveis() {
    return cards.filter(card =>
      filtroAtivo === 'todos' || card.dataset.categoria === filtroAtivo
    );
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina);
    const paginacao = document.querySelector('.paginacao');
    const prevBtn = paginacao.querySelector('.pag-btn:first-child');
    const nextBtn = paginacao.querySelector('.pag-btn:last-child');

    paginacao.querySelectorAll('.pag-num').forEach(n => n.remove());

    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span');
      num.classList.add('pag-num');
      if (i === paginaAtual) num.classList.add('active');
      num.textContent = i;
      num.addEventListener('click', () => {
        paginaAtual = i;
        renderCards(cardsVisiveis());
        renderPaginacao(cardsVisiveis());
      });
      paginacao.insertBefore(num, nextBtn);
    }
  }

  function renderCards(visiveis) {
    cards.forEach(c => c.style.display = 'none');
    const inicio = (paginaAtual - 1) * porPagina;
    visiveis.slice(inicio, inicio + porPagina).forEach(c => c.style.display = 'flex');
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filter;
      paginaAtual = 1;
      renderCards(cardsVisiveis());
      renderPaginacao(cardsVisiveis());
    });
  });

  renderCards(cardsVisiveis());
  renderPaginacao(cardsVisiveis());

  document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.curso-card');
      const cursoId = card.dataset.curso;
      if (cursoId) {
        window.location.href = 'clicarcurso.html?curso=' + cursoId + '&origem=completo';
      }
    });
  });
});