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
    res.render("pages/index", { 
        data: null, 
        error: null, 
        searchInitiated: false, 
        currentPage: 1, 
        totalPages: 0,
        totalPointsUsed: 0,
        pointsRemaining: null, 
        pointsUsedForRequest: null
    });
});

app.post("/search", async (req, res) => {
    const { query, page = 1 } = req.body;
    const resultsPerPage = 8;
    const offset = (page - 1) * resultsPerPage;

    try {
        const searchResponse = await axios.get(`${API_URL}/recipes/complexSearch`, {
            params: {
                query: query,
                number: resultsPerPage,
                offset: offset,
                apiKey: API_KEY
            }
        });

        // Extract the quota-related headers
        const pointsUsedForRequest = parseFloat(searchResponse.headers['x-api-quota-request']);
        const totalPointsUsed = parseFloat(searchResponse.headers['x-api-quota-used']);
        const pointsRemaining = parseFloat(searchResponse.headers['x-api-quota-left']);

        const recipes = searchResponse.data.results;
        const totalResults = searchResponse.data.totalResults;
        const totalPages = Math.ceil(totalResults / resultsPerPage);

        res.render('pages/index', {
            data: recipes,
            currentPage: page,
            totalPages: totalPages,
            query: query,
            error: null,
            searchInitiated: true, // Search is initiated
            totalPointsUsed: totalPointsUsed,
            pointsRemaining: pointsRemaining,
            pointsUsedForRequest: pointsUsedForRequest
        });

    } catch (error) {
        console.error('Error fetching data from API:', error);
        res.render('pages/index', { 
            data: null, 
            error: 'Error fetching data from the API', 
            searchInitiated: true,
            pointsRemaining: null, 
            pointsUsedForRequest: null 
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});