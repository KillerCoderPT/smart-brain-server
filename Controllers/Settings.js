const winston = require('winston');

// Update Settings
const handleSettingsUpdate = (db) => (req, res) => {
    const { id } = req.params;
    // TODO: Check if the ID is not empty
    const { name, age, website } = req.body.formInput;

    db('users')
        .where({ id })
        .update({ name })
        .then(resp => {
            if (resp) {
                winston.info(`User with id '${id}', updated her profile!`)
                res.json('success');
            } else {
                res.status(400).json('Unable to update!');
            }
        })
        .catch(err => { 
            winston.console.warn(`Unable to update the user: ${err}`);
            res.status(400).json('Error updating user!')
        });
}

module.exports = {
    handleSettingsUpdate
}