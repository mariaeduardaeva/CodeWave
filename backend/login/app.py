from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, date, timedelta

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "..", "frontend")
DATABASE     = os.path.join(BASE_DIR, "users.db")

app = Flask(__name__)
app.secret_key = "codewave_secret_key"
app.config.update(SESSION_COOKIE_SAMESITE="Lax", SESSION_COOKIE_SECURE=False)

CORS(app, supports_credentials=True,
     resources={r"/*": {"origins": "*"}})


def init_db():
    conn   = sqlite3.connect(DATABASE)
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
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS atividades_concluidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            atividade_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pendente',
            concluida_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, atividade_id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            login_date DATE NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, login_date)
        )
    """)

    try:
        cursor.execute("ALTER TABLE atividades_concluidas ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente'")
        conn.commit()
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()

init_db()


def registrar_login(user_id):
    """Salva a data de hoje no histórico de logins (ignora duplicatas)."""
    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO login_history (user_id, login_date) VALUES (?, ?)",
        (user_id, date.today().isoformat())
    )
    conn.commit()
    conn.close()


def calcular_sequencia(user_id):
    """Conta quantos dias consecutivos até hoje o usuário fez login."""
    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT login_date FROM login_history WHERE user_id = ? ORDER BY login_date DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return 0

    datas = [date.fromisoformat(r[0]) for r in rows]
    hoje  = date.today()

    if datas[0] < hoje - timedelta(days=1):
        return 0

    sequencia = 1
    for i in range(1, len(datas)):
        if datas[i - 1] - datas[i] == timedelta(days=1):
            sequencia += 1
        else:
            break

    return sequencia


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
    name            = get_input("name", "nome", "username", "registerName", "nomeUser")
    email           = get_input("email", "registerEmail", "emailUser", "loginEmail")
    password        = get_input("password", "senha", "registerPassword", "loginSenha")
    data_nascimento = get_input("data_nascimento")
    pais            = get_input("pais")

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "E-mail já cadastrado"}), 400

    cursor.execute(
        "INSERT INTO users (name, email, password, data_nascimento, pais) VALUES (?, ?, ?, ?, ?)",
        (name, email, generate_password_hash(password), data_nascimento, pais)
    )
    conn.commit()

    cursor.execute("SELECT id, name, email FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    session["user_id"]    = user[0]
    session["user_name"]  = user[1]
    session["user_email"] = user[2]

    registrar_login(user[0])

    return jsonify({"success": True, "message": "Cadastro realizado com sucesso",
                    "redirect": "/pages/dashboard.html"})


@app.route("/login", methods=["POST"])
def login():
    email    = get_input("email", "loginEmail", "emailUser")
    password = get_input("password", "senha", "loginSenha")

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "não encontrado"}), 401
    if not check_password_hash(user[3], password):
        return jsonify({"success": False, "message": "incorreta"}), 401

    session["user_id"]    = user[0]
    session["user_name"]  = user[1]
    session["user_email"] = user[2]

    registrar_login(user[0])

    return jsonify({"success": True, "message": "Login realizado com sucesso",
                    "redirect": "/pages/dashboard.html"})


@app.route("/session-user")
def session_user():
    if "user_id" not in session:
        return jsonify({"logged": False})
    return jsonify({"logged": True, "user": {
        "id":    session["user_id"],
        "name":  session["user_name"],
        "email": session["user_email"]
    }})


@app.route("/logout")
def logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/meu-progresso")
def meu_progresso():
    """Retorna sequência de login e matrículas para cálculo de horas no frontend."""
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    sequencia = calcular_sequencia(session["user_id"])
    return jsonify({"success": True, "sequencia": sequencia})


@app.route("/minhas-matriculas")
def minhas_matriculas():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT curso_id, progresso FROM matriculas WHERE user_id = ?",
                   (session["user_id"],))
    rows = cursor.fetchall()
    conn.close()

    return jsonify({"success": True, "matriculas": {r[0]: r[1] for r in rows}})


@app.route("/comprar", methods=["POST"])
def comprar():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    data     = request.get_json(silent=True)
    curso_id = data.get("curso_id") if data else None
    if not curso_id:
        return jsonify({"success": False, "message": "curso_id obrigatório"}), 400

    conn   = sqlite3.connect(DATABASE)
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

    data      = request.get_json(silent=True)
    curso_id  = data.get("curso_id") if data else None
    progresso = data.get("progresso") if data else None
    if not curso_id or progresso is None:
        return jsonify({"success": False, "message": "curso_id e progresso obrigatórios"}), 400

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE matriculas SET progresso = ? WHERE user_id = ? AND curso_id = ?",
        (progresso, session["user_id"], curso_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route("/minhas-atividades")
def minhas_atividades():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT atividade_id, status FROM atividades_concluidas WHERE user_id = ?",
        (session["user_id"],)
    )
    rows = cursor.fetchall()
    conn.close()

    concluidas = [r[0] for r in rows if r[1] == 'concluido']
    em_revisao = [r[0] for r in rows if r[1] == 'revisao']
    return jsonify({"success": True, "concluidas": concluidas, "em_revisao": em_revisao})


@app.route("/revisar-atividade", methods=["POST"])
def revisar_atividade():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    data         = request.get_json(silent=True)
    atividade_id = data.get("atividade_id") if data else None
    if not atividade_id:
        return jsonify({"success": False, "message": "atividade_id obrigatório"}), 400

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO atividades_concluidas (user_id, atividade_id, status)
        VALUES (?, ?, 'revisao')
        ON CONFLICT(user_id, atividade_id) DO UPDATE SET status = 'revisao'
    """, (session["user_id"], atividade_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route("/concluir-atividade", methods=["POST"])
def concluir_atividade():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Não logado"}), 401

    data         = request.get_json(silent=True)
    atividade_id = data.get("atividade_id") if data else None
    if not atividade_id:
        return jsonify({"success": False, "message": "atividade_id obrigatório"}), 400

    conn   = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO atividades_concluidas (user_id, atividade_id, status)
        VALUES (?, ?, 'concluido')
        ON CONFLICT(user_id, atividade_id) DO UPDATE SET status = 'concluido'
    """, (session["user_id"], atividade_id))
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