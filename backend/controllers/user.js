const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

const User = require('../models/User');

exports.signup = async (req, res) => {   
    // Maskage et cryptage
    const algorithm = 'aes-256-cbc'; 
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16); 
    let cipher = crypto.createCipheriv( algorithm, Buffer.from(key), iv); 
    let encrypted = cipher.update(req.body.email, 'utf-8', 'hex');
    let email = {
        // Mail Identifier permet de crypter l'e-mail de maniere unidirectionnel 
        mailIdentifier : crypto.createHmac("sha256", `"${process.env.PASSWORDMAIL}"`).update(req.body.email).digest("hex"),
        // Mail Data crypte l'email mais avec possibilité de récupéré la chaine de caractere original
        mailData : encrypted
    }
    const password = await bcrypt.hash(req.body.password, 10)

    const user = new User({
        email: email,
        password: password
    });

    user.save()
        .then(() => res.status(201).json({
            message: 'Utilisateur créé'
        }))
        .catch(error => res.status(400).json({
            message : error
        }));
};

exports.login = (req, res) => {
    User.findOne({ 'email.mailIdentifier' : crypto.createHmac("sha256", `"${process.env.PASSWORDMAIL}"`).update(req.body.email).digest("hex")})
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            `"${process.env.RDM_TOKEN}"`,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};