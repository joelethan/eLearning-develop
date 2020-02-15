const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const mongoose = require('mongoose')
const User = mongoose.model('users')

const dotenv = require('dotenv')
dotenv.config()

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secretOrKey || 'key'

module.exports = passport =>{
    passport.use(new jwtStrategy(opts, (jwt_payload, done)=>{
        User.findById(jwt_payload.id)
            .then(user=>{
                if(user){
                    return done(null, user)
                }/* istanbul ignore next */
                return done(null, false)
            })
            .catch(
                /* istanbul ignore next */
                err => console.log(err)
                )
    }))

    // GOOGLE OAUTH STRATEGY
    passport.use(new GooglePlusTokenStrategy({
        clientID: process.env.googleclientID,
        clientSecret: process.env.googleclientSecret,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, next) => {
        email = profile.emails[0].value
        User.findOne({email})
            .then(user => {
                if (user) {
                    return next(null, user)
                }
                return next(null, profile)
            })
    }));

    // FACEBOOK OAUTH STRATEGY
    passport.use(new FacebookTokenStrategy({
        clientID: process.env.facebookclientID,
        clientSecret: process.env.facebookclientSecret,
    }, (accessToken, refreshToken, profile, next) => {
        email = profile.emails[0].value
        User.findOne({email})
            .then(user => {
                if (user) {
                    return next(null, user)
                }
                return next(null, profile)
            })
    }
    ));
}
