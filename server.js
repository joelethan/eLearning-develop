const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config()

const app = express();

var whitelist  = process.env.CORSwhitelist ? process.env.CORSwhitelist.split(',') : '';

var corsOptionsDelegate = (req, callback) => {
  
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

const user = require('./routes/api/user');

// Body parsermiddleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Browser Middleware
app.use(function (req, res, next){
  req.browser = req.headers['user-agent'];
  next();
})

// Passport middleware
app.use(passport.initialize());

// CORS middleware
app.use(cors(corsOptionsDelegate));

// Passport Config
require('./config/passport')(passport);

app.get('/', (req, res)=> res.json({msg: 'Hello world2!!'}));

// Use routes
app.use('/api/user', user);

module.exports = app;
