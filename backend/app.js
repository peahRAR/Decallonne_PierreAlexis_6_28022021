// Imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// dotenv
require('dotenv').config();

// Déclaration routes
const userRoutes = require('./routes/user');

// Connexion à MongoDB Atlas
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS }@cluster0.ese2r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création de l'application Express
const app = express();


app.use(cors())
app.use(bodyParser.json());
app.use('/api/auth', userRoutes);

module.exports = app;