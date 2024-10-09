from flask import Flask, jsonify, request
import sqlite3
import uuid

app = Flask(__name__)

# Connexion à la base de données
def get_db_connection():
    conn = sqlite3.connect('cocktails.db')
    conn.row_factory = sqlite3.Row
    return conn

# Route pour obtenir tous les cocktails
@app.route('/cocktails', methods=['GET'])
def get_cocktails():
    conn = get_db_connection()
    cocktails = conn.execute('SELECT * FROM Cocktails').fetchall()
    conn.close()

    return jsonify([dict(row) for row in cocktails])

# Route pour ajouter un cocktail
@app.route('/cocktails', methods=['POST'])
def add_cocktail():
    new_cocktail = request.json
    name = new_cocktail['name']
    description = new_cocktail['description']

    conn = get_db_connection()
    conn.execute('INSERT INTO Cocktails (name, description) VALUES (?, ?)', (name, description))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Cocktail ajouté avec succès'}), 201

# Route pour obtenir un cocktail par ID
@app.route('/cocktails/<int:id>', methods=['GET'])
def get_cocktail(id):
    conn = get_db_connection()
    cocktail = conn.execute('SELECT * FROM Cocktails WHERE id = ?', (id,)).fetchone()
    conn.close()

    if cocktail is None:
        return jsonify({'error': 'Cocktail non trouvé'}), 404

    return jsonify(dict(cocktail))

# Route pour gérer l'authentification (login)
@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM Users WHERE username = ? AND password = ?', (username, password)).fetchone()

    if user:
        token = str(uuid.uuid4())  # Générer un token unique
        conn.execute('INSERT INTO Tokens (user_id, token) VALUES (?, ?)', (user['id'], token))
        conn.commit()
        conn.close()
        return jsonify({'token': token}), 200
    else:
        conn.close()
        return jsonify({'error': 'Identifiants incorrects'}), 401

# Middleware simple pour vérifier le token d'authentification
@app.before_request
def check_token():
    if request.endpoint not in ['login', 'signup']:
        token = request.headers.get('Authorization')
        if token:
            conn = get_db_connection()
            user_token = conn.execute('SELECT * FROM Tokens WHERE token = ?', (token,)).fetchone()
            conn.close()
            if not user_token:
                return jsonify({'error': 'Token invalide ou expiré'}), 403
        else:
            return jsonify({'error': 'Token manquant'}), 401

if __name__ == '__main__':
    app.run(debug=True)
