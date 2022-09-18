const Post = require("../models/Post");
const User = require("../models/User");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const profileUser = req.params.id ? await User.findById(req.params.id).populate('posts') : await req.user.populate('posts')
      res.render("profile.ejs", { profileUser });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const page = +req.query.page || 0;
      const start = page * 10;
      const posts = (await Post.find().populate('owners')).sort((a, b) => b.createdAt - a.createdAt).slice(start, start + 10);
      const lastPage = Math.floor(await Post.count() / 10)
      res.render("feed.ejs", { posts: posts, page, lastPage });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post });
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
};
