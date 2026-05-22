const toggleSenha = document.getElementById('toggleSenha')
const senha = document.getElementById('senha')
const toggleConfirmar = document.getElementById('toggleConfirmar')
const confirmarSenha = document.getElementById('confirmarSenha')
const nomeInput = document.querySelector('input[type="text"]')
const emailInput = document.querySelector('input[type="email"]')
const dataInput = document.querySelector('input[placeholder="DD / MM / AAAA"]')
const paisSelect = document.getElementById('pais')

toggleSenha.addEventListener('click', () => {
  if (senha.type === 'password') {
    senha.type = 'text'
    toggleSenha.classList.replace('ph-eye-slash', 'ph-eye')
  } else {
    senha.type = 'password'
    toggleSenha.classList.replace('ph-eye', 'ph-eye-slash')
  }
})

toggleConfirmar.addEventListener('click', () => {
  if (confirmarSenha.type === 'password') {
    confirmarSenha.type = 'text'
    toggleConfirmar.classList.replace('ph-eye-slash', 'ph-eye')
  } else {
    confirmarSenha.type = 'password'
    toggleConfirmar.classList.replace('ph-eye', 'ph-eye-slash')
  }
})

if (nomeInput) {
  nomeInput.addEventListener('keypress', (e) => {
    if (/[0-9]/.test(e.key)) e.preventDefault()
  })
  nomeInput.addEventListener('blur', () => {
    if (nomeInput.value.trim() !== '') limparErroCampo(nomeInput)
  })
}

if (emailInput) {
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === ' ') e.preventDefault()
  })
  emailInput.addEventListener('blur', () => {
    validarEmailVisual()
  })
}

if (senha) {
  senha.addEventListener('focus', () => {
    document.getElementById('senhaForca').classList.add('visivel')
    document.getElementById('senhaRequisitos').classList.add('visivel')
  })
  senha.addEventListener('input', () => {
    atualizarForcaSenha(senha.value)
  })
  senha.addEventListener('blur', () => {
    const val = senha.value.trim()
    if (val === '') {
      document.getElementById('senhaForca').classList.remove('visivel')
      document.getElementById('senhaRequisitos').classList.remove('visivel')
      return
    }
    const erro = validarForcaSenha(val)
    if (erro) {
      marcarErro(senha, erro)
    } else {
      limparErroCampo(senha)
    }
  })
}

if (confirmarSenha) {
  confirmarSenha.addEventListener('blur', () => {
    const val = confirmarSenha.value.trim()
    if (val === '') return
    if (val !== senha.value.trim()) {
      marcarErro(confirmarSenha, 'senhas diferentes')
    } else {
      limparErroCampo(confirmarSenha)
    }
  })
}

if (dataInput) {
  dataInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '')
    if (valor.length >= 2) valor = valor.slice(0, 2) + '/' + valor.slice(2)
    if (valor.length >= 5) valor = valor.slice(0, 5) + '/' + valor.slice(5)
    e.target.value = valor.slice(0, 10)
  })
  dataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && dataInput.value.endsWith('/')) {
      dataInput.value = dataInput.value.slice(0, -1)
      e.preventDefault()
    }
  })
  dataInput.addEventListener('blur', () => {
    if (dataInput.value.trim() !== '') limparErroCampo(dataInput)
  })
}

if (paisSelect) {
  paisSelect.addEventListener('change', () => {
    paisSelect.classList.add('selecionado')
    limparErroCampo(paisSelect)
  })
}

function atualizarForcaSenha(val) {
  const temTamanho   = val.length >= 8
  const temMaiuscula = /[A-Z]/.test(val)
  const temNumero    = /[0-9]/.test(val)
  const temEspecial  = /[^a-zA-Z0-9]/.test(val)

  atualizarRequisito('req-tamanho',   temTamanho)
  atualizarRequisito('req-maiuscula', temMaiuscula)
  atualizarRequisito('req-numero',    temNumero)
  atualizarRequisito('req-especial',  temEspecial)

  const pontos = [temTamanho, temMaiuscula, temNumero, temEspecial].filter(Boolean).length
  const cor = pontos <= 1 ? '#ef4444' : pontos <= 2 ? '#f97316' : pontos <= 3 ? '#facc15' : '#16a34a'
  const label = pontos === 0 ? '' : pontos <= 1 ? 'Fraca' : pontos <= 2 ? 'Média' : pontos <= 3 ? 'Boa' : 'Forte'

  document.getElementById('barra1').style.background = pontos >= 1 ? cor : '#e0e0e0'
  document.getElementById('barra2').style.background = pontos >= 2 ? cor : '#e0e0e0'
  document.getElementById('barra3').style.background = pontos >= 3 ? cor : '#e0e0e0'
  document.getElementById('barra4').style.background = pontos >= 4 ? cor : '#e0e0e0'
  document.getElementById('forcaLabel').textContent = label
  document.getElementById('forcaLabel').style.color = pontos === 0 ? '#e0e0e0' : cor
}

function atualizarRequisito(id, ok) {
  const el = document.getElementById(id)
  const icon = el.querySelector('i')
  el.classList.toggle('ok', ok)
  el.classList.toggle('erro', !ok && senha.value.length > 0)
  icon.className = ok ? 'ph ph-bold ph-check-circle' : 'ph ph-bold ph-x-circle'
}

function validarEmailVisual() {
  const valor = emailInput.value
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
  const label = emailInput.closest('.form-group').querySelector('label')
  const wrapper = emailInput.closest('.input-wrapper')

  if (valor && !emailValido) {
    wrapper.style.borderColor = '#ef4444'
    label.querySelectorAll('span').forEach(s => s.remove())
    if (!label.dataset.original) label.dataset.original = label.textContent.trim()
    label.insertAdjacentHTML('beforeend', ' <span style="color:#ef4444; font-weight:600;">inválido</span>')
    return false
  } else {
    wrapper.style.borderColor = ''
    label.querySelectorAll('span').forEach(s => s.remove())
    if (label.dataset.original) {
      label.textContent = label.dataset.original
      delete label.dataset.original
    }
    return emailValido || valor === ''
  }
}

function validarForcaSenha(val) {
  if (val.length < 8)             return 'mínimo 8 caracteres'
  if (!/[A-Z]/.test(val))         return 'precisa de uma letra maiúscula'
  if (!/[0-9]/.test(val))         return 'precisa de um número'
  if (!/[^a-zA-Z0-9]/.test(val))  return 'precisa de um caractere especial'
  return null
}

function marcarErro(input, mensagem) {
  const formGroup = input.closest('.form-group')
  const wrapper = formGroup.querySelector('.input-wrapper')
  const label = formGroup.querySelector('label')

  label.querySelectorAll('span').forEach(s => s.remove())

  if (!label.dataset.original) {
    label.dataset.original = label.textContent.trim()
  }

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
  const termosLabel = document.querySelector('label[for="termos"]')
  if (termosLabel) termosLabel.style.color = ''
}

const btnCadastro = document.querySelector('.btn-login')
if (btnCadastro) {
  btnCadastro.addEventListener('click', async (event) => {
    event.preventDefault()
    limparErros()

    const nome           = nomeInput?.value.trim() ?? ''
    const email          = emailInput?.value.trim() ?? ''
    const senhaValor     = senha?.value.trim() ?? ''
    const confirmarValor = confirmarSenha?.value.trim() ?? ''
    const dataNascimento = dataInput?.value.trim() ?? ''
    const pais           = paisSelect?.value ?? ''
    const termos         = document.getElementById('termos')?.checked ?? false

    let temErro = false

    if (!nome) { marcarErro(nomeInput, 'obrigatório'); temErro = true }

    if (!email) { marcarErro(emailInput, 'obrigatório'); temErro = true }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { marcarErro(emailInput, 'inválido'); temErro = true }

    if (!senhaValor) { marcarErro(senha, 'obrigatória'); temErro = true }
    else {
      const erroSenha = validarForcaSenha(senhaValor)
      if (erroSenha) { marcarErro(senha, erroSenha); temErro = true }
    }

    if (!confirmarValor) { marcarErro(confirmarSenha, 'obrigatória'); temErro = true }
    else if (senhaValor !== confirmarValor) { marcarErro(confirmarSenha, 'senhas diferentes'); temErro = true }

    if (!dataNascimento) { marcarErro(dataInput, 'obrigatória'); temErro = true }
    if (!pais)           { marcarErro(paisSelect, 'obrigatório'); temErro = true }

    if (!termos) {
      const termosLabel = document.querySelector('label[for="termos"]')
      if (termosLabel) termosLabel.style.color = '#ef4444'
      temErro = true
    }

    if (temErro) return

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha: senhaValor,
          data_nascimento: dataNascimento,
          pais
        })
      })

      const data = await response.json()

      if (!response.ok) {
        marcarErro(emailInput, data.message ?? 'erro ao cadastrar')
        return
      }

      window.location.href = data.redirect
    } catch (error) {
      console.error(error)
      marcarErro(emailInput, 'erro de conexão')
    }
  })
}