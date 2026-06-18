import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pickle

# Definir os caminhos do dataset e do modelo
base_dir = os.path.dirname(__file__)
data_path = os.path.join(base_dir, "..", "data", "dataset.csv")
model_path = os.path.join(base_dir, "modelo.pkl")


data = pd.read_csv(data_path)

# separar features e target
X = data.drop("comprou", axis=1)
y = data["comprou"]

# dividir em treino e teste
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

# avaliar modelo 
accuracy = model.score(X_test, y_test)
print(f"Acurácia do modelo: {accuracy:.2f}")


with open(model_path, "wb") as f:
    pickle.dump(model, f)

print(f"Modelo salvo em: {model_path}")