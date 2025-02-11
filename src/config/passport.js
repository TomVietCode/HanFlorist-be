const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/user.model")
const jwt = require("../helpers/jwt")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // URL callback khi Google trả về
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: "google",
          });
          await user.save();
        }
        console.log(user)
        const token = jwt.generateToken({ sub: user._id, role: "client" })

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
)