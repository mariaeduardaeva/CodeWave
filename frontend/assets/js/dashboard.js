document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('cursos-grid');

  function corBarra(p) {
    if (p === 100) return '#4ADE80';
    if (p >= 50) return '#FACC15';
    if (p > 0) return '#EF4444';
    return '#4ADE80';
  }

  let matriculas = {};
  try {
    const res = await fetch('http://127.0.0.1:5000/minhas-matriculas', { credentials: 'include' });
    const data = await res.json();
    if (data.success) matriculas = data.matriculas;
  } catch (e) {
    console.warn('Não foi possível buscar matrículas:', e);
  }

  Object.entries(cursos).forEach(([id, curso]) => {
    const progresso = matriculas[id] !== undefined ? matriculas[id] : 0;

    const card = document.createElement('div');
    card.className = 'curso-card';
    card.dataset.categoria = curso.categoria.toLowerCase();
    card.dataset.curso = id;
    card.style.background = curso.cor;
    card.innerHTML = `
      <div class="card-top">
        <h3>${curso.titulo}</h3>
        <span class="card-tag">${curso.categoria}</span>
      </div>
      <button class="card-btn">Ir para curso</button>
      <p class="card-desc">${curso.descricao}</p>
      <img src="${curso.imagem}" class="card-img" alt="">
      <div class="card-progress-wrap">
        <div class="card-progress-bar" style="width: ${progresso}%; background: ${corBarra(progresso)};"></div>
      </div>
      <span class="card-percent">${progresso}%</span>
    `;

    card.querySelector('.card-btn').addEventListener('click', () => {
      if (matriculas[id] === undefined) {
        window.location.href = '/pages/pagamento.html?curso=' + id;
      } else {
        window.location.href = '/pages/clicarcurso.html?curso=' + id;
      }
    });

    grid.appendChild(card);
  });

  const filtros = document.querySelectorAll('.filtro[data-filter]');
  const cards = Array.from(document.querySelectorAll('.curso-card'));
  const porPagina = 6;
  let paginaAtual = 1;

  function renderPaginacao(totalVisiveis) {
    const totalPaginas = Math.ceil(totalVisiveis / porPagina);
    const paginacao = document.querySelector('.paginacao');
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