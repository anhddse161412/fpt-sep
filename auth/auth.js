require("dotenv").config();
const db = require("../models");
const { genSaltSync, hashSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const Account = db.accounts;
const Freelancer = db.freelancers;
passport.use(
   new GoogleStrategy(
      {
         passReqToCallBack: true,
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: "/accounts/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, done) {
         // check fpt gmail
         if (profile._json.email.match(/(@fpt.edu.vn)/)) {
            console.log(profile._json);
            console.log("match");
            // check exiting user ? return user : create new user
            if (
               (checkExitingUserByEmail = await Account.findOne({
                  where: { email: profile._json.email },
               }))
            ) {
               return done(null, profile);
            } else {
               const salt = genSaltSync(10);
               let info = {
                  name: profile._json.name,
                  image: profile._json.picture,
                  email: profile._json.email,
                  password: hashSync(profile._json.sub, salt),
                  currency: 0,
                  role: "freelancer",
                  status: 1,
               };
               const account = await Account.create(info);
               const freelancer = await Freelancer.create({ status: "true" });
               account.setFreelancers(freelancer);

               return done(null, profile);
            }
         } else {
            return done(null, false);
         }
      }
   )
);

passport.serializeUser((user, done) => {
   done(null, user);
});

passport.deserializeUser((user, done) => {
   done(null, user);
});
