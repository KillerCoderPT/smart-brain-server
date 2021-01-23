const requireAuth = (redisClient) => (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json('Unauthorize!');
    }

    const bearer = authorization.split(' ');

    return redisClient.get(bearer[1], (err, reply) => {
        if (err || !reply) {
            return res.status(401).json('Unauthorize!');
        }

        return next();
    });
}

module.exports = {
    requireAuth
}