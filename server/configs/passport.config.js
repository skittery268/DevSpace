// Modules
const passport = require("passport");

// Models
const User = require("../models/user.model");

// Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// -------------------------------------IMPORTS-------------------------------------

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = await User.create({
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        provider: "google",
                        isVerified: true
                    });
                } else {
                    user.googleId = profile.id;
                    user.provider = "google";

                    await user.save();
                };
            };

            done(null, user);
        }
    )
);
