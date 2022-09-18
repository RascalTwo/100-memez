const dateFns = require('date-fns');

const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");


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
      const page = +req.query.page || 0;
      const start = page * 10;
      const posts = (await Post.find().populate(['owners', 'likes'])).sort((a, b) => b.createdAt - a.createdAt).slice(start, start + 10);
      const lastPage = Math.floor(await Post.count() / 10)
      res.render("feed.ejs", { posts: posts, page, lastPage, dateFns });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('likes');
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
