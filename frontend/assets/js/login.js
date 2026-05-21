const toggle = document.getElementById('toggleSenha')
const senha = document.getElementById('senha')

toggle.addEventListener('click', () => {
  if (senha.type === 'password') {
    senha.type = 'text'
    toggle.classList.replace('ph-eye-slash', 'ph-eye')
  } else {
    senha.type = 'password'
    toggle.classList.replace('ph-eye', 'ph-eye-slash')
  }
})

const btnLogin = document.querySelector('.btn-login')

if (btnLogin) {
  btnLogin.addEventListener('click', async (event) => {
    event.preventDefault()

    const emailInput = document.querySelector('input[type="email"]')
    const email = emailInput ? emailInput.value.trim() : ''
    const senhaValor = senha.value.trim()

    if (!email || !senhaValor) {
      alert('Preencha todos os campos.')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          senha: senhaValor
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || data.detail || 'Erro no login')
        return
      }

      window.location.href = 'dashboard.html'
    } catch (error) {
      console.error(error)
      alert('Erro ao conectar com o servidor.')
    }
  })
}