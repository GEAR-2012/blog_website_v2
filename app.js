const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const dotenv = require("dotenv").config();
//
const { homeContent, aboutContent, contactContent } = require("./contents");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);

const dbName = process.env.DB_NAME;
const dbUserName = process.env.DB_USER_NAME;
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.i8f6e4b.mongodb.net/${dbName}?retryWrites=true&w=majority`;

main();

async function main() {
  console.log("function 'main' started");
  try {
    await mongoose.connect(uri);
    const blogPostSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true,
      },
      body: {
        type: String,
        required: true,
      },
    });
    const Blogpost = mongoose.model("Blogpost", blogPostSchema);

    app.listen(3000, () => console.log("Servers was started at port 3000"));

    app.get("/", async (req, res) => {
      const blogPosts = await Blogpost.find().exec();
      res.render("home", { pageTitle: "Home", pageContent: homeContent, blogPosts });
    });

    app.post("/", async (req, res) => {
      const blogpost = new Blogpost({
        title: req.body.postTitle,
        body: req.body.postBody,
      });
      await blogpost.save();
      res.redirect("/");
    });

    app.get("/update/:postId", async (req, res) => {
      const postId = req.params.postId;
      const filter = { _id: postId };
      const foundBlogPost = await Blogpost.findOne(filter).exec();
      const post = foundBlogPost;
      res.render("update", { pageTitle: "Construct", post });
    });

    app.post("/update/:postId", async (req, res) => {
      const postId = req.params.postId;
      const filter = { _id: postId };
      const updateDoc = {
        title: req.body.postTitle,
        body: req.body.postBody,
      };
      const updateResult = await Blogpost.updateOne(filter, updateDoc).exec();
      console.log(updateResult);
      res.redirect(`/post/${postId}`);
    });

    app.get("/post/:postId", async (req, res) => {
      const requiredPostId = req.params.postId;
      const filter = { _id: requiredPostId };
      const projection = {};
      const foundBlogPost = await Blogpost.findOne(filter, projection).exec();
      res.render("post", foundBlogPost);
    });

    app.post("/delete/:postId", async (req, res) => {
      const postId = req.params.postId;
      const filter = { _id: postId };
      const result = await Blogpost.deleteOne(filter).exec();
      res.redirect("/");
    });
  } catch (e) {
    console.error(e.message);
  }
}

app.get("/construct", async (req, res) => {
  res.render("construct", { pageTitle: "Construct" });
});

app.get("/about", (req, res) => {
  res.render("about", { pageTitle: "About Us", pageContent: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { pageTitle: "Contact Us", pageContent: contactContent });
});
