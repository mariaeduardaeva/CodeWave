document.addEventListener('DOMContentLoaded', async () => {

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
  } catch (err) {
    console.warn('Fallback local.', err);
    Object.entries(cursos).forEach(([id, c]) => {
      if (c.matriculado) matriculas[id] = c.progresso;
    });
  }

  const cursosConcluidosList = Object.entries(matriculas)
    .filter(([, prog]) => prog >= 100)
    .map(([id]) => ({ id, ...cursos[id] }))
    .filter(c => c.titulo);

  const total = cursosConcluidosList.length;

  function parsearMinutos(dur) {
    const match = dur.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  let totalMinutos = 0;
  cursosConcluidosList.forEach(curso => {
    if (curso.aulas) curso.aulas.forEach(aula => { totalMinutos += parsearMinutos(aula.dur) })
  })

  const horas    = Math.floor(totalMinutos / 60)
  const minutos  = totalMinutos % 60
  const horasStr = minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`

  const parabensEl         = document.getElementById('parabensTexto')
  const resumoConcluidosEl = document.getElementById('resumoConcluidos')
  const resumoCertEl       = document.getElementById('resumoCertificados')
  const resumoHorasEl      = document.getElementById('resumoHoras')
  const resumoSequenciaEl  = document.getElementById('resumoSequencia')
  const subtituloEl        = document.querySelector('.section-header p')
  const paginacao          = document.querySelector('.paginacao')

  if (parabensEl)         parabensEl.innerHTML = `Você conquistou<br>${total} certificado${total !== 1 ? 's' : ''}`
  if (resumoConcluidosEl) resumoConcluidosEl.textContent = total
  if (resumoCertEl)       resumoCertEl.textContent = total
  if (resumoHorasEl)      resumoHorasEl.textContent = totalMinutos > 0 ? horasStr : '—'
  if (resumoSequenciaEl)  resumoSequenciaEl.textContent = sequencia > 0 ? `${sequencia} dia${sequencia !== 1 ? 's' : ''}` : '—'

  const grid = document.getElementById('certificadosGrid')
  grid.innerHTML = ''

  if (subtituloEl) {
    subtituloEl.textContent = total > 0
      ? 'Aqui estão todos os certificados que você conquistou'
      : 'Você ainda não concluiu nenhum curso. Continue estudando!'
  }

  if (paginacao) paginacao.style.display = 'none'
  if (total === 0) return

  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  let nomeUsuario = 'Aluno CodeWave'
  try {
    const resUser  = await fetch('/session-user', { credentials: 'include' })
    const dataUser = await resUser.json()
    if (dataUser.logged && dataUser.user.name) nomeUsuario = dataUser.user.name
  } catch (e) {}

  cursosConcluidosList.forEach(curso => {
    const card = document.createElement('div')
    card.className = 'cert-card'
    card.dataset.categoria = curso.categoria.toLowerCase()

    card.innerHTML = `
      <div class="cert-thumb" style="background: ${curso.cor}">
        <img src="${curso.imagem}" alt="${curso.titulo}">
        <span class="card-tag">${curso.categoria}</span>
      </div>
      <div class="cert-info">
        <span class="cert-date">Concluído em ${hoje}</span>
        <div class="cert-status">
          <i class="ph-fill ph-check-circle" style="color: #03743c; font-size: 18px;"></i>
          <span>Curso concluído</span>
        </div>
        <h3>${curso.titulo}</h3>
        <a href="#" class="cert-link">Baixar certificado <i class="ph ph-caret-right"></i></a>
      </div>
    `

    card.querySelector('.cert-link').addEventListener('click', (e) => {
      e.preventDefault()
      gerarCertificado(curso.titulo, curso.categoria, curso.cor, hoje, nomeUsuario)
    })

    grid.appendChild(card)
  })

  const filtros   = document.querySelectorAll('.filtro[data-filter]')
  const porPagina = 6
  let paginaAtual = 1
  let filtroAtivo = 'todos'

  function cards() { return Array.from(grid.querySelectorAll('.cert-card')) }

  function cardsVisiveis() {
    return cards().filter(c => filtroAtivo === 'todos' || c.dataset.categoria === filtroAtivo)
  }

  function renderCards(visiveis) {
    cards().forEach(c => c.style.display = 'none')
    const inicio = (paginaAtual - 1) * porPagina
    visiveis.slice(inicio, inicio + porPagina).forEach(c => c.style.display = 'flex')
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina) || 1
    paginacao.style.display = 'flex'
    paginacao.innerHTML = ''

    const btnPrev = document.createElement('button')
    btnPrev.className = 'pag-btn'
    btnPrev.innerHTML = '<i class="ph ph-caret-left"></i>'
    btnPrev.disabled = paginaAtual === 1
    btnPrev.addEventListener('click', () => {
      if (paginaAtual > 1) { paginaAtual--; renderCards(cardsVisiveis()); renderPaginacao(cardsVisiveis()) }
    })
    paginacao.appendChild(btnPrev)

    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span')
      num.classList.add('pag-num')
      if (i === paginaAtual) num.classList.add('active')
      num.textContent = i
      num.addEventListener('click', () => { paginaAtual = i; renderCards(cardsVisiveis()); renderPaginacao(cardsVisiveis()) })
      paginacao.appendChild(num)
    }

    const btnNext = document.createElement('button')
    btnNext.className = 'pag-btn'
    btnNext.innerHTML = '<i class="ph ph-caret-right"></i>'
    btnNext.disabled = paginaAtual === totalPaginas
    btnNext.addEventListener('click', () => {
      if (paginaAtual < totalPaginas) { paginaAtual++; renderCards(cardsVisiveis()); renderPaginacao(cardsVisiveis()) }
    })
    paginacao.appendChild(btnNext)
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'))
      btn.classList.add('active')
      filtroAtivo = btn.dataset.filter
      paginaAtual = 1
      renderCards(cardsVisiveis())
      renderPaginacao(cardsVisiveis())
    })
  })

  renderCards(cardsVisiveis())
  renderPaginacao(cardsVisiveis())

  document.querySelector('.baixar-card').addEventListener('click', async () => {
    const allCards = grid.querySelectorAll('.cert-card')
    if (allCards.length === 0) return

    const icon   = document.querySelector('.baixar-icon')
    const titulo = document.querySelector('.baixar-card h3')
    icon.innerHTML = '<i class="ph ph-spinner"></i>'
    titulo.textContent = 'Gerando certificados...'

    const zip = new JSZip()

    for (const card of allCards) {
      const nome      = card.querySelector('h3').textContent.trim()
      const data      = card.querySelector('.cert-date').textContent.replace('Concluído em ', '')
      const categoria = card.dataset.categoria
      const cor       = cursosConcluidosList.find(c => c.titulo === nome)?.cor || '#0147A9'
      const blob      = await gerarCertificadoBlob(nome, categoria, cor, data, nomeUsuario)
      zip.file(`Certificado - ${nome}.pdf`, blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a   = document.createElement('a')
    a.href = url; a.download = 'Certificados CodeWave.zip'; a.click()
    URL.revokeObjectURL(url)

    icon.innerHTML = '<i class="ph ph-check" style="color:#03743c"></i>'
    titulo.textContent = 'Download concluído!'
    setTimeout(() => {
      icon.innerHTML = '<i class="ph ph-download-simple"></i>'
      titulo.textContent = 'Baixar todos os certificados'
    }, 3000)
  })
})

function gerarIdCertificado(nome, curso) {
  let hash = 0
  const str = nome + curso + new Date().getFullYear()
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const h = Math.abs(hash).toString(16).padStart(8, '0')
  return `${h.slice(0,8)}-${h.slice(0,4)}-${h.slice(4,8)}-${h.slice(0,4)}-${h}${h.slice(0,8)}`
}

function construirHTMLCertificado(nomeCurso, categoria, cor, data, nomeAluno) {
  const certId = gerarIdCertificado(nomeAluno, nomeCurso)
  const catLabel = categoria.charAt(0).toUpperCase() + categoria.slice(1)

  const urlCertificado = `https://codewaveunp.com.br/certificados/${certId.slice(0, 8)}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(urlCertificado)}&bgcolor=ffffff&color=000000&margin=2`

  return `
    <div id="cert-render" style="
      width: 1122px;
      height: 794px;
      background: #ffffff;
      position: relative;
      font-family: 'Inter', Arial, sans-serif;
      overflow: hidden;
    ">

      <svg style="position:absolute;top:0;left:0;" width="660" height="160" viewBox="0 0 660 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 H660 Q480 0 420 120 Q395 160 0 160 Z" fill="#0147A9"/>
      </svg>

      <div style="
        position: absolute;
        top: 36px;
        left: 40px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 10;
      ">
        <svg width="72" height="72" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M55 20 L35 40 L55 60" />
            <path d="M70 40 C80 22, 96 22, 110 40 C124 58, 140 58, 150 40" />
            <path d="M165 20 L185 40 L165 60" />
          </g>
        </svg>
        <div>
          <div style="font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height:1;">CodeWave</div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 2px;">Plataforma de Cursos Online</div>
        </div>
      </div>

      <div style="
        position: absolute;
        top: 28px;
        right: 40px;
        width: 120px; height: 120px;
        z-index: 10;
      ">
        <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="54" fill="#0147A9"/>
          <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="4 3"/>
          <svg x="18" y="34" width="84" height="52" viewBox="0 0 220 80">
            <g fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
              <path d="M55 20 L35 40 L55 60" />
              <path d="M70 40 C80 22, 96 22, 110 40 C124 58, 140 58, 150 40" />
              <path d="M165 20 L185 40 L165 60" />
            </g>
          </svg>
        </svg>
      </div>

      <div style="
        position: absolute;
        top: 160px; left: 0; right: 0; bottom: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      ">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
          <div style="height:1px; width:70px; background:linear-gradient(to right, transparent, #0147A9);"></div>
          <span style="font-size:12px; font-weight:700; color:#0147A9; letter-spacing:3.5px;">CERTIFICADO DE CONCLUSÃO</span>
          <div style="height:1px; width:70px; background:linear-gradient(to left, transparent, #0147A9);"></div>
        </div>

        <div style="font-size:17px; color:#666; margin-bottom:10px;">Certificamos que</div>

        <div style="
          font-size: 64px;
          font-weight: 900;
          color: #111;
          letter-spacing: -2px;
          line-height: 1;
          margin-bottom: 10px;
          max-width: 700px;
          text-align: center;
        ">${nomeAluno}</div>

        <div style="width: 120px; height: 3px; background: #0147A9; border-radius: 2px; margin-bottom: 16px;"></div>

        <div style="font-size:17px; color:#666; margin-bottom:10px;">concluiu com êxito o curso</div>

        <div style="
          font-size: 32px;
          font-weight: 800;
          color: #0147A9;
          line-height: 1.2;
          text-align: center;
          max-width: 620px;
          margin-bottom: 26px;
        ">${nomeCurso}</div>

        <div style="display:flex; gap:14px;">
          <div style="
            background: #f0f6ff;
            border-radius: 14px;
            padding: 11px 22px;
            display: flex; align-items: center; gap: 12px;
            border: 1px solid #d0e3fa;
          ">
            <div style="
              width: 38px; height: 38px; background: #0147A9; border-radius: 10px;
              display: flex; align-items: center; justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm0 176H48V48h160v160Zm-96-96h64a8 8 0 0 1 0 16h-64a8 8 0 0 1 0-16Zm0 32h64a8 8 0 0 1 0 16h-64a8 8 0 0 1 0-16ZM80 112a8 8 0 1 1 8 8 8 8 0 0 1-8-8Zm0 32a8 8 0 1 1 8 8 8 8 0 0 1-8-8Z" fill="#ffffff"/>
              </svg>
            </div>
            <div>
              <div style="font-size:11px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Categoria</div>
              <div style="font-size:15px; font-weight:800; color:#111;">${catLabel}</div>
            </div>
          </div>
          <div style="
            background: #f0f6ff;
            border-radius: 14px;
            padding: 11px 22px;
            display: flex; align-items: center; gap: 12px;
            border: 1px solid #d0e3fa;
          ">
            <div style="
              width: 38px; height: 38px; background: #0147A9; border-radius: 10px;
              display: flex; align-items: center; justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48A16 16 0 0 0 32 48v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm0 176H48V48h24v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48v-8h160Zm-96-96a8 8 0 1 1-8-8 8 8 0 0 1 8 8Zm32 0a8 8 0 1 1-8-8 8 8 0 0 1 8 8Zm32 0a8 8 0 1 1-8-8 8 8 0 0 1 8 8ZM80 168a8 8 0 1 1-8-8 8 8 0 0 1 8 8Zm32 0a8 8 0 1 1-8-8 8 8 0 0 1 8 8Zm32 0a8 8 0 1 1-8-8 8 8 0 0 1 8 8Z" fill="#ffffff"/>
              </svg>
            </div>
            <div>
              <div style="font-size:11px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Data de conclusão</div>
              <div style="font-size:15px; font-weight:800; color:#111;">${data}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="
        position: absolute;
        right: 0;
        top: 140px;
        bottom: 90px;
        width: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      ">
        <svg viewBox="0 0 220 220" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
          <circle cx="110" cy="110" r="100" fill="#f0f6ff" opacity="0.7"/>
          <rect x="30" y="50" width="150" height="110" rx="10" fill="#ffffff" stroke="#d0e3fa" stroke-width="2"/>
          <rect x="30" y="50" width="150" height="26" rx="10" fill="#0147A9"/>
          <rect x="30" y="66" width="150" height="10" rx="0" fill="#0147A9"/>
          <circle cx="48" cy="63" r="5" fill="#FF5F57"/>
          <circle cx="63" cy="63" r="5" fill="#FEBC2E"/>
          <circle cx="78" cy="63" r="5" fill="#28C840"/>
          <rect x="44" y="88" width="60" height="5" rx="2" fill="#0147A9" opacity="0.7"/>
          <rect x="44" y="100" width="90" height="5" rx="2" fill="#93b9e8" opacity="0.7"/>
          <rect x="44" y="112" width="70" height="5" rx="2" fill="#93b9e8" opacity="0.7"/>
          <rect x="44" y="124" width="50" height="5" rx="2" fill="#0147A9" opacity="0.5"/>
          <rect x="44" y="136" width="80" height="5" rx="2" fill="#93b9e8" opacity="0.7"/>
          <circle cx="165" cy="155" r="22" fill="#f59e0b" opacity="0.9"/>
          <circle cx="165" cy="155" r="13" fill="#fff"/>
          <circle cx="165" cy="155" r="6" fill="#f59e0b"/>
          <circle cx="55" cy="165" r="18" fill="#0147A9"/>
          <polyline points="46,165 53,172 64,158" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="185" cy="75" r="10" fill="#a78bfa" opacity="0.7"/>
          <circle cx="35" cy="175" r="7" fill="#93c5fd" opacity="0.6"/>
        </svg>
      </div>

      <div style="
        position: absolute;
        bottom: 44px;
        left: 0; right: 0;
        padding: 0 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid #e8edf5;
        padding-top: 18px;
      ">
        <div style="display:flex; align-items:center; gap:14px;">
          <img
            src="${qrUrl}"
            width="70"
            height="70"
            style="border-radius:4px; display:block;"
            crossorigin="anonymous"
          />
          <div>
            <div style="font-size:12px; font-weight:700; color:#111; margin-bottom:2px;">Verifique a autenticidade</div>
            <div style="font-size:11px; color:#888;">Escaneie o QR Code ou acesse:</div>
            <div style="font-size:11px; color:#0147A9; font-weight:600;">codewaveunp.com.br/certificados/${certId.slice(0,8)}</div>
          </div>
        </div>

        <div style="text-align:center;">
          <div style="
            font-family: 'Brush Script MT', 'Segoe Script', cursive;
            font-size: 36px;
            color: #222;
            margin-bottom: 4px;
            border-bottom: 1.5px solid #333;
            padding-bottom: 4px;
            line-height: 1.2;
          ">CodeWave</div>
          <div style="font-size:12px; font-weight:700; color:#111;">Equipe CodeWave</div>
          <div style="font-size:11px; color:#888;">Plataforma de Cursos Online</div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <div style="
            width: 38px; height: 38px; background: #0147A9; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
          ">
            <svg width="22" height="22" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M208 40H48a8 8 0 0 0-8 8v104a88 88 0 0 0 88 88 88 88 0 0 0 88-88V48a8 8 0 0 0-8-8Zm-8 112a72 72 0 0 1-144 0V56h144v96Z" fill="#ffffff"/>
            </svg>
          </div>
          <div>
            <div style="font-size:12px; font-weight:700; color:#111; margin-bottom:2px;">ID do certificado</div>
            <div style="font-size:11px; color:#0147A9; font-weight:600;">${certId}</div>
          </div>
        </div>
      </div>

      <div style="
        position: absolute;
        bottom: 0; left: 0; right: 0;
        background: #0147A9;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
      ">
        <span style="font-size:13px; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px;">
          <svg width="28" height="28" viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M55 20 L35 40 L55 60" />
              <path d="M70 40 C80 22, 96 22, 110 40 C124 58, 140 58, 150 40" />
              <path d="M165 20 L185 40 L165 60" />
            </g>
          </svg>
          CodeWave
        </span>
        <span style="color:rgba(255,255,255,0.4);">—</span>
        <span style="font-size:13px; color:rgba(255,255,255,0.85);">Transformando aprendizado em futuro</span>
        <span style="color:rgba(255,255,255,0.4);">|</span>
        <span style="font-size:13px; color:rgba(255,255,255,0.85);">www.codewaveunp.com.br</span>
      </div>
    </div>
  `
}

async function gerarCertificado(nomeCurso, categoria, cor, data, nomeAluno) {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = construirHTMLCertificado(nomeCurso, categoria, cor, data, nomeAluno)
  document.body.appendChild(container)

  const el = container.querySelector('#cert-render')

  await new Promise(r => setTimeout(r, 100))

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    width: 1122,
    height: 794,
  })

  document.body.removeChild(container)

  const { jsPDF } = window.jspdf
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const imgData = canvas.toDataURL('image/png')
  doc.addImage(imgData, 'PNG', 0, 0, 297, 210)
  doc.save(`Certificado - ${nomeCurso}.pdf`)
}

async function gerarCertificadoBlob(nomeCurso, categoria, cor, data, nomeAluno) {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = construirHTMLCertificado(nomeCurso, categoria, cor, data, nomeAluno)
  document.body.appendChild(container)

  const el = container.querySelector('#cert-render')
  await new Promise(r => setTimeout(r, 100))

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    width: 1122,
    height: 794,
  })

  document.body.removeChild(container)

  const { jsPDF } = window.jspdf
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const imgData = canvas.toDataURL('image/png')
  doc.addImage(imgData, 'PNG', 0, 0, 297, 210)
  return doc.output('blob')
}