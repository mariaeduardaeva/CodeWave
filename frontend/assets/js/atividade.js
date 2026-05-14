document.addEventListener('DOMContentLoaded', () => {
  const filtros = document.querySelectorAll('.filtro[data-filter]')
  const filtrosStatus = document.querySelectorAll('.filtro-status[data-status]')
  const items = Array.from(document.querySelectorAll('.atividade-item'))
  const porPagina = 5
  let paginaAtual = 1
  let filtroAtivo = 'todos'
  let statusAtivo = 'todos'

  function itemsVisiveis() {
    return items.filter(item => {
      const catOk = filtroAtivo === 'todos' || item.dataset.categoria === filtroAtivo
      const statusOk = statusAtivo === 'todos' || item.dataset.status === statusAtivo
      return catOk && statusOk
    })
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina)
    const paginacao = document.querySelector('.paginacao')
    const prevBtn = paginacao.querySelector('.pag-btn:first-child')
    const nextBtn = paginacao.querySelector('.pag-btn:last-child')
    paginacao.querySelectorAll('.pag-num').forEach(n => n.remove())
    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span')
      num.classList.add('pag-num')
      if (i === paginaAtual) num.classList.add('active')
      num.textContent = i
      num.addEventListener('click', () => {
        paginaAtual = i
        renderItems(itemsVisiveis())
        renderPaginacao(itemsVisiveis())
      })
      paginacao.insertBefore(num, nextBtn)
    }
  }

  function renderItems(visiveis) {
    items.forEach(i => i.style.display = 'none')
    const inicio = (paginaAtual - 1) * porPagina
    visiveis.slice(inicio, inicio + porPagina).forEach(i => i.style.display = 'flex')
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'))
      btn.classList.add('active')
      filtroAtivo = btn.dataset.filter
      paginaAtual = 1
      renderItems(itemsVisiveis())
      renderPaginacao(itemsVisiveis())
    })
  })

  filtrosStatus.forEach(btn => {
    btn.addEventListener('click', () => {
      filtrosStatus.forEach(f => f.classList.remove('active'))
      btn.classList.add('active')
      statusAtivo = btn.dataset.status
      paginaAtual = 1
      renderItems(itemsVisiveis())
      renderPaginacao(itemsVisiveis())
    })
  })

  renderItems(itemsVisiveis())
  renderPaginacao(itemsVisiveis())
})