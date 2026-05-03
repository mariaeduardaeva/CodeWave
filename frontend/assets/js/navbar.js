function loadNavbar() {
  const isInPages = window.location.pathname.includes('/pages/')
  const navbar = `
    <nav>
      <div class="nav-left"></div>
      <div class="nav-center">
        <span class="nav-pill"></span>
        <span class="nav-item" data-page="dashboard">Todos</span>
        <span class="nav-item" data-page="em-andamento">Em andamento</span>
        <span class="nav-item" data-page="completo">Completo</span>
      </div>
      <div class="nav-right">
        <button class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
        <button class="nav-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <div class="nav-avatar">M</div>
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
}

loadNavbar()