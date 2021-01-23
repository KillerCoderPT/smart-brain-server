const winston = require('winston');

const handleRegister = (db, bcrypt) => (req, res) => {
    const {name, email, password} = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json('Incorrect form submission');
    } 
    
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(LoginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: LoginEmail[0],
                    joined: new Date()
                })
                .then(user => res.json(user[0]))
        })
        .then(trx.commit)
        .catch(trx.rollback)
        winston.info(`New user join us with the name ${name}!`);
    })
    .catch(err => {
        winston.error(`Unable to register: ${err}`);
        res.status(400).json('Unable to register')
    });
}

module.exports = {
    handleRegister: handleRegister
}