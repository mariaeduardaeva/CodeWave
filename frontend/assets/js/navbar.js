const cursosData = {
  poo: { titulo: 'Programação orientada a objeto', categoria: 'Backend', nivel: 'Iniciante', cor: '#0147A9' },
  figma: { titulo: 'Básicos de Figma', categoria: 'Frontend', nivel: 'Iniciante', cor: '#5629B8' },
  html: { titulo: 'HTML e CSS', categoria: 'Frontend', nivel: 'Iniciante', cor: '#03743C' },
  java: { titulo: 'Java: básico ao avançado', categoria: 'Backend', nivel: 'Intermediário', cor: '#FD7B12' },
  react: { titulo: 'ReactJS: Como funciona?', categoria: 'Frontend', nivel: 'Intermediário', cor: '#01A7AF' },
  node: { titulo: 'APIs Rest com o Node.js', categoria: 'Backend', nivel: 'Avançado', cor: '#014F27' },
}

function loadNavbar() {
  const isInPages = window.location.pathname.includes('/pages/')
  const navbar = `
    <nav>
      <div class="nav-left"></div>
      <div class="nav-center" id="nav-center">
        <span class="nav-pill"></span>
        <span class="nav-item" data-page="dashboard">Todos</span>
        <span class="nav-item" data-page="em-andamento">Em andamento</span>
        <span class="nav-item" data-page="completo">Completo</span>
      </div>

      <div class="nav-search-wrapper" id="nav-search-wrapper">
        <div class="nav-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" id="nav-search-input" placeholder="Buscar curso..." autocomplete="off" />
          <button class="nav-search-close" id="nav-search-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="nav-search-results" id="nav-search-results"></div>
      </div>

      <div class="nav-right">
        <button class="nav-icon" id="nav-search-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>

        <div class="nav-notification">
          <button class="nav-icon" id="nav-notif-toggle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <div class="notification-dropdown" id="notification-dropdown">
            <div class="notification-dropdown-title">Notificações</div>
            <div class="notification-dropdown-divider"></div>
            <div class="notification-empty">Nenhuma notificação por enquanto.</div>
          </div>
        </div>

        <div class="nav-avatar" id="nav-avatar">
          <span id="nav-avatar-letter">?</span>
          <div class="profile-dropdown" id="profile-dropdown">
            <div class="profile-dropdown-name" id="profile-name">Carregando...</div>
            <div class="profile-dropdown-email" id="profile-email"></div>
            <div class="profile-dropdown-divider"></div>
            <button class="btn-sair" id="btn-sair">Sair</button>
          </div>
        </div>
      </div>
    </nav>
  `
  document.getElementById('navbar').innerHTML = navbar

  const page = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard'
  const pill = document.querySelector('.nav-pill')

  function movePill(item) {
    pill.style.width = item.offsetWidth + 'px'
    pill.style.left = item.offsetLeft + 'px'
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === page) {
      item.classList.add('active')
      setTimeout(() => movePill(item), 0)
    }

    item.addEventListener('click', () => {
      const dest = item.dataset.page
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'))
      item.classList.add('active')
      movePill(item)

      setTimeout(() => {
        if (isInPages) {
          window.location.href = dest === 'dashboard' ? 'dashboard.html' : `${dest}.html`
        } else {
          window.location.href = dest === 'dashboard' ? 'pages/dashboard.html' : `pages/${dest}.html`
        }
      }, 350)
    })
  })

  const searchToggle = document.getElementById('nav-search-toggle')
  const searchWrapper = document.getElementById('nav-search-wrapper')
  const searchInput = document.getElementById('nav-search-input')
  const searchClose = document.getElementById('nav-search-close')
  const searchResults = document.getElementById('nav-search-results')
  const navCenter = document.getElementById('nav-center')

  function openSearch() {
    searchWrapper.classList.add('open')
    navCenter.classList.add('hidden')
    setTimeout(() => searchInput.focus(), 300)
  }

  function closeSearch() {
    searchWrapper.classList.remove('open')
    navCenter.classList.remove('hidden')
    searchInput.value = ''
    searchResults.innerHTML = ''
    searchResults.classList.remove('open')
  }

  searchToggle.addEventListener('click', e => {
    e.stopPropagation()
    openSearch()
  })

  searchClose.addEventListener('click', closeSearch)

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch()
  })

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase()

    if (!query) {
      searchResults.innerHTML = ''
      searchResults.classList.remove('open')
      return
    }

    const matches = Object.entries(cursosData).filter(([_, curso]) =>
      curso.titulo.toLowerCase().includes(query) ||
      curso.categoria.toLowerCase().includes(query) ||
      curso.nivel.toLowerCase().includes(query)
    )

    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="search-empty">Nenhum curso encontrado</div>`
      searchResults.classList.add('open')
      return
    }

    searchResults.innerHTML = matches.map(([id, curso]) => `
      <div class="search-result-item" data-id="${id}">
        <div class="search-result-dot" style="background:${curso.cor}"></div>
        <div class="search-result-info">
          <span class="search-result-titulo">${curso.titulo}</span>
          <span class="search-result-meta">${curso.categoria} · ${curso.nivel}</span>
        </div>
      </div>
    `).join('')

    searchResults.classList.add('open')

    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', async () => {
        const id = item.dataset.id
        const base = isInPages ? '' : 'pages/'

        try {
          const res = await fetch('/minhas-matriculas', { credentials: 'include' })
          const data = await res.json()
          const matriculas = data.success ? data.matriculas : {}

          if (matriculas[id] !== undefined) {
            window.location.href = `${base}clicarcurso.html?curso=${id}`
          } else {
            window.location.href = `${base}pagamento.html?curso=${id}`
          }
        } catch (e) {
          window.location.href = `${base}pagamento.html?curso=${id}`
        }
      })
    })
  })

  document.addEventListener('click', e => {
    if (!searchWrapper.contains(e.target) && e.target !== searchToggle) {
      closeSearch()
    }
  })

  const notifToggle = document.getElementById('nav-notif-toggle')
  const notifDropdown = document.getElementById('notification-dropdown')

  notifToggle.addEventListener('click', e => {
    e.stopPropagation()
    notifDropdown.classList.toggle('open')
    profileDropdown.classList.remove('open')
  })

  document.addEventListener('click', () => notifDropdown.classList.remove('open'))
  notifDropdown.addEventListener('click', e => e.stopPropagation())

  const avatar = document.getElementById('nav-avatar')
  const profileDropdown = document.getElementById('profile-dropdown')

  avatar.addEventListener('click', e => {
    e.stopPropagation()
    profileDropdown.classList.toggle('open')
    notifDropdown.classList.remove('open')
  })

  document.addEventListener('click', () => profileDropdown.classList.remove('open'))
  profileDropdown.addEventListener('click', e => e.stopPropagation())

  fetch('/session-user', { credentials: 'include' })
    .then(r => r.json())
    .then(data => {
      if (!data.logged) {
        window.location.href = isInPages ? '../index.html' : 'index.html'
        return
      }
      const { name, email } = data.user
      document.getElementById('nav-avatar-letter').textContent = name.charAt(0).toUpperCase()
      document.getElementById('profile-name').textContent = name
      document.getElementById('profile-email').textContent = email
    })
    .catch(() => {
      document.getElementById('profile-name').textContent = 'Erro ao carregar'
    })

  document.getElementById('btn-sair').addEventListener('click', () => {
    fetch('/logout', { credentials: 'include' })
      .then(() => {
        window.location.href = isInPages ? '../index.html' : 'index.html'
      })
  })
}

document.addEventListener('DOMContentLoaded', loadNavbar)