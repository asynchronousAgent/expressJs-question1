const passport = require("passport-jwt");

const jwtStrategy = passport.Strategy;
const extractJwt = passport.ExtractJwt;
const User = require("../models/user");

const opts = {};
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.mySecretKey;

module.exports = (passport) => {
  passport.use(
    new jwtStrategy(opts, async (jwt_payload, done, next) => {
      try {
        const user = await User.findById(jwt_payload.user);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        next(err);
      }
    })
  );
};
