const toggleSenha = document.getElementById('toggleSenha')
const senha = document.getElementById('senha')
const toggleConfirmar = document.getElementById('toggleConfirmar')
const confirmarSenha = document.getElementById('confirmarSenha')

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

const nomeInput = document.querySelector('input[type="text"]')

if (nomeInput) {
  nomeInput.addEventListener('keypress', (e) => {
    if (/[0-9]/.test(e.key)) {
      e.preventDefault()
    }
  })
}

const emailInput = document.querySelector('input[type="email"]')

if (emailInput) {
  emailInput.addEventListener('keypress', (e) => {
    if (e.key === ' ') {
      e.preventDefault()
    }
  })

  emailInput.addEventListener('blur', () => {
    const valor = emailInput.value
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    const label = emailInput.closest('.form-group').querySelector('label')

    if (valor && !emailValido) {
      emailInput.closest('.input-wrapper').style.borderColor = '#ef4444'
      label.innerHTML = 'E-mail <span style="color: #ef4444; font-weight: 600;">inválido</span>'
    } else {
      emailInput.closest('.input-wrapper').style.borderColor = ''
      label.innerHTML = 'E-mail'
    }
  })
}

const dataInput = document.querySelector('input[placeholder="DD / MM / AAAA"]')

if (dataInput) {
  dataInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '')

    if (valor.length >= 2) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2)
    }
    if (valor.length >= 5) {
      valor = valor.slice(0, 5) + '/' + valor.slice(5)
    }

    e.target.value = valor.slice(0, 10)
  })

  dataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      const valor = dataInput.value
      if (valor.endsWith('/')) {
        dataInput.value = valor.slice(0, -1)
        e.preventDefault()
      }
    }
  })
}

const paisSelect = document.getElementById('pais')

if (paisSelect) {
  paisSelect.addEventListener('change', () => {
    paisSelect.classList.add('selecionado')
  })
}

const btnCadastro = document.querySelector('.btn-login')

if (btnCadastro) {
  btnCadastro.addEventListener('click', async (event) => {
    event.preventDefault()

    const nome = nomeInput ? nomeInput.value.trim() : ''
    const email = emailInput ? emailInput.value.trim() : ''
    const senhaValor = senha ? senha.value.trim() : ''
    const confirmarValor = confirmarSenha ? confirmarSenha.value.trim() : ''
    const dataNascimento = dataInput ? dataInput.value.trim() : ''
    const pais = paisSelect ? paisSelect.value : ''
    const termosCheckbox = document.getElementById('termos')
    const termos = termosCheckbox ? termosCheckbox.checked : false

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
          senha: senhaValor,
          data_nascimento: dataNascimento,
          pais: pais
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Não foi possível realizar o cadastro')
        return
      }

      window.location.href = 'login.html'
    } catch (error) {
      console.error(error)
      alert('Não foi possível realizar o cadastro')
    }
  })
}