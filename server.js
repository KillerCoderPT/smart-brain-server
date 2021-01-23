//// Packages
const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const helmet = require('helmet');

//// DB Controller
const db = require('./Controllers/DBConn').ConnectionDev();
const redis = require('redis');

//// Controllers
const Register = require('./Controllers/Register');
const Signin = require('./Controllers/Signin');
const Image = require('./Controllers/Image');
const Profile = require('./Controllers/Profile');
const Settings = require('./Controllers/Settings');

//// Middleware
const auth = require('./Middleware/Authorization');

//// Express
const app = express();

//// Alternative to BodyParser (Bc express already can handle this)
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//// Cors
app.use(cors());

//// Secure the Headers
app.use(helmet());

//// Setup Redis
const redisCli = redis.createClient(process.env.REDIS_URI);

//// Default HTTP Call
app.get('/', (req, res) => {
    res.sendStatus(403);
});

//// HTTP Calls
// Register and Login
// app.post('/signin', Signin.handleSignin(db, bcrypt)); // in this way, 1º run the func and 2º just after run the func add req and res
app.post('/signin', Signin.handleSigninWithAuth(db, bcrypt, redisCli));
app.post('/register', Register.handleRegister(db, bcrypt));
// Profile
app.get('/profile/:id', auth.requireAuth(redisCli), Profile.handleProfile(db));
// Settings
app.post('/settings/:id', auth.requireAuth(redisCli), Settings.handleSettingsUpdate(db));
// Image API Clarafi
app.put('/image', auth.requireAuth(redisCli), Image.handleImage(db));
app.post('/imageurl', auth.requireAuth(redisCli), Image.handleAPICall);

//// Server Config
// Port
const PORT = process.env.PORT || 3000;
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

