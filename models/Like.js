const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
  user: {
    type: String
  },
  post: {
    type: String
  },
});

module.exports = mongoose.model("Like", LikeSchema);
