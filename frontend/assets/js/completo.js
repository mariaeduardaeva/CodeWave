document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('cursos-grid');
  let matriculas = {};
  try {
    const res = await fetch('http://127.0.0.1:5000/minhas-matriculas', { credentials: 'include' });
    const data = await res.json();
    if (data.success) matriculas = data.matriculas;
  } catch (e) {
    console.warn('Erro ao buscar matrículas:', e);
  }

  let totalConcluidos = 0;
  Object.entries(cursos).forEach(([id, curso]) => {
    const progresso = matriculas[id];
    if (progresso !== 100) return;
    totalConcluidos++;
    grid.innerHTML += `
      <div class="curso-card" data-categoria="${curso.categoria.toLowerCase()}" data-curso="${id}" style="background: ${curso.cor};">
        <div class="card-top">
          <h3>${curso.titulo}</h3>
          <span class="card-tag">${curso.categoria}</span>
        </div>
        <button class="card-btn">Ir para curso</button>
        <p class="card-desc">${curso.descricao}</p>
        <img src="${curso.imagem}" class="card-img" alt="">
        <div class="card-footer">
          <span class="card-date">Concluído</span>
          <span class="badge-concluido">Concluído <i class="ph ph-check-circle"></i></span>
        </div>
      </div>
    `;
  });

  const subtitulo = document.querySelector('.section-header p');
  if (totalConcluidos === 0) {
    subtitulo.textContent = 'Você não concluiu nenhum curso';
  } else {
    subtitulo.textContent = `Parabéns! Você concluiu ${totalConcluidos} curso${totalConcluidos !== 1 ? 's' : ''}`;
  }

  const totalEl = document.getElementById('total-concluidos');
  const certEl = document.getElementById('total-certificados');
  const parabensEl = document.getElementById('parabens-texto');
  if (totalEl) totalEl.textContent = totalConcluidos;
  if (certEl) certEl.textContent = totalConcluidos;
  if (parabensEl) parabensEl.textContent = `Você conquistou ${totalConcluidos} curso${totalConcluidos !== 1 ? 's' : ''} certificado${totalConcluidos !== 1 ? 's' : ''}`;

  const filtros = document.querySelectorAll('.filtro[data-filter]');
  const cards = Array.from(document.querySelectorAll('.curso-card'));
  const paginacao = document.querySelector('.paginacao');
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
      paginacao.style.display = cardsVisiveis().length === 0 ? 'none' : 'flex';
    });
  });

  renderCards(cardsVisiveis());
  renderPaginacao(cardsVisiveis());
  paginacao.style.display = cards.length === 0 ? 'none' : 'flex';

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