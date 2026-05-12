document.addEventListener('DOMContentLoaded', () => {
  const filtros = document.querySelectorAll('.filtro[data-filter]');
  const cards = Array.from(document.querySelectorAll('.curso-card'));
  const porPagina = 6;
  let paginaAtual = 1;

  function renderPaginacao(totalVisiveis) {
    const totalPaginas = Math.ceil(totalVisiveis / porPagina);
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
        renderPaginacao(cardsVisiveis().length);
      });
      paginacao.insertBefore(num, nextBtn);
    }
  }

  function cardsVisiveis() {
    return cards.filter(c => c.style.display !== 'none');
  }

  function renderCards(visiveis) {
    cards.forEach(c => c.style.display = 'none');

    const inicio = (paginaAtual - 1) * porPagina;
    const fim = inicio + porPagina;
    visiveis.slice(inicio, fim).forEach(c => c.style.display = 'flex');
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      paginaAtual = 1;

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.categoria === filter;
        card.style.display = match ? 'flex' : 'none';
      });

      renderCards(cardsVisiveis());
      renderPaginacao(cardsVisiveis().length);
    });
  });

  renderCards(cardsVisiveis());
  renderPaginacao(cards.length);
});