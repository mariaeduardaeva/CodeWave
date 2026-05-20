from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import os


# CONFIGURAÇÃO DA API


app = FastAPI()

# liberar acesso do frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# CARREGAR MODELO


base_dir = os.path.dirname(__file__)

model_path = os.path.join(
    base_dir,
    "..",
    "model",
    "modelo.pkl"
)

with open(model_path, "rb") as f:
    model = pickle.load(f)


# MODELO DE DADOS


class Cliente(BaseModel):
    idade: int
    tempo_navegacao: int
    preco_curso: int
    categoria: int
    nivel_interesse: int
    visualizacoes: int
    ja_comprou_antes: int


# FUNÇÕES AUXILIARES


def calcular_desconto(probabilidade):

    if probabilidade < 0.3:
        return 30

    elif probabilidade < 0.7:
        return 15

    return 5


def definir_perfil(cliente):

    if cliente.tempo_navegacao > 40:
        return "explorador"

    elif cliente.preco_curso > 200:
        return "premium"

    return "econômico"


# ROTA PRINCIPAL


@app.get("/")
def home():

    return {
        "mensagem": "API de previsão funcionando"
    }


# PREDIÇÃO COM IA


@app.post("/predict")
def predict(cliente: Cliente):

    dados = pd.DataFrame([{
        "idade": cliente.idade,
        "tempo_navegacao": cliente.tempo_navegacao,
        "preco_curso": cliente.preco_curso,
        "categoria": cliente.categoria,
        "nivel_interesse": cliente.nivel_interesse,
        "visualizacoes": cliente.visualizacoes,
        "ja_comprou_antes": cliente.ja_comprou_antes
    }])

    # probabilidade de compra
    probabilidade = model.predict_proba(dados)[0][1]

    # lógica de negócio
    desconto = calcular_desconto(probabilidade)

    perfil = definir_perfil(cliente)

    return {
        "metodo": "machine_learning",
        "probabilidade_compra": round(float(probabilidade), 2),
        "desconto": desconto,
        "perfil": perfil
    }


# PREDIÇÃO POR REGRA FIXA


@app.post("/predict-rule")
def predict_rule(cliente: Cliente):

    compra = (
        cliente.tempo_navegacao > 20 and
        cliente.nivel_interesse > 5 and
        cliente.preco_curso < 200
    )

    return {
        "metodo": "regra_fixa",
        "compraria": compra
    }


# CLUSTER / PERFILAGEM


@app.post("/cluster")
def cluster(cliente: Cliente):

    perfil = definir_perfil(cliente)

    return {
        "cluster": perfil
    }


# PREVISÃO DE NOVA COMPRA


@app.post("/forecast")
def forecast(cliente: Cliente):

    if cliente.ja_comprou_antes:
        previsao = "7 dias"

    elif cliente.nivel_interesse > 7:
        previsao = "15 dias"

    else:
        previsao = "30 dias"

    return {
        "proxima_compra_estimada": previsao
    }


# INFORMAÇÕES DO MODELO

@app.get("/model-info")
def model_info():

    return {
        "modelo": "LogisticRegression",
        "objetivo": "Prever compra de cursos",

        "features": [
            "idade",
            "tempo_navegacao",
            "preco_curso",
            "categoria",
            "nivel_interesse",
            "visualizacoes",
            "ja_comprou_antes"
        ],

        "endpoints": [
            "/predict",
            "/predict-rule",
            "/cluster",
            "/forecast"
        ]
    }