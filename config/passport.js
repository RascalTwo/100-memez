const User = require("../models/User");
const DiscordStrategy = require('passport-discord').Strategy;

module.exports = function (passport) {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: '/auth/discord/callback',
    scope: ['identify', 'guilds']
  },
    function (accessToken, refreshToken, profile, cb) {
      const displayName = `${profile.username}#${profile.discriminator}`;
      const is100Dever = profile.guilds.some(server => server.id === '735923219315425401')

      if (!is100Dever) return cb(null, false, {
        msg: "You must be a member of the 100Devs Discord to use this application",
      });
      User.findById(profile.id, (err, user) => {
        if (err) return cb(err, user);
        if (!user) return User.create({
          _id: profile.id,
          displayName: displayName,
          avatar: profile.avatar
        }).then((err, user) => cb(err, user));

        user.displayName = displayName;
        user.avatar = profile.avatar;
        return user.save((err, user) => {
          return cb(err, user)
        })
      });
    }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
