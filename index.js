import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url'; // Import for handling URL

dotenv.config();
const app = express();

// Middleware for parsing form data and JSON
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup static files and views
const __filename = fileURLToPath(import.meta.url); // Get the current file URL
const __dirname = path.dirname(__filename); // Derive the directory name
app.set('views', path.join(__dirname, 'views')); // Ensure this points to the correct views folder
app.set('view engine', 'ejs');

// API credentials from .env
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const PORT = 3000;

app.get("/", (req, res) => {
    res.render("pages/index", { data: null, error: null}); // Render index.ejs from views/pages
});

// Handle the form submission
app.post("/search", async (req, res) => {
    const { query } = req.body;  // Get the input value (query) from the form submission

    try {
        // Send request to external API using Axios
        const searchResponse = await axios.get(`${API_URL}/recipes/complexSearch`, {
            params: {
                query: query,
                number: 1, // Limit results (Make it 8 after you're satisfied)
                apiKey: API_KEY
            }
        });

        // Just take the results part from the API response
        const recipes = searchResponse.data.results;

        // Fetch detailed information for each recipe
        const recipeDetailsPromises = recipes.map(recipe =>
            axios.get(`${API_URL}/recipes/${recipe.id}/information`, {
                params: {
                    apiKey: API_KEY
                }
            })
        );

        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);

        // Map the details to include dietary info
        const detailedRecipes = recipeDetailsResponses.map(response => {
            const { title, glutenFree, dairyFree, vegetarian, vegan, sourceUrl, image } = response.data;
            return { title, glutenFree, dairyFree, vegetarian, vegan, sourceUrl, image };
        });

        // Pass the detailed recipe data to the client-side for rendering
        res.render('pages/index', { data: detailedRecipes, error: null });

    } catch (error) {
        console.error('Error fetching data from API:', error);
        res.render('pages/index', { data: null, error: 'Error fetching data from the API' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});






/*
Steps

Initialization
1. **Set Up Project Structure**:
   - Create a new project folder and initialize it with `npm init`.
   - Install necessary dependencies: `express`, `axios`, and `ejs`.

2. **Create Basic Server**:
   - Set up an Express server with basic routing.
   - Serve static files (CSS, JS) and configure EJS as the templating engine.

Category Management
3. **[Server] Retrieve Food Categories**:
   - Use the API to get the list of food categories.
   - Example API Request: `GET /v0/food/categories`.

4. **[Server] Send Categories to Client**:
   - Return the categories as a JSON response or render them in a view.

5. **[Client] Render Category Tabs**:
   - Create dynamic tabs in the UI for each food category received from the server.

Subcategory Management
6. **[Server] Retrieve Subcategories for Each Category**:
   - Fetch subcategories based on the selected category.
   - Example API Request: `GET /v0/food/subcategories?category=<category_name>`.

7. **[Server] Send Subcategories to Client**:
   - Return the subcategories to the client for rendering.

8. **[Client] Render Subcategory Tabs**:
   - Create subcategory tabs under the corresponding category tab.

Item Management
9. **[Server] Retrieve Food Items by Subcategory**:
   - Fetch food items for the selected subcategory.
   - Example API Request: `GET /v0/food/items?subcategory=<subcategory_name>`.

10. **[Server] Send Food Items to Client**:
    - Pass the list of food items to the client for display.

11. **[Client] Render Food Item Cards**:
    - Display the food items as cards on the page.

12. **[Client] Implement Pagination**:
    - Set up pagination to limit the number of items shown per page.

Filtering
13. **[Client] Add Search Input Field**:
    - Include an input field for users to filter food items.

14. **[Script] Implement Filtering Logic**:
    - Create a function to filter the displayed food items based on user input.

Modal Implementation
15. **[Client] Set Up Modal for Item Details**:
    - Design a modal layout to display item details when a food card is clicked.

16. **[Client] Handle Item Click Event**:
    - When an item is clicked, open the modal and fetch detailed information about the item.

17. **[Server] Retrieve Allergen Information**:
    - Fetch allergen data for the selected item.
    - Example API Request: `GET /v0/food/allergens?query=<item_name>`.

18. **[Server] Send Allergen Data to Client**:
    - Return the allergen data to the client.

19. **[Client] Display Allergen Information in Modal**:
    - Render the allergen information inside the modal when it is opened.

Additional Steps
20. **[Client] Add Loading States**:
    - Implement loading indicators while data is being fetched.

21. **[Client] Handle Error States**:
    - Display user-friendly error messages if any API calls fail.

22. **[Client] Make UI Responsive**:
    - Ensure that the layout adapts to various screen sizes for mobile-friendliness.

*/
