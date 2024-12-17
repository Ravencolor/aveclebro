let cocktailIngredients = [];

async function fetchIngredients() {
    try {
        const response = await fetch("http://localhost:3000/api/ingredients");
        ingredientsData = await response.json();
        generateIngredientsList(ingredientsData);
    } catch (error) {
        console.error("Erreur lors de la récupération des ingrédients:", error);
    }
}

function generateIngredientsList(ingredients) {
    const ingredientsContainer = document.getElementById("ingredients");
    ingredientsContainer.innerHTML = '';

    ingredients.forEach((ingredient, index) => {
        const ingredientElement = document.createElement("div");
        ingredientElement.classList.add("ingredient");
        ingredientElement.setAttribute("draggable", true);
        ingredientElement.setAttribute("data-index", index);

        ingredientElement.innerHTML = `${ingredient.name} (${ingredient.quantity})`;

        ingredientElement.addEventListener("dragstart", dragStart);

        ingredientsContainer.appendChild(ingredientElement);
    });
}

function dragStart(event) {
    event.dataTransfer.setData("ingredientIndex", event.target.getAttribute("data-index"));
}

const glass = document.getElementById("verre");
glass.addEventListener("dragover", (event) => {
    event.preventDefault();
});

glass.addEventListener("drop", (event) => {
    event.preventDefault();

    const index = event.dataTransfer.getData("ingredientIndex");
    const ingredient = ingredientsData[index];

    addOrUpdateIngredientInGlass(ingredient);
});

function addOrUpdateIngredientInGlass(ingredient) {
    const glassList = document.getElementById("ingredients-liste");

    const existingIngredient = cocktailIngredients.find(item => item.name === ingredient.name);

    if (existingIngredient) {
        existingIngredient.quantity += parseInt(ingredient.quantity);
    } else {
        cocktailIngredients.push({
            name: ingredient.name,
            quantity: parseInt(ingredient.quantity)
        });
    }

    updateGlassIngredientList();
}

function updateGlassIngredientList() {
    const glassList = document.getElementById("ingredients-liste");
    glassList.innerHTML = '';

    cocktailIngredients.forEach(ingredient => {
        const ingredientElement = document.createElement("div");
        ingredientElement.classList.add("ingredient-liste-item");
        ingredientElement.innerHTML = `${ingredient.name} (${ingredient.quantity})`;

        glassList.appendChild(ingredientElement);
    });
}

fetchIngredients();

async function validateCocktail() {
    const ingredients = cocktailIngredients.map(ingredient => ({
        name: ingredient.name,
        quantity: ingredient.quantity
    }));

    try {
        const response = await fetch("http://localhost:3000/api/validate-cocktail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ingredients })
        });

        const data = await response.json();

        const popup = document.createElement("div");
        popup.classList.add("popup");

        const popupContent = document.createElement("div");
        popupContent.classList.add("popup-content");

        const message = document.createElement("p");
        message.innerHTML = data.message;
        popupContent.appendChild(message);

        const closeButton = document.createElement("span");
        closeButton.classList.add("close-button");
        closeButton.innerHTML = "&times;";
        closeButton.addEventListener("click", () => {
            popup.style.display = "none";

            const glassList = document.getElementById("ingredients-liste");
            glassList.innerHTML = '';

            cocktailIngredients = [];
        });

        popupContent.appendChild(closeButton);

        popup.appendChild(popupContent);

        const jeuContainer = document.getElementById("jeu");
        jeuContainer.appendChild(popup);

        popup.style.display = "block";

    } catch (error) {
        console.error("Erreur lors de la validation du cocktail :", error);
    }
}

const validateBtn = document.getElementById('validate-btn');

validateBtn.addEventListener('click', () => {
    validateCocktail();
});