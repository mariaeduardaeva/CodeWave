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

function renderAulas(aulas) {
  return aulas.map(aula => `
    <div class="aula-item ${aula.status}">
      <div class="aula-left">
        <div class="aula-icon ${aula.status === 'concluida' ? 'concluida-icon' : aula.status === 'andamento' ? 'play-icon' : 'lock-icon'}">
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
  `).join('');
}

function calcularDashoffset(progresso) {
  const circunferencia = 263.9;
  return circunferencia - (circunferencia * progresso / 100);
}

function carregarCurso() {
  const params = new URLSearchParams(window.location.search);
  const cursoId = params.get('curso');
  const curso = cursos[cursoId];
  
  const origem = params.get('origem') || 'dashboard';
  const origens = {
    'dashboard': { label: 'Todos', href: 'dashboard.html' },
    'em-andamento': { label: 'Em andamento', href: 'em-andamento.html' },
    'completo': { label: 'Completo', href: 'completo.html' },
  };
  const paginaOrigem = origens[origem] || origens['dashboard'];
  const breadcrumbLink = document.querySelector('.breadcrumb a');
  breadcrumbLink.textContent = paginaOrigem.label;
  breadcrumbLink.href = paginaOrigem.href;
  
  if (!curso) {
    window.location.href = 'dashboard.html';
    return;
  }

  document.querySelector('.bread-current').textContent = curso.titulo;

  document.querySelector('.hero-content h1').textContent = curso.titulo;
  document.querySelector('.hero-content p').textContent = curso.descricao;
  document.querySelector('.hero-tag').textContent = curso.categoria;
  document.querySelector('.hero-illustration img').src = curso.imagem;
  document.querySelector('.hero-illustration img').alt = curso.titulo;
  document.querySelector('.progress-fill').style.width = curso.progresso + '%';
  document.querySelector('.hero-progress-label').textContent = curso.progresso + '% Concluído';

  document.title = 'CodeWave - ' + curso.titulo;

  document.querySelector('.aulas-list').innerHTML = renderAulas(curso.aulas);

  const dashoffset = calcularDashoffset(curso.progresso);
  document.querySelector('.progresso-pct').textContent = curso.progresso + '%';
  const circulo = document.querySelectorAll('.progresso-circle svg circle')[1];
  circulo.setAttribute('stroke-dashoffset', dashoffset);

  document.querySelectorAll('.stat-val')[0].textContent = curso.aulasFeitas + ' de ' + curso.totalAulas;
  document.querySelectorAll('.stat-val')[1].textContent = curso.tempoTotal;
  document.querySelectorAll('.stat-val')[2].textContent = curso.sequencia;

  document.querySelector('.proxima-titulo').textContent = curso.proximaAula.nome;
  document.querySelector('.proxima-badge').textContent = curso.proximaAula.numero;
  document.querySelector('.proxima-dur').textContent = curso.proximaAula.duracao;
  document.querySelector('.proxima-quando span').textContent = curso.proximaAula.quando;
  document.querySelector('.proxima-thumb img').src = curso.imagem;
  document.querySelector('.proxima-thumb img').alt = curso.titulo;

  const metaVals = document.querySelectorAll('.meta-val');
  metaVals[0].textContent = curso.nivel;
  metaVals[1].textContent = curso.categoria;

  document.querySelector('.curso-hero').style.background = curso.cor;
  document.querySelector('.proxima-thumb').style.background = curso.cor;

  document.querySelector('.btn-conteudo').addEventListener('click', () => {
  document.querySelector('.conteudo-section').scrollIntoView({ behavior: 'smooth' });
});
}

document.addEventListener('DOMContentLoaded', carregarCurso);