from flask import Flask, request, jsonify, session, redirect, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FRONTEND_DIR = os.path.join(BASE_DIR, "..", "..", "frontend")

DATABASE = os.path.join(BASE_DIR, "users.db")

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)

app.secret_key = "codewave_secret_key"
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=False
)

# IMPORTANT FIX
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5173",
        "http://localhost:5173"
    ]
)

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

init_db()

def get_input(*names):

    data = request.get_json(silent=True)

    for name in names:

        value = None

        # FORM DATA
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

    return jsonify({
        "message": "Frontend build not found"
    }), 404


@app.route("/<path:path>")
def static_files(path):

    file_path = os.path.join(FRONTEND_DIR, path)

    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)

    return jsonify({
        "error": "File not found"
    }), 404


@app.route("/register", methods=["POST"])
def register():

    name = get_input(
        "name",
        "nome",
        "username",
        "registerName",
        "nomeUser"
    )

    email = get_input(
        "email",
        "registerEmail",
        "emailUser",
        "loginEmail"
    )

    password = get_input(
        "password",
        "senha",
        "registerPassword",
        "loginSenha"
    )

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Preencha todos os campos"
        }), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()

        return jsonify({
            "success": False,
            "message": "E-mail já cadastrado"
        }), 400

    hashed_password = generate_password_hash(password)

    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        (name, email, hashed_password)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Cadastro realizado com sucesso",
        "redirect": "/clicarcurso.html"
    })


@app.route("/login", methods=["POST"])
def login():

    email = get_input(
        "email",
        "loginEmail",
        "emailUser"
    )

    password = get_input(
        "password",
        "senha",
        "loginSenha"
    )

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Preencha todos os campos"
        }), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    user = cursor.fetchone()

    conn.close()

    if not user:
        return jsonify({
            "success": False,
            "message": "Usuário não encontrado"
        }), 401

    user_id = user[0]
    user_name = user[1]
    user_email = user[2]
    user_password = user[3]

    password_correct = check_password_hash(
        user_password,
        password
    )

    if not password_correct:
        return jsonify({
            "success": False,
            "message": "Senha incorreta"
        }), 401

    session["user_id"] = user_id
    session["user_name"] = user_name
    session["user_email"] = user_email

    return jsonify({
        "success": True,
        "message": "Login realizado com sucesso",
        "redirect": "/dashboard.html"
    })

@app.route("/session-user")
def session_user():

    if "user_id" not in session:
        return jsonify({
            "logged": False
        })

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

    return jsonify({
        "success": True
    })


@app.route("/clicarcurso.html")
def protected_course():

    if "user_id" not in session:
        return redirect("/")

    return send_from_directory(
        FRONTEND_DIR,
        os.path.join("pages", "clicarcurso.html")
    )


@app.route("/dashboard.html")
def dashboard():

    if "user_id" not in session:
        return redirect("/")

    return send_from_directory(
        FRONTEND_DIR,
        os.path.join("pages", "dashboard.html")
    )


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )