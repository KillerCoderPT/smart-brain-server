const handleProfile = (db) => (req, res) => {
    const { id } = req.params;

    db.select('*').from('users')
        // .where({ id: id })
        .where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(404).json('User not found!');
            }
        })
        .catch(err => res.status(400).json('Something goes wrong!'))
}

module.exports = {
    handleProfile
}