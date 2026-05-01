# CodeWave
### Projeto A3 - Inteligência Artificial (UNP)

O CodeWave é uma aplicação web desenvolvida como projeto acadêmico (A3) 
para a disciplina de Inteligência Artificial da UNP. A plataforma é um 
e-commerce de cursos online com IA integrada, capaz de prever o comportamento 
de compra dos usuários, segmentá-los em perfis e recomendar cursos 
personalizados em tempo real.

O projeto une conhecimentos de Machine Learning com uma aplicação prática de 
negócio, simulando como empresas reais utilizam IA para tomar decisões 
inteligentes.

---

## Tecnologias Utilizadas

**Backend:**
- Python 3
- FastAPI
- Scikit-learn
- Pandas / NumPy
- Uvicorn

**Frontend:**
- HTML5, CSS3 e JavaScript

---

## Funcionalidades da API

| Endpoint | Descrição |
|---|---|
| `/predict` | Prevê se o usuário vai comprar um curso |
| `/predict-rule` | Mesma previsão usando regra fixa (comparação) |
| `/cluster` | Segmenta o usuário em perfis de aluno |
| `/forecast` | Prevê quando o usuário vai comprar novamente |
| `/model-info` | Retorna métricas e informações do modelo |

---

## Como Executar

1. Clone o repositório:
```bash
   git clone https://github.com/mariaeduardaeva/CodeWave.git
```

2. Instale as dependências:
```bash
   pip install -r backend/requirements.txt
```

3. Treine o modelo:
```bash
   python backend/train.py
```

4. Inicie a API:
```bash
   uvicorn backend.app:app --reload
```

5. Abra o `frontend/index.html` no navegador

---

## Integrantes

- Maria Eduarda Evangelista de Carvalho
- João Paulo Higino Ferreira
- Gabriela Maria Espíndola Galindo
- Mateus Emanoel Soares Montenegro

---

## Informações Acadêmicas

**Disciplina:** Inteligência Artificial
**Instituição:** Universidade Potiguar (UNP)
**Semestre:** 2026.1
