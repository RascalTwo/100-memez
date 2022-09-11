const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true }
}, { timestamps: { updatedAt: true } });
UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'ownerId'
});

UserSchema.virtual('avatarURL').get(function() {
  return `https://cdn.discordapp.com/avatars/${this._id}/${this.avatar}.webp`
});

module.exports = mongoose.model("User", UserSchema);