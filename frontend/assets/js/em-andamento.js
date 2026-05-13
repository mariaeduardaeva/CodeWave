document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('cursosCarousel');
  const nextBtn  = document.getElementById('carouselNext');

  if (carousel && nextBtn) {
    const CARD_WIDTH = 380 + 16;
    const originalCards = Array.from(carousel.querySelectorAll('.curso-card'));

    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });

    let position = 0;
    const totalWidth = originalCards.length * CARD_WIDTH;

    nextBtn.addEventListener('click', () => {
      position += CARD_WIDTH;
      carousel.scrollTo({ left: position, behavior: 'smooth' });

      if (position >= totalWidth) {
        setTimeout(() => {
          carousel.style.scrollBehavior = 'auto';
          position = 0;
          carousel.scrollLeft = 0;
          setTimeout(() => {
            carousel.style.scrollBehavior = 'smooth';
          }, 50);
        }, 400);
      }
    });
  }

  const filtros = document.querySelectorAll('.filtro[data-filter]');
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      const allCards = carousel.querySelectorAll('.curso-card');
      allCards.forEach(card => {
        if (card.dataset.clone) card.remove();
        else {
          const match = filter === 'todos' || card.dataset.categoria === filter;
          card.style.display = match ? 'flex' : 'none';
        }
      });

      const visibleCards = Array.from(carousel.querySelectorAll('.curso-card:not([data-clone])'))
        .filter(c => c.style.display !== 'none');
      visibleCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = 'true';
        carousel.appendChild(clone);
      });

      position = 0;
      carousel.scrollLeft = 0;
    });
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-btn');
    if (!btn) return;
    const card = btn.closest('.curso-card');
    if (!card || card.dataset.clone) return;
    const cursoId = card.dataset.curso;
    if (cursoId) {
      window.location.href = 'clicarcurso.html?curso=' + cursoId + '&origem=em-andamento';
    }
  });
});