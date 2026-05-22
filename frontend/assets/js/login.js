const toggle = document.getElementById('toggleSenha')
const senha = document.getElementById('senha')
const emailInput = document.querySelector('input[type="email"]')

toggle.addEventListener('click', () => {
  if (senha.type === 'password') {
    senha.type = 'text'
    toggle.classList.replace('ph-eye-slash', 'ph-eye')
  } else {
    senha.type = 'password'
    toggle.classList.replace('ph-eye', 'ph-eye-slash')
  }
})

if (emailInput) {
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === ' ') e.preventDefault()
  })
  emailInput.addEventListener('blur', () => {
    const valor = emailInput.value.trim()
    if (valor === '') return
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    if (!valido) marcarErro(emailInput, 'inválido')
    else limparErroCampo(emailInput)
  })
}

if (senha) {
  senha.addEventListener('blur', () => {
    if (senha.value.trim() === '') return
    limparErroCampo(senha)
  })
}

function marcarErro(input, mensagem) {
  const formGroup = input.closest('.form-group')
  const wrapper = formGroup.querySelector('.input-wrapper')
  const label = formGroup.querySelector('label')

  label.querySelectorAll('span').forEach(s => s.remove())
  if (!label.dataset.original) label.dataset.original = label.textContent.trim()

  wrapper.style.borderColor = '#ef4444'
  label.insertAdjacentHTML('beforeend', ` <span style="color:#ef4444; font-weight:600;">${mensagem}</span>`)
}

function limparErroCampo(input) {
  const formGroup = input.closest('.form-group')
  const wrapper = formGroup.querySelector('.input-wrapper')
  const label = formGroup.querySelector('label')

  wrapper.style.borderColor = ''
  label.querySelectorAll('span').forEach(s => s.remove())
  if (label.dataset.original) {
    label.textContent = label.dataset.original
    delete label.dataset.original
  }
}

function limparErros() {
  document.querySelectorAll('.form-group').forEach(group => {
    const wrapper = group.querySelector('.input-wrapper')
    const label = group.querySelector('label')
    if (wrapper) wrapper.style.borderColor = ''
    if (label) {
      label.querySelectorAll('span').forEach(s => s.remove())
      if (label.dataset.original) {
        label.textContent = label.dataset.original
        delete label.dataset.original
      }
    }
  })
}

const btnLogin = document.querySelector('.btn-login')
if (btnLogin) {
  btnLogin.addEventListener('click', async (event) => {
    event.preventDefault()
    limparErros()

    const email = emailInput?.value.trim() ?? ''
    const senhaValor = senha?.value.trim() ?? ''
    let temErro = false

    if (!email) { marcarErro(emailInput, 'obrigatório'); temErro = true }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { marcarErro(emailInput, 'inválido'); temErro = true }

    if (!senhaValor) { marcarErro(senha, 'obrigatória'); temErro = true }

    if (temErro) return

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: senhaValor })
      })

      const data = await response.json()

      if (!response.ok) {
        const msg = data.message || data.detail || 'credenciais inválidas'
        const msgLower = msg.toLowerCase()
        if (msgLower.includes('email') || msgLower.includes('usuário') || msgLower.includes('usuario') || msgLower.includes('encontrado')) {
          marcarErro(emailInput, msg)
        } else {
          marcarErro(senha, msg)
        }
        return
      }

      window.location.href = data.redirect
    } catch (error) {
      console.error(error)
      marcarErro(emailInput, 'erro de conexão')
    }
  })
}