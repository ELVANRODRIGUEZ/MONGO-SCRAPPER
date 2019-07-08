var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var expHandleBars = require("express-handlebars");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger middleware for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow access to "public" folder.
app.use(express.static("public"));

// Set Handlebars.
app.engine("handlebars", expHandleBars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoWebSearch";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// ============================ Utilitay variables

var articleTitle;
var articleId;
var articleNotes;

// ============================ Routes

//A GET route for scraping the CNN sports website
app.get("/", function(req, res) {
  
  articleTitle = "";
  articleId = "";

  // First, we grab the body of the html with axios
  axios.get("https://www.eluniversal.com.mx/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // console.log(response);

    $(
      "div.view.view-home-opini-n.view-id-home_opini_n.view-display-id-panel_pane_4"
    ).each(function(i, element) {
      var scrappFound = {};

      // Add the text and href of every link, and save them as properties of the result object
      scrappFound.title = $(element)
        .find(".field-content.views-field-field-nombre-del-contenido")
        .children()
        .text();

      scrappFound.imageURL = $(element)
        .find(
          ".views-field.views-field-field-image-autor.views-field.views-field-field-image"
        )
        .find(".field-content")
        .find("img")
        .attr("data-src");

      scrappFound.writter = $(element)
        .find(".views-field.views-field-field-autor")
        .find("a")
        .text();

      scrappFound.link = $(element)
        .find(".field-content.views-field-field-nombre-del-contenido")
        .children()
        .attr("href");

      //   Test console.
      console.log(scrappFound);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(scrappFound)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Redirect to "/articles"
    res.redirect("/articles");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  if (!articleId || !articleTitle) {
    db.Article.find({})
      .sort({ createdAt: -1 })
      .then(function(dbArticle) {
        // Send found article back to the client
        console.log("here");
        res.render("articles", {
          article: dbArticle,
          selectedArticle: false
        });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  } else {
    db.Article.find({})
      .sort({ createdAt: -1 })
      .then(function(dbArticle) {
        // Send found article back to the client
        console.log("here");
        var haveNotes = false;
        if (articleNotes.length > 0) {
          haveNotes = true
        }

        res.render("articles", {
          article: dbArticle,
          selArticle: true,
          selArticleTitle: articleTitle,
          selArticleId: articleId,
          selArticleHaveNones: haveNotes,
          selArticleNotes: articleNotes
        });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  }
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      //   res.json(dbArticle);

      articleTitle = dbArticle.title;
      articleId = dbArticle._id;
      articleNotes = dbArticle.note;

      console.log(dbArticle.note);
      console.log(articleTitle);
      console.log(articleId);

      res.redirect("/articles");
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  //Test console.
  // console.log(req.body);

  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      
      // Test console.
      // console.log(dbNote);
      // console.log(articleNotes);

      articleNotes.push(dbNote)

      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { note: dbNote._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {

      res.redirect("/articles");
      
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

});

// Start the server
app.listen(PORT, function() {
  console.log("App running on http://localhost:" + PORT);
});
