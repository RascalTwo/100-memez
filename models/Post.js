const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ownerId: { type: String, required: true },
  url: {
    type: String,
    required: true,
  }
});
PostSchema.virtual('createdAt').get(function() {
  const dateBits = Number(BigInt.asUintN(64, this._id) >> 22n);
  return new Date(dateBits + 1420070400000);
});
PostSchema.virtual('owners', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id'
});
PostSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
  count: true
});


module.exports = mongoose.model("Post", PostSchema);