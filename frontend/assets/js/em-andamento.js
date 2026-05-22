document.addEventListener('DOMContentLoaded', async () => {
  const carousel = document.getElementById('cursosCarousel');
  const listaAtividades = document.getElementById('atividades-lista');
  let matriculas = {};

  try {
    const res = await fetch('http://127.0.0.1:5000/minhas-matriculas', { credentials: 'include' });
    const data = await res.json();
    if (data.success) matriculas = data.matriculas;
  } catch (e) {
    console.warn('Erro ao buscar matrículas:', e);
  }

  let temCursos = false;

  Object.entries(cursos).forEach(([id, curso]) => {
    const progresso = matriculas[id];
    if (progresso === undefined || progresso === 100) return;
    temCursos = true;

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
        <div class="card-progress-bar" style="width: ${progresso}%; background: #FACC15;"></div>
      </div>
      <span class="card-percent">${progresso}%</span>
    `;
    carousel.appendChild(card);

    listaAtividades.innerHTML += `
      <div class="atividade-row">
        <div class="atividade-curso">
          <div class="atividade-icon" style="background: ${curso.cor}">
            <img src="${curso.imagem}" alt=""/>
          </div>
          <span>${curso.titulo}</span>
        </div>
        <span class="badge-status em-progresso" style="background: #FAB705">Em progresso</span>
        <span class="atividade-categoria">${curso.categoria}</span>
        <button class="atividade-more" onclick="window.location.href='atividade.html'"><i class="ph ph-caret-right"></i></button>
      </div>
    `;
  });

  const atividadesSection = document.querySelector('.atividades-section');
  atividadesSection.style.display = temCursos ? 'block' : 'none';

  const porPagina = 3;
  let paginaAtual = 1;

  function renderAtividades() {
    const rows = Array.from(listaAtividades.querySelectorAll('.atividade-row'));
    const totalPaginas = Math.ceil(rows.length / porPagina);
    const paginacao = document.getElementById('paginacao-atividades');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');

    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;

    paginacao.style.display = totalPaginas <= 1 ? 'none' : 'flex';

    paginacao.querySelectorAll('.pag-num').forEach(n => n.remove());

    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span');
      num.classList.add('pag-num');
      if (i === paginaAtual) num.classList.add('active');
      num.textContent = i;
      num.addEventListener('click', () => {
        paginaAtual = i;
        renderAtividades();
      });
      paginacao.insertBefore(num, nextBtn);
    }

    rows.forEach((row, index) => {
      const inicio = (paginaAtual - 1) * porPagina;
      const fim = inicio + porPagina;
      row.style.display = index >= inicio && index < fim ? 'grid' : 'none';
    });

    prevBtn.style.opacity = paginaAtual === 1 ? '0.3' : '1';
    prevBtn.style.pointerEvents = paginaAtual === 1 ? 'none' : 'auto';
    nextBtn.style.opacity = paginaAtual === totalPaginas ? '0.3' : '1';
    nextBtn.style.pointerEvents = paginaAtual === totalPaginas ? 'none' : 'auto';

    prevBtn.onclick = () => {
      if (paginaAtual > 1) { paginaAtual--; renderAtividades(); }
    };

    nextBtn.onclick = () => {
      if (paginaAtual < totalPaginas) { paginaAtual++; renderAtividades(); }
    };
  }

  renderAtividades();

  const carouselNextBtn = document.getElementById('carouselNext');
  if (carousel && carouselNextBtn) {
    const CARD_WIDTH = 380 + 16;
    const originalCards = Array.from(carousel.querySelectorAll('.curso-card'));
    if (originalCards.length > 1) {
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = 'true';
        carousel.appendChild(clone);
      });
    }
    let position = 0;
    const totalWidth = originalCards.length * CARD_WIDTH;
    carouselNextBtn.addEventListener('click', () => {
      position += CARD_WIDTH;
      carousel.scrollTo({ left: position, behavior: 'smooth' });
      if (position >= totalWidth) {
        setTimeout(() => {
          carousel.style.scrollBehavior = 'auto';
          position = 0;
          carousel.scrollLeft = 0;
          setTimeout(() => { carousel.style.scrollBehavior = 'smooth'; }, 50);
        }, 400);
      }
    });
  }

  carousel.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-btn');
    if (!btn) return;
    const card = btn.closest('.curso-card');
    if (!card || card.dataset.clone) return;
    const cursoId = card.dataset.curso;
    if (cursoId) {
      window.location.href = '/pages/clicarcurso.html?curso=' + cursoId + '&origem=em-andamento';
    }
  });

  const filtros = document.querySelectorAll('.filtro[data-filter]');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const allCards = carousel.querySelectorAll('.curso-card');
      allCards.forEach(card => {
        if (card.dataset.clone) card.remove();
        else {
          const match = filter === 'todos' || card.dataset.categoria === filter;
          card.style.display = match ? 'flex' : 'none';
        }
      });
      const visibleCards = Array.from(carousel.querySelectorAll('.curso-card:not([data-clone])'))
        .filter(c => c.style.display !== 'none');
      if (visibleCards.length > 1) {
        visibleCards.forEach(card => {
          const clone = card.cloneNode(true);
          clone.dataset.clone = 'true';
          carousel.appendChild(clone);
        });
      }
      carousel.scrollLeft = 0;
      paginaAtual = 1;
      renderAtividades();
    });
  });
});