const container = document.querySelector('.destaque-cards')
const nextBtn = document.querySelector('.destaque-next')
const cards = Array.from(document.querySelectorAll('.destaque-card'))
const cardWidth = 253 + 16

cards.forEach(card => {
  const clone = card.cloneNode(true)
  container.appendChild(clone)
})

let position = 0
const totalWidth = cards.length * cardWidth

nextBtn.addEventListener('click', () => {
  position += cardWidth

  container.scrollTo({
    left: position,
    behavior: 'smooth'
  })

  if (position >= totalWidth) {
    setTimeout(() => {
      container.style.scrollBehavior = 'auto'
      position = 0
      container.scrollLeft = 0
      setTimeout(() => {
        container.style.scrollBehavior = 'smooth'
      }, 50)
    }, 400)
  }
})