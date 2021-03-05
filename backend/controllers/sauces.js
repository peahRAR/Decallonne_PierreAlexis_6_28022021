// Imports
const Sauce = require('../models/Sauce');

// Méthode CRUD

// Create sauce
exports.createSauce = (req, res) => {
    const sauceForm = JSON.parse(req.body.Sauce);
    const sauce = new Sauce({
        ...sauceForm,
        imageURL: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => {
            res.status(201).json({ message: 'Sauce ajoutée à la BDD' });
        })
        .catch((error) => {
            res.status(400).json({ error })
        });
};

// Read Sauce
// Voir une sauce
exports.showOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            res.status(200).json(sauce)
        })
        .catch((error) => {
            res.status(400).json({ error })
        });
};

// Voir toutes les sauces
exports.showAllSauces = (req, res) => {
    Sauce.find()
        .then((sauces) => { res.status(200).json(sauces); })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Update sauce
exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Modification validée' }))
        .catch(error => res.status(400).json({ error }));
};

// Delete Sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Gestion Like & Dislike
exports.likeOrNotSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            sauce.likeOrNotSauce(req.body.like, req.user._id)
            sauce.save()
                .then(() => res.status(201).json({ message: 'Appréciation prise en compte' }))
                .catch(error => res.status(400).json({ error }));
        });
};