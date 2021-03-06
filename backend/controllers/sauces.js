// Imports
const Sauce = require('../models/Sauce');
const fs = require('fs')

// Méthode CRUD
// Create sauce
exports.createSauce = (req, res) => {
    const sauceForm = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceForm,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        userLiked: [],
        userDisLiked: []
    });
    console.log(sauce)
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
        .then((sauces) => { res.status(200).json(sauces) })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Update sauce
exports.updateSauce = (req, res, next) => {
    let sauceObject = {};
    if (req.file) {
        Sauce.findOne({
            _id: req.params.id
        }).then((sauce) => {
            // Suppression ancienne image
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlinkSync(`images/${filename}`)
        }),
            sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
    } else {
        sauceObject = { ...req.body }
    }
    Sauce.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
    ).then(() => res.status(200).json({
        message: 'Sauce modifiée !'
    }))
        .catch((error) => res.status(400).json({
            error
        }))
}

// Delete Sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Suppresion image stockée
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
exports.likeOrNotSauce = (req, res) => {
    switch (req.body.like) {
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            // Utilisation des opérateur Mongo
                            $inc: { likes: -1 },
                            $pull: { usersLiked: req.body.userId }
                        })
                            .then(() => { res.status(201).json({ message: "Avis prit en compte" }); })
                            .catch((error) => { res.status(400).json({ error }); });
                    }

                    if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: -1 },
                            $pull: { usersDisliked: req.body.userId }
                        })
                            .then(() => { res.status(201).json({ message: "Avis prit en compte" }); })
                            .catch((error) => { res.status(400).json({ error }); });
                    }
                })
                .catch((error) => { res.status(404).json({ error }); });
            break;


        case 1:
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId }
            })
                .then(() => { res.status(201).json({ message: "Avis prit en compte" }); })
                .catch((error) => { res.status(400).json({ error }); });
            break;


        case -1:
            Sauce.updateOne({ _id: req.params.id },
                {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: req.body.userId }
                })
                .then(() => { res.status(201).json({ message: "Avis prit en compte" }); })
                .catch((error) => { res.status(400).json({ error }); });
            break;

        default:
            console.error("Impossible de prendre en compte votre avis");
    }
};