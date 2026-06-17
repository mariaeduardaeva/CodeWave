function abrirModal(titulo, campos) {
  document.getElementById("ia-modal-titulo").textContent = titulo;
  const body = document.getElementById("ia-modal-body");
  body.innerHTML = "";
  campos.forEach(({ label, valor }) => {
    const row = document.createElement("div");
    row.className = "ia-modal-row";
    row.innerHTML = `<span>${label}</span><span>${valor}</span>`;
    body.appendChild(row);
  });
  document.getElementById("ia-modal").classList.add("open");
}

function fecharModal() {
  document.getElementById("ia-modal").classList.remove("open");
}

document.getElementById("ia-modal").addEventListener("click", function (e) {
  if (e.target === this) fecharModal();
});

document.addEventListener('DOMContentLoaded', async () => {


  // Função para testar a API de previsão de compra
  // Pode-se ajustar os dados de entrada conforme necessário para testar diferentes cenários
  // LEMBRA DE BAIXAR OS REQUISITOS DA API ANTES DE RODAR ESTA FUNÇÃO TBM
  // LEMBRE DE RODAR O SERVIDOR DA API ANTES DE TESTAR ESTA FUNÇÃO!!!
  // comando para rodar a API:
  // cd backend
  // py -m uvicorn app.prediction_api:app --reload

  window.preverCompra = async function () {
    const dados = obterDadosFormulario();
    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      const resultado = await response.json();
      abrirModal("Predict", [
        { label: "Probabilidade de compra", valor: `${Math.round(resultado.probabilidade_compra * 100)}%` },
        { label: "Desconto", valor: resultado.desconto + "%" },
        { label: "Perfil", valor: resultado.perfil }
      ]);
    } catch (error) {
      console.error(error);
      abrirModal("Erro", [{ label: "Mensagem", valor: "Erro ao conectar com a API." }]);
    }
  };

  window.testarPredictRule = async function () {
    const dados = obterDadosFormulario();
    try {
      const response = await fetch("http://127.0.0.1:8000/predict-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      const resultado = await response.json();
      abrirModal("Predict Rule", [
        { label: "Método", valor: resultado.metodo },
        { label: "Compraria", valor: resultado.compraria }
      ]);
    } catch (error) {
      console.error(error);
      abrirModal("Erro", [{ label: "Mensagem", valor: "Erro ao conectar com a API." }]);
    }
  };

  window.testarCluster = async function () {
    const dados = obterDadosFormulario();
    try {
      const response = await fetch("http://127.0.0.1:8000/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      const resultado = await response.json();
      abrirModal("Cluster", [
        { label: "Cluster", valor: resultado.cluster }
      ]);
    } catch (error) {
      console.error(error);
      abrirModal("Erro", [{ label: "Mensagem", valor: "Erro ao conectar com a API." }]);
    }
  };

  window.testarForecast = async function () {
    const dados = obterDadosFormulario();
    try {
      const response = await fetch("http://127.0.0.1:8000/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      const resultado = await response.json();
      abrirModal("Forecast", [
        { label: "Próxima compra estimada", valor: resultado.proxima_compra_estimada }
      ]);
    } catch (error) {
      console.error(error);
      abrirModal("Erro", [{ label: "Mensagem", valor: "Erro ao conectar com a API." }]);
    }
  };

  window.testarModelInfo = async function () {
    try {
      const response = await fetch("http://127.0.0.1:8000/model-info");
      const resultado = await response.json();
      abrirModal("Model Info", [
        { label: "Modelo", valor: resultado.modelo },
        { label: "Objetivo", valor: resultado.objetivo }
      ]);
    } catch (error) {
      console.error(error);
      abrirModal("Erro", [{ label: "Mensagem", valor: "Erro ao conectar com a API." }]);
    }
  };

});

function obterDadosFormulario() {
  return {
    idade: Number(document.getElementById("idade").value),
    tempo_navegacao: Number(document.getElementById("tempo_navegacao").value),
    preco_curso: Number(document.getElementById("preco_curso").value),
    categoria: Number(document.getElementById("categoria").value),
    nivel_interesse: Number(document.getElementById("nivel_interesse").value),
    visualizacoes: Number(document.getElementById("visualizacoes").value),
    ja_comprou_antes: Number(document.getElementById("ja_comprou_antes").value)
  };
}

function limparFiltros() {
  document.getElementById("idade").value = "";
  document.getElementById("tempo_navegacao").value = "";
  document.getElementById("preco_curso").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("nivel_interesse").value = "";
  document.getElementById("visualizacoes").value = "";
  document.getElementById("ja_comprou_antes").value = "";
}