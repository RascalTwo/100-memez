const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: String
}, {
  timestamps: { updatedAt: true },
  toObject: { virtuals: true }
});
UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'ownerId'
});

UserSchema.virtual('avatarURL').get(function() {
  return 'https://cdn.discordapp.com/' + (
    this.avatar
      ? ['', `${this._id}/${this.avatar}.webp`]
      : ['embed/',  `avatars/${(+this.displayName.split('#').at(-1)) % 5}.png`]
  ).join('avatars/');
});

module.exports = mongoose.model("User", UserSchema);