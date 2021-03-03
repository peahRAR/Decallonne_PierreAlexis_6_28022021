// Imports
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

// Routes 
router.post('/signup', userCtrl.signup); // Nouvel utilisateur
router.post('/login', userCtrl.login); // Connection


module.exports = router;