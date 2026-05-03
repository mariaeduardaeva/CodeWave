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