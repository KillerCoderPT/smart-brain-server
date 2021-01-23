const winston = require('winston');
const jwt = require('jsonwebtoken');

const handleSignin = (db, bcrypt, req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return Promise.reject('Incorrect form submission');
    } 

    return db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);

            if (isValid) {
                return db.select('*').from('users').where('email', '=', email)
                    .then(user => user[0])
                    .catch(err => {
                        winston.warn(`Unable to get user: ${err}`);
                        Promise.reject('Unable to get user!')
                    });
            } else {
                Promise.reject('Wrong credentials!');
            }
        })
        .catch(err => Promise.reject('Wrong credentials!'));
}

// Get the Authentication Token ID from Redis
const getAuthTokenId = (redisCli, req, res) => {
    const { authorization } = req.headers;
    const bearer = authorization.split(' ')
    return redisCli.get(bearer[1], (err, reply) => {
        if (err || !reply) {
            return res.status(401).json('Unauthorized');
        }
        return res.json({id: reply})
    });
}

// Sign Tokens with the user email
const signToken = (email) => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' })
}

// Set the Token on redis
const setToken = (redisCli, key, value) => {
    return Promise.resolve(
        redisCli.set(key, value)
    );
}

// Create User Sessions 
const createSessions = (redisCli, user) => {
    const { email, id } = user;
    const token = signToken(email);
    return setToken(redisCli, token, id)
        .then(() => {
            return { success: 'true', userId: id, token }
        }).catch(console.log);
}

// Handle the Sign in and verify/create the authorization token
const handleSigninWithAuth = (db, bcrypt, redisClient) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ? 
        getAuthTokenId(redisClient, req, res) :
        handleSignin(db, bcrypt, req, res)
            .then(data => {
                return data.id && data.email ? createSessions(redisClient, data) : Promise.reject(data);
            })
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err));
}

module.exports = {
    handleSigninWithAuth
}