import { Strategy as jwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import GooglePlusTokenStrategy from "passport-google-plus-token";
import FacebookTokenStrategy from "passport-facebook-token";
import { model } from "mongoose";

const User = model("users");

import { loadEnv } from "../lib";

loadEnv();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secretOrKey || "key";

export default passport => {
  passport.use(
    new jwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          } /* istanbul ignore next */
          return done(null, false);
        })
        .catch(
          /* istanbul ignore next */
          err => console.log(err)
        );
    })
  );

  // GOOGLE OAUTH STRATEGY
  passport.use(
    new GooglePlusTokenStrategy(
      {
        clientID: process.env.googleclientID,
        clientSecret: process.env.googleclientSecret,
        passReqToCallback: true
      },
      (req, accessToken, refreshToken, profile, next) => {
        email = profile.emails[0].value;
        User.findOne({ email }).then(user => {
          if (user) {
            return next(null, user);
          }
          return next(null, profile);
        });
      }
    )
  );

  // FACEBOOK OAUTH STRATEGY
  passport.use(
    new FacebookTokenStrategy(
      {
        clientID: process.env.facebookclientID,
        clientSecret: process.env.facebookclientSecret
      },
      (accessToken, refreshToken, profile, next) => {
        email = profile.emails[0].value;
        User.findOne({ email }).then(user => {
          if (user) {
            return next(null, user);
          }
          return next(null, profile);
        });
      }
    )
  );
};
