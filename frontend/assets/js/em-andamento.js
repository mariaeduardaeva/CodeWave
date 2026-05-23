document.addEventListener('DOMContentLoaded', async () => {
  const carousel        = document.getElementById('cursosCarousel');
  const listaAtividades = document.getElementById('atividades-lista');
  let matriculas = {};
  let sequencia  = 0;

  try {
    const [resMatriculas, resProgresso] = await Promise.all([
      fetch('/minhas-matriculas', { credentials: 'include' }),
      fetch('/meu-progresso',     { credentials: 'include' })
    ]);

    if (resMatriculas.ok) {
      const data = await resMatriculas.json();
      if (data.success) matriculas = data.matriculas || {};
    }
    if (resProgresso.ok) {
      const data = await resProgresso.json();
      if (data.success) sequencia = data.sequencia || 0;
    }
  } catch (e) {
    console.warn('Erro ao buscar dados:', e);
    Object.entries(cursos).forEach(([id, c]) => {
      if (c.matriculado) matriculas[id] = c.progresso;
    });
  }

  const sequenciaEl = document.querySelector('.sequencia');
  if (sequenciaEl) {
    sequenciaEl.textContent = sequencia > 0
      ? `Você está em uma sequência de ${sequencia} dia${sequencia !== 1 ? 's' : ''}!`
      : 'Faça login todo dia para manter sua sequência!';
  }

  const calGrid   = document.querySelector('.cal-grid');
  const calHeader = document.querySelector('.cal-header span');
  if (calGrid && calHeader) {
    const hoje       = new Date();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses      = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    calHeader.textContent = `${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    calGrid.innerHTML = '';

    for (let i = -2; i <= 2; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const col = document.createElement('div');
      col.className = 'cal-col' + (i === 0 ? ' hoje-col' : '');
      col.innerHTML = `
        <span class="cal-ds">${diasSemana[d.getDay()]}</span>
        <span class="cal-d">${d.getDate()}</span>
      `;
      calGrid.appendChild(col);
    }
  }

  let temCursos = false;

  Object.entries(cursos).forEach(([id, curso]) => {
    const progresso = matriculas[id];
    if (progresso === undefined || progresso >= 100) return;
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
        <button class="atividade-more" data-curso="${id}"><i class="ph ph-caret-right"></i></button>
      </div>
    `;
  });

  const carouselBtnEl = document.getElementById('carouselNext');
  if (carouselBtnEl) carouselBtnEl.style.display = temCursos ? 'block' : 'none';

  const agenda = document.querySelector('.agenda');
  if (agenda) {
    const cursosAgenda = Object.entries(cursos)
      .filter(([id]) => matriculas[id] !== undefined && matriculas[id] < 100)
      .map(([, curso]) => ({ hora: curso.horario || '09:00', titulo: curso.titulo }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    agenda.innerHTML = '';

    if (cursosAgenda.length === 0) {
      agenda.innerHTML = '<p style="color:#9C9C9C;padding:12px 0;font-size:14px">Nenhum curso em andamento.</p>';
    } else {
      const agoraBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const agoraMin = agoraBrasilia.getHours() * 60 + agoraBrasilia.getMinutes();

      let highlightIndex = cursosAgenda.length - 1;
      for (let i = 0; i < cursosAgenda.length; i++) {
        const [h, m] = cursosAgenda[i].hora.split(':').map(Number);
        if (h * 60 + m >= agoraMin) { highlightIndex = i; break; }
      }

      cursosAgenda.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'agenda-item' + (i === highlightIndex ? ' highlight' : '');
        div.innerHTML = `<span class="hora">${item.hora}</span><span>${item.titulo}</span>`;
        agenda.appendChild(div);
      });
    }
  }

  listaAtividades.addEventListener('click', (e) => {
    const btn = e.target.closest('.atividade-more');
    if (!btn) return;
    window.location.href = 'atividade.html';
  });

  const atividadesSection = document.querySelector('.atividades-section');
  if (atividadesSection) atividadesSection.style.display = temCursos ? 'block' : 'none';

  const porPagina = 3;
  let paginaAtual = 1;

  function renderAtividades() {
    const rows        = Array.from(listaAtividades.querySelectorAll('.atividade-row'));
    const totalPaginas = Math.ceil(rows.length / porPagina);
    const paginacao   = document.getElementById('paginacao-atividades');
    const prevBtn     = document.getElementById('pag-prev');
    const nextBtn     = document.getElementById('pag-next');

    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas || 1;
    paginacao.style.display = totalPaginas <= 1 ? 'none' : 'flex';
    paginacao.querySelectorAll('.pag-num').forEach(n => n.remove());

    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span');
      num.classList.add('pag-num');
      if (i === paginaAtual) num.classList.add('active');
      num.textContent = i;
      num.addEventListener('click', () => { paginaAtual = i; renderAtividades(); });
      paginacao.insertBefore(num, nextBtn);
    }

    rows.forEach((row, index) => {
      const inicio = (paginaAtual - 1) * porPagina;
      row.style.display = index >= inicio && index < inicio + porPagina ? 'grid' : 'none';
    });

    prevBtn.disabled = paginaAtual === 1;
    nextBtn.disabled = paginaAtual === totalPaginas;

    prevBtn.onclick = () => { if (paginaAtual > 1)            { paginaAtual--; renderAtividades(); } };
    nextBtn.onclick = () => { if (paginaAtual < totalPaginas) { paginaAtual++; renderAtividades(); } };
  }

  renderAtividades();

  const carouselNextBtn = document.getElementById('carouselNext');
  if (carousel && carouselNextBtn) {
    const CARD_WIDTH    = 380 + 16;
    const originalCards = Array.from(carousel.querySelectorAll('.curso-card'));

    if (originalCards.length > 1) {
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = 'true';
        carousel.appendChild(clone);
      });
    }

    let position   = 0;
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
    if (!card || card.dataset.clone === 'true') return;
    const cursoId = card.dataset.curso;
    if (cursoId) window.location.href = 'clicarcurso.html?curso=' + cursoId + '&origem=em-andamento';
  });

  const filtros = document.querySelectorAll('.filtro[data-filter]');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      carousel.querySelectorAll('[data-clone="true"]').forEach(c => c.remove());

      const originais = Array.from(carousel.querySelectorAll('.curso-card'));
      originais.forEach(card => {
        const match = filter === 'todos' || card.dataset.categoria === filter;
        card.style.display = match ? 'flex' : 'none';
      });

      const visiveis = originais.filter(c => c.style.display !== 'none');
      if (visiveis.length > 1) {
        visiveis.forEach(card => {
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