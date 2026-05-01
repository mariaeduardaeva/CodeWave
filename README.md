# CodeWave

> E-commerce de cursos com IA integrada — Projeto A3 · Inteligência Artificial · UNP 2026.1

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-F7931E?style=flat&logo=scikit-learn&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

O **CodeWave** é uma plataforma de e-commerce de cursos online com IA integrada, capaz de prever o comportamento de compra dos usuários, segmentá-los em perfis e recomendar cursos personalizados em tempo real. O projeto simula como empresas reais utilizam Machine Learning para tomar decisões inteligentes de negócio.

---

## Funcionalidades

- Previsão de comportamento de compra com ML
- Segmentação de usuários em perfis de aluno (clustering)
- Recomendação personalizada de cursos em tempo real
- Comparação entre modelo de ML e regra fixa
- Previsão de quando o usuário vai comprar novamente

---

## Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/predict` | POST | Prevê se o usuário vai comprar um curso |
| `/predict-rule` | POST | Mesma previsão usando regra fixa (comparação) |
| `/cluster` | POST | Segmenta o usuário em perfis de aluno |
| `/forecast` | POST | Prevê quando o usuário vai comprar novamente |
| `/model-info` | GET | Retorna métricas e informações do modelo |

---

## Como Executar

**1. Clone o repositório**

```bash
git clone https://github.com/mariaeduardaeva/CodeWave.git
cd CodeWave
```

**2. Instale as dependências**

```bash
pip install -r backend/requirements.txt
```

**3. Treine o modelo**

```bash
python backend/train.py
```

**4. Inicie a API**

```bash
uvicorn backend.app:app --reload
```

**5. Abra o frontend**

Abra o arquivo `frontend/index.html` no navegador.

---

## Tecnologias Utilizadas

**Backend**
- Python 3 - linguagem principal
- FastAPI - framework da API REST
- Scikit-learn - modelos de ML (classificação, clustering, regressão)
- Pandas / NumPy - processamento de dados
- Uvicorn - servidor ASGI

**Frontend**
- HTML5, CSS3 e JavaScript - interface do usuário

---

## Equipe

| Nome | GitHub |
|------|--------|
| Maria Eduarda Evangelista de Carvalho | [@mariaeduardaeva](https://github.com/mariaeduardaeva) |
| João Paulo Higino Ferreira | [@Joao-PauloHF](https://github.com/Joao-PauloHF) |
| Gabriela Maria Espíndola Galindo | [@enjoygabs](https://github.com/enjoygabs?tab=followers) |
| Mateus Emanoel Soares Montenegro | [@Belga64](https://github.com/Belga64) |

---

## Informações Acadêmicas

- **Disciplina:** Inteligência Artificial
- **Instituição:** Universidade Potiguar (UNP)
- **Semestre:** 2026.1

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.
