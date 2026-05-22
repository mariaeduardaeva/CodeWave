from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "..", "frontend")
DATABASE = os.path.join(BASE_DIR, "users.db")

app = Flask(__name__)

app.secret_key = "codewave_secret_key"
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

CORS(
    app,
    supports_credentials=True,
    origins=["http://127.0.0.1:5000", "http://localhost:5000"]
)

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            data_nascimento TEXT,
            pais TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matriculas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            curso_id TEXT NOT NULL,
            progresso INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, curso_id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_input(*names):
    data = request.get_json(silent=True)
    for name in names:
        value = None
        if request.form:
            value = request.form.get(name)
        if not value and data:
            value = data.get(name)
        if value and str(value).strip():
            return str(value).strip()
    return ""

@app.route("/")
def home():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({"message": "Frontend build not found"}), 404

@app.route("/register", methods=["POST"])
def register():
    name = get_input("name", "nome", "username", "registerName", "nomeUser")
    email = get_input("email", "registerEmail", "emailUser", "loginEmail")
    password = get_input("password", "senha", "registerPassword", "loginSenha")
    data_nascimento = get_input("data_nascimento")
    pais = get_input("pais")

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    existing_user = cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({"success": False, "message": "E-mail já cadastrado"}), 400

    hashed_password = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (name, email, password, data_nascimento, pais) VALUES (?, ?, ?, ?, ?)",
        (name, email, hashed_password, data_nascimento, pais)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Cadastro realizado com sucesso", "redirect": "/pages/dashboard.html"})

@app.route("/login", methods=["POST"])
def login():
    email = get_input("email", "loginEmail", "emailUser")
    password = get_input("password", "senha", "loginSenha")

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "não encontrado"}), 401

    user_id, user_name, user_email, user_password = user[0], user[1], user[2], user[3]

    if not check_password_hash(user_password, password):
        return jsonify({"success": False, "message": "incorreta"}), 401

    session["user_id"] = user_id
    session["user_name"] = user_name
    session["user_email"] = user_email

    return jsonify({"success": True, "message": "Login realizado com sucesso", "redirect": "/pages/dashboard.html"})

@app.route("/session-user")
def session_user():
    if "user_id" not in session:
        return jsonify({"logged": False})
    return jsonify({
        "logged": True,
        "user": {
            "id": session["user_id"],
            "name": session["user_name"],
            "email": session["user_email"]
        }
    })

@app.route("/logout")
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/minhas-matriculas")
def minhas_matriculas():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT curso_id, progresso FROM matriculas WHERE user_id = ?",
        (session["user_id"],)
    )
    rows = cursor.fetchall()
    conn.close()

    matriculas = {row[0]: row[1] for row in rows}
    return jsonify({"success": True, "matriculas": matriculas})

@app.route("/comprar", methods=["POST"])
def comprar():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    data = request.get_json(silent=True)
    curso_id = data.get("curso_id") if data else None

    if not curso_id:
        return jsonify({"success": False, "message": "curso_id obrigatório"}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO matriculas (user_id, curso_id, progresso) VALUES (?, ?, 0)",
        (session["user_id"], curso_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Matrícula realizada com sucesso"})

@app.route("/progresso", methods=["POST"])
def atualizar_progresso():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    data = request.get_json(silent=True)
    curso_id = data.get("curso_id") if data else None
    progresso = data.get("progresso") if data else None

    if not curso_id or progresso is None:
        return jsonify({"success": False, "message": "curso_id e progresso obrigatórios"}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE matriculas SET progresso = ? WHERE user_id = ? AND curso_id = ?",
        (progresso, session["user_id"], curso_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/<path:path>")
def static_files(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)