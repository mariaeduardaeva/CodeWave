document.addEventListener('DOMContentLoaded', () => {
  const filtros = document.querySelectorAll('.filtro[data-filter]');
  const cards = Array.from(document.querySelectorAll('.cert-card'));
  const porPagina = 6;
  let paginaAtual = 1;
  let filtroAtivo = 'todos';

  function cardsVisiveis() {
    return cards.filter(card =>
      filtroAtivo === 'todos' || card.dataset.categoria === filtroAtivo
    );
  }

  function renderPaginacao(visiveis) {
    const totalPaginas = Math.ceil(visiveis.length / porPagina);
    const paginacao = document.querySelector('.paginacao');
    const prevBtn = paginacao.querySelector('.pag-btn:first-child');
    const nextBtn = paginacao.querySelector('.pag-btn:last-child');
    paginacao.querySelectorAll('.pag-num').forEach(n => n.remove());
    for (let i = 1; i <= totalPaginas; i++) {
      const num = document.createElement('span');
      num.classList.add('pag-num');
      if (i === paginaAtual) num.classList.add('active');
      num.textContent = i;
      num.addEventListener('click', () => {
        paginaAtual = i;
        renderCards(cardsVisiveis());
        renderPaginacao(cardsVisiveis());
      });
      paginacao.insertBefore(num, nextBtn);
    }
  }

  function renderCards(visiveis) {
    cards.forEach(c => c.style.display = 'none');
    const inicio = (paginaAtual - 1) * porPagina;
    visiveis.slice(inicio, inicio + porPagina).forEach(c => c.style.display = 'flex');
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      filtroAtivo = btn.dataset.filter;
      paginaAtual = 1;
      renderCards(cardsVisiveis());
      renderPaginacao(cardsVisiveis());
    });
  });

  renderCards(cardsVisiveis());
  renderPaginacao(cardsVisiveis());
})

document.querySelector('.baixar-card').addEventListener('click', async () => {
  const links = document.querySelectorAll('.cert-link')
  const zip = new JSZip()
  const icon = document.querySelector('.baixar-icon')
  const titulo = document.querySelector('.baixar-card h3')

  icon.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite"></i>'
  titulo.textContent = 'Gerando certificados...'

  for (const link of links) {
    const card = link.closest('.cert-card')
    const nome = card.querySelector('h3').textContent.replace(/\n/g, ' ').trim()
    const data = card.querySelector('.cert-date').textContent.replace('Concluído em ', '')
    const categoria = card.dataset.categoria

    const { jsPDF } = window.jspdf
    const doc = new jsPDF('landscape', 'mm', 'a4')

    doc.setFillColor(1, 71, 169)
    doc.rect(0, 0, 297, 210, 'F')
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1.5)
    doc.rect(10, 10, 277, 190)
    doc.setLineWidth(0.5)
    doc.rect(13, 13, 271, 184)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('<~> CodeWave', 148.5, 35, { align: 'center' })
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(60, 42, 237, 42)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 55, { align: 'center' })
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('Certificamos que', 148.5, 75, { align: 'center' })
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 220, 100)
    doc.text('Maria Eduarda Evangelista de Carvalho', 148.5, 95, { align: 'center' })
    doc.setDrawColor(255, 220, 100)
    doc.setLineWidth(0.8)
    doc.line(60, 100, 237, 100)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text('concluiu com êxito o curso', 148.5, 115, { align: 'center' })
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(nome, 148.5, 132, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text(`Categoria: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`, 148.5, 145, { align: 'center' })
    doc.text(`Data de conclusão: ${data}`, 148.5, 155, { align: 'center' })
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(60, 165, 237, 165)
    doc.setFontSize(10)
    doc.setTextColor(150, 180, 220)
    doc.text('CodeWave - Plataforma de Cursos Online | www.codewave.com.br', 148.5, 178, { align: 'center' })

    const pdfBlob = doc.output('blob')
    zip.file(`Certificado - ${nome}.pdf`, pdfBlob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Certificados CodeWave.zip'
  a.click()
  URL.revokeObjectURL(url)

  icon.innerHTML = '<i class="ph ph-check" style="color: #03743c"></i>'
  titulo.textContent = 'Download concluído!'
  setTimeout(() => {
    icon.innerHTML = '<i class="ph ph-download-simple"></i>'
    titulo.textContent = 'Baixar todos os certificados'
  }, 3000)
})

document.querySelectorAll('.cert-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const card = link.closest('.cert-card')
    const nome = card.querySelector('h3').textContent.replace(/\n/g, ' ').trim()
    const data = card.querySelector('.cert-date').textContent.replace('Concluído em ', '')
    const categoria = card.dataset.categoria

    const { jsPDF } = window.jspdf
    const doc = new jsPDF('landscape', 'mm', 'a4')

    doc.setFillColor(1, 71, 169)
    doc.rect(0, 0, 297, 210, 'F')

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1.5)
    doc.rect(10, 10, 277, 190)

    doc.setLineWidth(0.5)
    doc.rect(13, 13, 271, 184)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('<~> CodeWave', 148.5, 35, { align: 'center' })

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(60, 42, 237, 42)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text('CERTIFICADO DE CONCLUSÃO', 148.5, 55, { align: 'center' })

    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('Certificamos que', 148.5, 75, { align: 'center' })

    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 220, 100)
    doc.text('Maria Eduarda Evangelista de Carvalho', 148.5, 95, { align: 'center' })

    doc.setDrawColor(255, 220, 100)
    doc.setLineWidth(0.8)
    doc.line(60, 100, 237, 100)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text('concluiu com êxito o curso', 148.5, 115, { align: 'center' })

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(nome, 148.5, 132, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 220, 255)
    doc.text(`Categoria: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`, 148.5, 145, { align: 'center' })

    doc.text(`Data de conclusão: ${data}`, 148.5, 155, { align: 'center' })

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(60, 165, 237, 165)

    doc.setFontSize(10)
    doc.setTextColor(150, 180, 220)
    doc.text('CodeWave - Plataforma de Cursos Online | www.codewave.com.br', 148.5, 178, { align: 'center' })

    doc.save(`Certificado - ${nome}.pdf`)
  })
})