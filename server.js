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

        const cocktailMatch = Object.values(cocktails).find(cocktail => {
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

function matchCocktail(cocktailIngredients, playerIngredients) {
    if (cocktailIngredients.length !== playerIngredients.length) {
        return false;
    }

    for (let i = 0; i < cocktailIngredients.length; i++) {
        const cocktailIngredient = cocktailIngredients[i];
        const playerIngredient = playerIngredients.find(item => item.name === cocktailIngredient.name);

        if (!playerIngredient || playerIngredient.quantity !== cocktailIngredient.quantity) {
            return false;
        }
    }

    return true;
}

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
