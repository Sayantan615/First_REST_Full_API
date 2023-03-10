const express = require("express");
const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
// app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.mongoLink);
const schema = {
  Title: String,
  Content: String,
};
const Articles = mongoose.model(
  "Articles",
  new mongoose.Schema({ Title: String, Content: String }),
  "Articles"
);
app.get("/", function (req, res) {
  res.redirect("/articles");
});
app
  .route("/articles")
  .get(function (req, res) {
    async function findArticle() {
      try {
        const result = await Articles.find();
        // res.json(result);
        return result;
      } catch (e) {
        console.log(e.name, e.message);
      }
    }
    (async () => {
      const data = await findArticle();
      console.log(data);
      res.json(data);
    })();
  })
  .post(function (req, res) {
    if (req.body.Title === undefined || req.body.Content === undefined) {
      res.send("Please use 'Title' and 'Content'  instead");
    } else {
      const newArtical = new Articles({
        Title: req.body.Title,
        Content: req.body.Content,
      });
      newArtical.save(function (err) {
        if (err) console.log(err.name, err.message);
        else {
          res.send("Posted");
        }
      });
    }
  })
  .delete(function (req, res) {
    Articles.deleteMany({}, function (err) {
      if (!err) res.send("All articles deleted");
      else {
        console.log(err.name, err.message);
      }
    });
  });

///////////////////////////////// GET A PARTICULAR ARTICLE
app
  .route("/articles/:articleTitle")
  .get(function (req, res) {
    async function findOne() {
      const data = await Articles.findOne({ Title: req.params.articleTitle });
      if (data) {
        res.send(data);
      } else {
        res.send("No articles found, 404 0_0");
      }
      // Space character = %20
    }
    findOne();
  })
  .put(function (req, res) {
    Articles.updateOne(
      { Title: req.params.articleTitle },
      { Title: req.body.Title, Content: req.body.Content },
      { overwrite: true },
      function (err) {
        if (!err) {
          res.send("Updated");
        } else {
          console.log(err.name, err.message);
        }
      }
    );
  })
  .patch(function (req, res) {
    Articles.updateOne(
      { Title: req.params.articleTitle },
      { $set: req.body },
      function (err) {
        if (!err) {
          res.send("Patched");
        } else {
          console.log(err.name, err.message);
        }
      }
    );
  })
  .delete(function (req, res) {
    Articles.deleteOne({ Title: req.params.articleTitle }, function (err) {
      if (!err) res.send("The article deleted");
      else {
        console.log(err.name, err.message);
      }
    });
  });

app.listen(process.env.PORT || 8000, function () {
  console.log("listening on port 8000");
});
