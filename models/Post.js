const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ownerId: { type: String, required: true },
  url: {
    type: String,
    required: true,
  }
}, { timestamps: { createdAt: true }});
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