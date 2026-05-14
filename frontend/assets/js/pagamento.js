const options = document.querySelectorAll('.payment-option');
const cardForm = document.getElementById('card-form');
const pixForm = document.getElementById('pix-form');
const boletoForm = document.getElementById('boleto-form');
const discountVal = document.getElementById('discount-val');
const totalVal = document.getElementById('total-val');

document.getElementById('p-card').checked = false;
cardForm.style.display = 'none';
document.querySelector('.payment-option').classList.remove('selected');

options.forEach(option => {
  option.addEventListener('click', () => {
    options.forEach(o => {
      o.classList.remove('selected', 'pix-selected', 'boleto-selected');
    });
    option.classList.add('selected');

    const radio = option.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    const radioId = radio ? radio.id : '';

    cardForm.style.display = 'none';
    pixForm.style.display = 'none';
    boletoForm.style.display = 'none';

    if (radioId === 'p-card') {
      cardForm.style.display = 'flex';
      discountVal.textContent = '-R$ 0,00';
      totalVal.textContent = 'R$ 79,99';
    } else if (radioId === 'p-pix') {
      option.classList.add('pix-selected');
      pixForm.style.display = 'block';
      discountVal.textContent = '-R$ 4,00';
      totalVal.textContent = 'R$ 75,99';
    } else if (radioId === 'p-boleto') {
      option.classList.add('boleto-selected');
      boletoForm.style.display = 'block';
      discountVal.textContent = '-R$ 0,00';
      totalVal.textContent = 'R$ 79,99';
    }
  });
});

document.getElementById('card-number').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
});

document.getElementById('card-expiry').addEventListener('input', function(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v;
});

document.getElementById('card-cvv').addEventListener('input', function(e) {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

document.getElementById('card-name').addEventListener('input', function(e) {
  e.target.value = e.target.value.replace(/[0-9]/g, '').toUpperCase();
});

document.getElementById('pix-copy').addEventListener('click', function() {
  const code = document.getElementById('pix-code').textContent;
  navigator.clipboard.writeText(code);
  this.textContent = 'Copiado!';
  setTimeout(() => this.textContent = 'Copiar', 2000);
});

document.getElementById('boleto-copy').addEventListener('click', function() {
  const code = document.getElementById('boleto-code').textContent;
  navigator.clipboard.writeText(code);
  this.textContent = 'Copiado!';
  setTimeout(() => this.textContent = 'Copiar', 2000);
});

function validarCartao(numero) {
  const digits = numero.replace(/\s/g, '');
  if (digits.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

document.getElementById('btn-finalizar').addEventListener('click', function() {
  const metodoSelecionado = document.querySelector('.payment-option.selected');

  if (!metodoSelecionado) {
    options.forEach(o => o.classList.add('opcao-invalida'));
    setTimeout(() => options.forEach(o => o.classList.remove('opcao-invalida')), 2000);
    return;
  }

  const radio = metodoSelecionado.querySelector('input[type="radio"]');
  const radioId = radio ? radio.id : '';

  if (radioId === 'p-card') {
    const numero = document.getElementById('card-number').value.replace(/\s/g, '');
    const validade = document.getElementById('card-expiry').value;
    const cvv = document.getElementById('card-cvv').value;
    const nome = document.getElementById('card-name').value.trim();

    let invalido = false;

    if (!validarCartao(numero)) {
      document.getElementById('card-number').classList.add('input-invalido');
      invalido = true;
    }
    if (validade.length < 5) {
      document.getElementById('card-expiry').classList.add('input-invalido');
      invalido = true;
    }
    if (cvv.length < 3) {
      document.getElementById('card-cvv').classList.add('input-invalido');
      invalido = true;
    }
    if (nome === '') {
      document.getElementById('card-name').classList.add('input-invalido');
      invalido = true;
    }

    if (invalido) {
      setTimeout(() => document.querySelectorAll('.input-invalido').forEach(i => i.classList.remove('input-invalido')), 2000);
      return;
    }
  }

  this.textContent = 'Processando...';
  this.disabled = true;
  setTimeout(() => {
    this.innerHTML = `<i class="ph-bold ph-check"></i> Pagamento confirmado!`;
    this.style.background = '#358E62';
  }, 2000);
});