document.addEventListener('DOMContentLoaded', async () => {

  let matriculas = {}; 
  let emRevisao  = []; 
  let concluidas = []; 

  try {
    const [resMatriculas, resAtividades] = await Promise.all([
      fetch('/minhas-matriculas',  { credentials: 'include' }),
      fetch('/minhas-atividades',  { credentials: 'include' })
    ]);

    if (resMatriculas.ok) {
      const data = await resMatriculas.json();
      if (data.success) matriculas = data.matriculas || {};
    }

    if (resAtividades.ok) {
      const data = await resAtividades.json();
      if (data.success) {
        emRevisao  = data.em_revisao  || [];
        concluidas = data.concluidas  || [];
      }
    }
  } catch (err) {
    console.warn('Fallback local.', err);
    Object.entries(cursos).forEach(([id, c]) => {
      if (c.matriculado) matriculas[id] = c.progresso;
    });
  }

  const todasAtividades = [];

  Object.entries(cursos).forEach(([cursoId, curso]) => {
    if (!(cursoId in matriculas) || !curso.atividades) return;

    curso.atividades.forEach(ativ => {
      let status = 'pendente';
      if (concluidas.includes(ativ.id))  status = 'concluido';
      else if (emRevisao.includes(ativ.id)) status = 'revisao';

      todasAtividades.push({
        id: ativ.id, titulo: ativ.titulo, tipo: ativ.tipo,
        cursoId, cursoTitulo: curso.titulo,
        categoria: curso.categoria.toLowerCase(),
        cor: curso.cor, imagem: curso.imagem,
        status
      });
    });
  });

  function badgeHTML(status) {
    if (status === 'concluido') return `<span class="ativ-badge concluido">Concluído <i class="ph-bold ph-check-circle"></i></span>`;
    if (status === 'revisao')   return `<span class="ativ-badge revisao">Em revisão <i class="ph ph-bold ph-clock"></i></span>`;
    return `<span class="ativ-badge pendente">Pendente <i class="ph-bold ph-hourglass"></i></span>`;
  }

  function btnLabel(status) {
    if (status === 'concluido') return 'Ver novamente';
    if (status === 'revisao')   return 'Marcar concluído';
    return 'Ver solução';
  }

  function dataTexto(status) {
    if (status === 'concluido') return 'Atividade concluída';
    if (status === 'revisao')   return 'Aguardando revisão';
    return 'A concluir';
  }

  function renderItem(ativ) {
    const el = document.createElement('div');
    el.className = 'atividade-item';
    el.dataset.categoria   = ativ.categoria;
    el.dataset.status      = ativ.status;
    el.dataset.atividadeId = ativ.id;

    el.innerHTML = `
      <div class="ativ-thumb" style="background: ${ativ.cor}">
        <img src="${ativ.imagem}" alt="">
      </div>
      <div class="ativ-info">
        <span class="ativ-tipo">${ativ.tipo}</span>
        <h3>${ativ.titulo}</h3>
        <p>${ativ.cursoTitulo}</p>
        <span class="ativ-data">
          <i class="ph ph-calendar-blank"></i> ${dataTexto(ativ.status)}
        </span>
      </div>
      <div class="ativ-right">
        ${badgeHTML(ativ.status)}
        <button class="ativ-btn">${btnLabel(ativ.status)} <i class="ph ph-caret-right"></i></button>
      </div>
    `;

    el.querySelector('.ativ-btn').addEventListener('click', () => avancarStatus(ativ.id, el));
    return el;
  }

  async function avancarStatus(atividadeId, el) {
    const atual = el.dataset.status;
    if (atual === 'concluido') return;

    const proximo = atual === 'pendente' ? 'revisao' : 'concluido';

    try {
      const rota = proximo === 'revisao' ? '/revisar-atividade' : '/concluir-atividade';
      await fetch(rota, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atividade_id: atividadeId })
      });
    } catch (err) {
      console.warn('Erro ao salvar status no backend:', err);
    }

    if (proximo === 'revisao') {
      emRevisao.push(atividadeId);
    } else {
      emRevisao  = emRevisao.filter(id => id !== atividadeId);
      concluidas.push(atividadeId);
    }

    el.dataset.status = proximo;
    el.querySelector('.ativ-right').innerHTML = `
      ${badgeHTML(proximo)}
      <button class="ativ-btn">${btnLabel(proximo)} <i class="ph ph-caret-right"></i></button>
    `;
    el.querySelector('.ativ-btn').addEventListener('click', () => avancarStatus(atividadeId, el));
    el.querySelector('.ativ-data').innerHTML = `<i class="ph ph-calendar-blank"></i> ${dataTexto(proximo)}`;

    atualizarResumo();
    renderItems(itemsVisiveis());
    renderPaginacao(itemsVisiveis());
  }

  const lista = document.getElementById('atividadesList');
  lista.innerHTML = '';

  if (todasAtividades.length === 0) {
    lista.innerHTML = '<p style="color:#9C9C9C;padding:24px 0">Nenhuma atividade encontrada. Matricule-se em um curso para começar!</p>';
  } else {
    todasAtividades.forEach(a => lista.appendChild(renderItem(a)));
  }

  function atualizarResumo() {
    const allItems  = Array.from(lista.querySelectorAll('.atividade-item'));
    const nPendente = allItems.filter(i => i.dataset.status === 'pendente').length;
    const nRevisao  = allItems.filter(i => i.dataset.status === 'revisao').length;
    const nConcluid = allItems.filter(i => i.dataset.status === 'concluido').length;

    const vals = document.querySelectorAll('.conquista-item strong');
    if (vals[0]) vals[0].textContent = nPendente;
    if (vals[1]) vals[1].textContent = nRevisao;
    if (vals[2]) vals[2].textContent = nConcluid;

    const nCertificados = Object.entries(matriculas)
      .filter(([id, prog]) => prog >= 100).length;

    const certEl = document.querySelector('.parabens-card p');
    if (certEl) certEl.innerHTML = `Você conquistou<br>${nCertificados} curso${nCertificados !== 1 ? 's' : ''} certificado${nCertificados !== 1 ? 's' : ''}`;
  }

  atualizarResumo();

  const filtros       = document.querySelectorAll('.filtro[data-filter]');
  const filtrosStatus = document.querySelectorAll('.filtro-status[data-status]');
  const porPagina = 5;
  let paginaAtual = 1, filtroAtivo = 'todos', statusAtivo = 'todos';

  function items() { return Array.from(lista.querySelectorAll('.atividade-item')); }

  function itemsVisiveis() {
    const filtrados = items().filter(item => {
      const catOk    = filtroAtivo === 'todos' || item.dataset.categoria === filtroAtivo;
      const statusOk = statusAtivo === 'todos' || item.dataset.status    === statusAtivo;
      return catOk && statusOk;
    });

    if (statusAtivo === 'todos') {
      const ordem = { revisao: 0, pendente: 1, concluido: 2 };
      filtrados.sort((a, b) => (ordem[a.dataset.status] ?? 1) - (ordem[b.dataset.status] ?? 1));

      filtrados.forEach(el => lista.appendChild(el));
    }

    return filtrados;
  }

  function renderItems(visiveis) {
    items().forEach(i => i.style.display = 'none');
    const inicio = (paginaAtual - 1) * porPagina;
    visiveis.slice(inicio, inicio + porPagina).forEach(i => i.style.display = 'flex');
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina);
    const paginacao    = document.querySelector('.paginacao');

    paginacao.innerHTML = '';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'pag-btn';
    btnPrev.innerHTML = '<i class="ph ph-caret-left"></i>';
    btnPrev.disabled = paginaAtual === 1;
    btnPrev.addEventListener('click', () => {
      if (paginaAtual > 1) {
        paginaAtual--;
        renderItems(itemsVisiveis());
        renderPaginacao(itemsVisiveis());
      }
    });
    paginacao.appendChild(btnPrev);

    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span');
      num.classList.add('pag-num');
      if (i === paginaAtual) num.classList.add('active');
      num.textContent = i;
      num.addEventListener('click', () => {
        paginaAtual = i;
        renderItems(itemsVisiveis());
        renderPaginacao(itemsVisiveis());
      });
      paginacao.appendChild(num);
    }

    const btnNext = document.createElement('button');
    btnNext.className = 'pag-btn';
    btnNext.innerHTML = '<i class="ph ph-caret-right"></i>';
    btnNext.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    btnNext.addEventListener('click', () => {
      if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderItems(itemsVisiveis());
        renderPaginacao(itemsVisiveis());
      }
    });
    paginacao.appendChild(btnNext);
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filter;
      paginaAtual = 1;
      renderItems(itemsVisiveis()); renderPaginacao(itemsVisiveis());
    });
  });

  filtrosStatus.forEach(btn => {
    btn.addEventListener('click', () => {
      filtrosStatus.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      statusAtivo = btn.dataset.status;
      paginaAtual = 1;
      renderItems(itemsVisiveis()); renderPaginacao(itemsVisiveis());
    });
  });

  renderItems(itemsVisiveis());
  renderPaginacao(itemsVisiveis());
});