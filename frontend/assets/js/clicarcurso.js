let _estadoCurso = null;

async function salvarProgressoBackend(cursoId, aulasConcluidas, totalAulas) {
  const novoProgresso = Math.round((aulasConcluidas / totalAulas) * 100);
  try {
    await fetch('/progresso', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_id: cursoId, progresso: novoProgresso })
    });
  } catch (err) {
    console.warn('Erro ao salvar progresso no backend:', err);
  }
}

async function concluirAula() {
  if (!_estadoCurso) return;

  const { curso, cursoId } = _estadoCurso;
  const totalAulas = curso.aulas.length;

  if (_estadoCurso.aulasConcluidas >= totalAulas) return;

  _estadoCurso.aulasConcluidas += 1;
  const novoProgresso = Math.round((_estadoCurso.aulasConcluidas / totalAulas) * 100);
  _estadoCurso.progresso = novoProgresso;

  await salvarProgressoBackend(cursoId, _estadoCurso.aulasConcluidas, totalAulas);
  atualizarProgressoUI(curso, _estadoCurso.aulasConcluidas, novoProgresso);

  document.querySelector('.aulas-list').innerHTML =
    renderAulas(curso.aulas, true, _estadoCurso.aulasConcluidas);
}

function atualizarProgressoUI(curso, aulasConcluidas, progresso) {
  const totalAulas = curso.aulas.length;

  document.querySelector('.progress-fill').style.width = progresso + '%';
  document.querySelector('.hero-progress-label').textContent = progresso + '% Concluído';
  document.querySelector('.progresso-pct').textContent = progresso + '%';

  const circulo = document.querySelectorAll('.progresso-circle svg circle')[1];
  circulo.setAttribute('stroke-dashoffset', calcularDashoffset(progresso));

  document.querySelectorAll('.stat-val')[0].textContent =
    aulasConcluidas + ' de ' + totalAulas;

  atualizarProximaAulaUI(curso.aulas, aulasConcluidas);
}

function toggleAula(btn) {
  const item = btn.closest('.aula-item');
  const dropdown = item.nextElementSibling;
  const svg = btn.querySelector('svg');
  const isOpen = dropdown.style.display === 'block';
  dropdown.style.display = isOpen ? 'none' : 'block';
  svg.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

function getIconeAula(status) {
  if (status === 'concluida') {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  }
  if (status === 'andamento') {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
}

function getBadgeAula(status) {
  if (status === 'concluida') return `<span class="aula-badge concluida-badge">Concluída</span>`;
  if (status === 'andamento') return `<span class="aula-badge andamento-badge">Em andamento</span>`;
  return `<span class="aula-badge bloqueada-badge">Bloqueada</span>`;
}

function resolverStatusAulas(aulas, matriculado, aulasConcluidas) {
  if (!matriculado) {
    return aulas.map(a => ({ ...a, status: 'bloqueada' }));
  }

  return aulas.map((a, i) => {
    if (i < aulasConcluidas)  return { ...a, status: 'concluida' };
    if (i === aulasConcluidas) return { ...a, status: 'andamento' };
    return { ...a, status: 'bloqueada' };
  });
}

function renderAulas(aulas, matriculado, aulasConcluidas) {
  const aulasResolvidas = resolverStatusAulas(aulas, matriculado, aulasConcluidas);
  const totalAulas = aulas.length;
  const todasConcluidas = aulasConcluidas >= totalAulas;

  return aulasResolvidas.map((aula, index) => {
    const isAndamento = aula.status === 'andamento';

    const iconeOnclick = (isAndamento && !todasConcluidas)
      ? `onclick="concluirAula()" style="cursor:pointer;" title="Marcar como concluída"`
      : '';

    return `
      <div class="aula-item ${aula.status}">
        <div class="aula-left">
          <div class="aula-icon ${aula.status === 'concluida' ? 'concluida-icon' : isAndamento ? 'play-icon' : 'lock-icon'}"
            ${iconeOnclick}>
            ${getIconeAula(aula.status)}
          </div>
          <div class="aula-info">
            <span class="aula-nome">${aula.nome}</span>
            <span class="aula-dur">${aula.dur}</span>
          </div>
        </div>
        <div class="aula-right">
          ${getBadgeAula(aula.status)}
          <button class="aula-toggle" onclick="toggleAula(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>
      <div class="aula-dropdown" style="display:none;">
        <p>${aula.desc}</p>
      </div>
    `;
  }).join('');
}

function calcularDashoffset(progresso) {
  const circunferencia = 263.9;
  return circunferencia - (circunferencia * progresso / 100);
}

function parsearMinutos(durStr) {
  const match = durStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function calcularTempoTotal(aulas) {
  const totalMin = aulas.reduce((acc, a) => acc + parsearMinutos(a.dur), 0);
  const horas = Math.floor(totalMin / 60);
  const minutos = totalMin % 60;
  return `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m`;
}

function calcularProximaAula(aulas, aulasConcluidas) {
  const total = aulas.length;
  const index = Math.min(aulasConcluidas, total - 1);
  const aula = aulas[index];
  return {
    nome: aula.nome,
    numero: `Aula ${index + 1}`,
    duracao: aula.dur
  };
}

function atualizarProximaAulaUI(aulas, aulasConcluidas) {
  const proxima = calcularProximaAula(aulas, aulasConcluidas);
  document.querySelector('.proxima-titulo').textContent = proxima.nome;
  document.querySelector('.proxima-badge').textContent = proxima.numero;
  document.querySelector('.proxima-dur').textContent = proxima.duracao;
}

function renderizarCurso(curso, matriculado, aulasConcluidas) {
  const progresso = !matriculado ? 0 : Math.round((aulasConcluidas / curso.aulas.length) * 100);

  document.querySelector('.bread-current').textContent = curso.titulo;
  document.querySelector('.hero-content h1').textContent = curso.titulo;
  document.querySelector('.hero-content p').textContent = curso.descricao;
  document.querySelector('.hero-tag').textContent = curso.categoria;
  document.querySelector('.hero-illustration img').src = curso.imagem;
  document.querySelector('.hero-illustration img').alt = curso.titulo;
  document.querySelector('.progress-fill').style.width = progresso + '%';
  document.querySelector('.hero-progress-label').textContent = progresso + '% Concluído';
  document.title = 'CodeWave - ' + curso.titulo;

  document.querySelector('.aulas-list').innerHTML =
    renderAulas(curso.aulas, matriculado, aulasConcluidas);

  document.querySelector('.progresso-pct').textContent = progresso + '%';
  const circulo = document.querySelectorAll('.progresso-circle svg circle')[1];
  circulo.setAttribute('stroke-dashoffset', calcularDashoffset(progresso));

  const totalAulas = curso.aulas.length;
  document.querySelectorAll('.stat-val')[0].textContent = aulasConcluidas + ' de ' + totalAulas;
  document.querySelectorAll('.stat-val')[1].textContent = calcularTempoTotal(curso.aulas);
  document.querySelectorAll('.stat-val')[2].textContent = curso.sequencia;

  const proxima = calcularProximaAula(curso.aulas, aulasConcluidas);
  document.querySelector('.proxima-titulo').textContent = proxima.nome;
  document.querySelector('.proxima-badge').textContent = proxima.numero;
  document.querySelector('.proxima-dur').textContent = proxima.duracao;
  document.querySelector('.proxima-quando span').textContent = curso.quando;
  document.querySelector('.proxima-thumb img').src = curso.imagem;
  document.querySelector('.proxima-thumb img').alt = curso.titulo;

  const metaVals = document.querySelectorAll('.meta-val');
  metaVals[0].textContent = curso.nivel;
  metaVals[1].textContent = curso.categoria;

  document.querySelector('.curso-hero').style.background = curso.cor;
  document.querySelector('.proxima-thumb').style.background = curso.cor;

  const btnContinuar = document.querySelector('.btn-continuar').cloneNode(true);
  document.querySelector('.btn-continuar').replaceWith(btnContinuar);
  const btnContinuarBlack = document.querySelector('.btn-continuar-black').cloneNode(true);
  document.querySelector('.btn-continuar-black').replaceWith(btnContinuarBlack);

  if (!matriculado) {
    const textoBotao = curso.preco ? `Comprar — ${curso.preco}` : 'Comprar curso';
    const cursoId = new URLSearchParams(window.location.search).get('curso');

    btnContinuar.textContent = textoBotao;
    btnContinuar.addEventListener('click', () => comprarCurso(cursoId));
    btnContinuarBlack.textContent = textoBotao;
    btnContinuarBlack.addEventListener('click', () => comprarCurso(cursoId));
  } else {
    const aoContinuar = () => concluirAula();
    btnContinuar.addEventListener('click', aoContinuar);
    btnContinuarBlack.addEventListener('click', aoContinuar);
  }

  document.querySelector('.btn-conteudo').addEventListener('click', () => {
    document.querySelector('.conteudo-section').scrollIntoView({ behavior: 'smooth' });
  });
}

async function comprarCurso(cursoId) {
  try {
    const res = await fetch('/comprar', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curso_id: cursoId })
    });

    const data = await res.json();

    if (data.success) {
      window.location.reload();
    } else if (res.status === 401) {
      window.location.href = '/index.html';
    } else {
      alert(data.message || 'Erro ao realizar matrícula.');
    }
  } catch (err) {
    console.error('Erro ao comprar curso:', err);
    alert('Erro de conexão. Tente novamente.');
  }
}

async function carregarCurso() {
  const params = new URLSearchParams(window.location.search);
  const cursoId = params.get('curso');
  const curso = cursos[cursoId];

  const origem = params.get('origem') || 'dashboard';
  const origens = {
    'dashboard':    { label: 'Todos',        href: 'dashboard.html' },
    'em-andamento': { label: 'Em andamento', href: 'em-andamento.html' },
    'completo':     { label: 'Completo',     href: 'completo.html' },
  };
  const paginaOrigem = origens[origem] || origens['dashboard'];
  const breadcrumbLink = document.querySelector('.breadcrumb a');
  breadcrumbLink.textContent = paginaOrigem.label;
  breadcrumbLink.href = paginaOrigem.href;

  if (!curso) {
    window.location.href = 'dashboard.html';
    return;
  }

  let matriculado = curso.matriculado;
  let progressoBackend = undefined;

  try {
    const res = await fetch('/minhas-matriculas', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.matriculas) {
        matriculado = cursoId in data.matriculas;
        progressoBackend = data.matriculas[cursoId];
      }
    }
  } catch (err) {
    console.warn('Não foi possível verificar matrículas no backend, usando dados locais.', err);
  }

  const totalAulas = curso.aulas.length;
  let aulasConcluidas = 0;

  if (matriculado) {
    const pct = progressoBackend !== undefined ? progressoBackend : curso.progresso;

    if (pct >= 100) {
      aulasConcluidas = totalAulas;
    } else {
      aulasConcluidas = Math.round((pct / 100) * totalAulas);
    }
  }

  _estadoCurso = { curso, cursoId, matriculado, aulasConcluidas, progresso: progressoBackend ?? curso.progresso };

  renderizarCurso(curso, matriculado, aulasConcluidas);
}

document.addEventListener('DOMContentLoaded', carregarCurso);