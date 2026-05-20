from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import pandas as pd
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# carregar modelo
base_dir = os.path.dirname(__file__)
model_path = os.path.join(base_dir, "..", "model", "modelo.pkl")

with open(model_path, "rb") as f:
    model = pickle.load(f)

# estrutura esperada da requisição
class Cliente(BaseModel):
    idade: int
    tempo_navegacao: int
    preco_curso: int
    categoria: int
    nivel_interesse: int
    visualizacoes: int
    ja_comprou_antes: int

@app.get("/")
def home():
    return {"mensagem": "API funcionando"}

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

    # previsão
    probabilidade = model.predict_proba(dados)[0][1]

    # lógica de desconto
    if probabilidade < 0.3:
        desconto = 30
    elif probabilidade < 0.7:
        desconto = 15
    else:
        desconto = 5

    # perfilagem simples
    if cliente.tempo_navegacao > 40:
        perfil = "explorador"
    elif cliente.preco_curso > 200:
        perfil = "premium"
    else:
        perfil = "econômico"

    return {
        "probabilidade_compra": round(float(probabilidade), 2),
        "desconto": desconto,
        "perfil": perfil
    }