document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('cursos-grid');

  function corBarra(p) {
    if (p === 100) return '#4ADE80';
    if (p >= 50)   return '#FACC15';
    if (p > 0)     return '#EF4444';
    return '#4ADE80';
  }

  let matriculas = {};
  let sequencia  = 0;
  try {
    const [resMatriculas, resProgresso] = await Promise.all([
      fetch('/minhas-matriculas', { credentials: 'include' }),
      fetch('/meu-progresso',     { credentials: 'include' })
    ]);
    if (resMatriculas.ok) {
      const data = await resMatriculas.json();
      if (data.success) matriculas = data.matriculas;
    }
    if (resProgresso.ok) {
      const data = await resProgresso.json();
      if (data.success) sequencia = data.sequencia || 0;
    }
  } catch (e) {
    console.warn('Não foi possível buscar dados:', e);
  }

  const sequenciaEl = document.querySelector('.sequencia');
  if (sequenciaEl) {
    sequenciaEl.textContent = sequencia > 0
      ? `Você está em uma sequência de ${sequencia} dia${sequencia !== 1 ? 's' : ''}!`
      : 'Faça login todo dia para manter sua sequência!';
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

  const calGrid   = document.querySelector('.cal-grid');
  const calHeader = document.querySelector('.cal-header span');
  if (calGrid && calHeader) {
    const hoje       = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
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
      const agoraMin      = agoraBrasilia.getHours() * 60 + agoraBrasilia.getMinutes();

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

  const filtros   = document.querySelectorAll('.filtro[data-filter]');
  const cards     = Array.from(document.querySelectorAll('.curso-card'));
  const porPagina = 6;
  let paginaAtual = 1;

  function cardsVisiveis() {
    return cards.filter(c => c.style.display !== 'none');
  }

  function renderCards(visiveis) {
    cards.forEach(c => c.style.display = 'none');
    const inicio = (paginaAtual - 1) * porPagina;
    visiveis.slice(inicio, inicio + porPagina).forEach(c => c.style.display = 'flex');
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina);
    const paginacao    = document.querySelector('.paginacao');

    paginacao.innerHTML = '';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'pag-btn';
    btnPrev.innerHTML = '<i class="ph ph-caret-left"></i>';
    btnPrev.disabled  = paginaAtual === 1;
    btnPrev.addEventListener('click', () => {
      if (paginaAtual > 1) { paginaAtual--; renderCards(cardsVisiveis()); renderPaginacao(cardsVisiveis()); }
    });
    paginacao.appendChild(btnPrev);

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
      paginacao.appendChild(num);
    }

    const btnNext = document.createElement('button');
    btnNext.className = 'pag-btn';
    btnNext.innerHTML = '<i class="ph ph-caret-right"></i>';
    btnNext.disabled  = paginaAtual === totalPaginas || totalPaginas === 0;
    btnNext.addEventListener('click', () => {
      if (paginaAtual < totalPaginas) { paginaAtual++; renderCards(cardsVisiveis()); renderPaginacao(cardsVisiveis()); }
    });
    paginacao.appendChild(btnNext);
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      paginaAtual = 1;
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        card.style.display = (filter === 'todos' || card.dataset.categoria === filter) ? 'flex' : 'none';
      });
      renderCards(cardsVisiveis());
      renderPaginacao(cardsVisiveis());
    });
  });

  renderCards(cardsVisiveis());
  renderPaginacao(cardsVisiveis());


  // Função para testar a API de previsão de compra
  // Pode-se ajustar os dados de entrada conforme necessário para testar diferentes cenários
  // LEMBRA DE BAIXAR OS REQUISITOS DA API ANTES DE RODAR ESTA FUNÇÃO TBM
  // LEMBRE DE RODAR O SERVIDOR DA API ANTES DE TESTAR ESTA FUNÇÃO!!!
  // comando para rodar a API:
  // cd backend
  // py -m uvicorn app.prediction_api:app --reload
  window.preverCompra = async function () {

    const dados = obterDadosFormulario();

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await response.json();

        alert(`
Probabilidade: ${resultado.probabilidade_compra}

Desconto: ${resultado.desconto}%

Perfil: ${resultado.perfil}
        `);

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");

    }
};

window.testarPredictRule = async function () {

    const dados = obterDadosFormulario();

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict-rule",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await response.json();

        alert(`
Método: ${resultado.metodo}

Compraria: ${resultado.compraria}
        `);

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");

    }
};

window.testarCluster = async function () {

    const dados = obterDadosFormulario();

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/cluster",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await response.json();

        alert(`
Cluster: ${resultado.cluster}
        `);

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");

    }
};


window.testarForecast = async function () {

    const dados = obterDadosFormulario();

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/forecast",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await response.json();

        alert(`
Próxima compra estimada:

${resultado.proxima_compra_estimada}
        `);

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");

    }
};

window.testarModelInfo = async function () {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/model-info"
        );

        const resultado = await response.json();

        alert(`
Modelo: ${resultado.modelo}

Objetivo: ${resultado.objetivo}
        `);

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com a API.");

    }
};


});

function obterDadosFormulario() {

    return {
        idade: Number(document.getElementById("idade").value),
        tempo_navegacao: Number(document.getElementById("tempo_navegacao").value),
        preco_curso: Number(document.getElementById("preco_curso").value),
        categoria: Number(document.getElementById("categoria").value),
        nivel_interesse: Number(document.getElementById("nivel_interesse").value),
        visualizacoes: Number(document.getElementById("visualizacoes").value),
        ja_comprou_antes: Number(document.getElementById("ja_comprou_antes").value)
    };

}