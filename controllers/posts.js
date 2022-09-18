const dateFns = require('date-fns');

const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
  getProfile: async (req, res) => {
    try {
      const profileUser = await User.findById(req.params.id || req.user.id).populate({ path: 'posts', populate: { path: 'likes' } });
      res.render("profile.ejs", { profileUser });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const lastPage = Math.floor(await Post.count() / 10)

      const sortBy = req.query.sort || 'createdAt'
      const page = +req.query.page || 0;
      const start = page * 10;
      let posts = [];
      if (sortBy === 'random'){
        posts = await Post.find().populate(['owners', 'likes']).skip(randomIntFromInterval(0, (lastPage - 1) * 10)).limit(10)
      } else {
        posts = await Post.find().populate(['owners', 'likes']).sort({ [sortBy]: 'desc' }).skip(start).limit(10);
      }
      res.render("feed.ejs", { posts: posts, page, lastPage, dateFns });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate(['owners', 'likes']);
      res.render("post.ejs", { post: post });
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      const obj = { user: req.user.id, post: req.params.id };
      if ((await Like.deleteOne(obj)).deletedCount) {
        console.log("Likes -1");
        return res.redirect(`/post/${req.params.id}`);
      }
      await Like.create(obj);
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
};
