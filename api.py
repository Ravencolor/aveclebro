from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Enable CORS

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
    nom = new_cocktail['nom']
    description = new_cocktail['description']

    conn = get_db_connection()
    conn.execute('INSERT INTO Cocktails (nom, description) VALUES (?, ?)', (nom, description))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Cocktail ajouté avec succès'}), 201

if __name__ == '__main__':
    app.run(debug=True)