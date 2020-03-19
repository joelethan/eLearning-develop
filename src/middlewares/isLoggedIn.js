import passport from "passport";

export const isLoggedIn = strategy => {
  return passport.authenticate(strategy, { session: false });
};
