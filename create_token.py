import sqlite3
import uuid

# Connexion à la base de données
db_path = "cocktails.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Sélection des utilisateurs existants
users = cursor.execute('SELECT id FROM Users').fetchall()

# Génération et insertion des tokens pour chaque utilisateur
for user in users:
    user_id = user[0]
    token = str(uuid.uuid4())  # Génération d'un token unique
    cursor.execute('INSERT INTO Tokens (user_id, token) VALUES (?, ?)', (user_id, token))

# Sauvegarde et fermeture
conn.commit()
conn.close()
