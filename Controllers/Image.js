const Clarifai = require('clarifai');
const winston = require('winston');

// ENV File config
require('dotenv').config();

// Clarifai API
const app = new Clarifai.App({
    apiKey: process.env.CLARIFAI_API,
})

const handleAPICall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            winston.warn(`Unable to work with API: ${err}`);
            res.status(400).json('Unable to work with API');
        });
}

const handleImage = (db) => (req, res) => {
    const { id } = req.body;

    db('users').where('id', '=', id).increment('entries', 1)
        .returning('entries')
        .then(entries => {
            winston.info('New entrie');
            res.json(entries[0]);
        })
        .catch(err => {
            winston.error(`Unable to get entries: ${err}`);
            res.status(400).json('Unable to get entries!');
        });
}

module.exports = {
    handleImage,
    handleAPICall
}