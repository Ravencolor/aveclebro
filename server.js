const express = require('express');
const path = require('path');
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./cocktails.db');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get("/api/ingredients", (req, res) => {
    const query = "SELECT * FROM ingredients";
    db.all(query, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/jeu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jeu.html'));
});

app.post("/api/validate-cocktail", (req, res) => {
    const cocktailIngredients = req.body.ingredients;

    console.log("Ingrédients reçus :", cocktailIngredients);

    const query = `
        SELECT c.id, c.name, ci.ingredient_id, i.name AS ingredient_name, ci.quantity 
        FROM cocktails c
        JOIN cocktail_ingredients ci ON c.id = ci.cocktail_id
        JOIN ingredients i ON ci.ingredient_id = i.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur de base de données" });
        }

        const cocktails = {};
        rows.forEach(row => {
            if (!cocktails[row.id]) {
                cocktails[row.id] = { name: row.name, ingredients: [] };
            }
            cocktails[row.id].ingredients.push({
                name: row.ingredient_name,
                quantity: row.quantity
            });
        });

        console.log("Détails des cocktails après boucle :", JSON.stringify(cocktails, null, 2));

        const cocktailMatch = Object.values(cocktails).find(cocktail => {
            console.log("Cocktails extraits de la base :", JSON.stringify(cocktails, null, 2));
            console.log("Cocktail à valider :", cocktailIngredients);
            return matchCocktail(cocktail.ingredients, cocktailIngredients);
        });

        if (cocktailMatch) {
            res.json({
                message: `Bien joué ! tu as créé ${cocktailMatch.name}`,
                success: true
            });
        } else {
            res.json({
                message: "Bien joué... tu as créé une étrange mixture...",
                success: false
            });
        }
    });
});

function matchCocktail(databaseIngredients, inputIngredients) {
    if (databaseIngredients.length !== inputIngredients.length) {
        return false;
    }

    return databaseIngredients.every(dbIngredient => {
        const userIngredient = inputIngredients.find(userIng =>
            userIng.name.toLowerCase() === dbIngredient.name.toLowerCase()
        );

        if (!userIngredient) return false;

        const dbQuantity = parseQuantity(dbIngredient.quantity);
        const userQuantity = parseQuantity(userIngredient.quantity);

        return dbQuantity === userQuantity;
    });
}


function parseQuantity(quantity) {
    if (typeof quantity === "number") {
        return quantity;
    }
    if (typeof quantity === "string") {
        const match = quantity.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }
    return 0;
}

app.get('/livre-des-recettes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recettes.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(query, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Erreur de base de données" });
        }
        if (row) {
            res.json({ message: "Connexion réussie", success: true });
        } else {
            res.json({ message: "Nom d'utilisateur ou mot de passe incorrect", success: false });
        }
    });
});

app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.run(query, [username, password], function(err) {
        if (err) {
            return res.status(500).json({ message: "Erreur de base de données" });
        }
        res.json({ message: "Inscription réussie", success: true });
    });
});