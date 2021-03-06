var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var router = express.Router();


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = 3010;

// Initialize Express
var app = express();



var database = require("./models");


// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news", {
  useMongoClient: true
});

// Routes

app.get("/all", function(req, res){
  db.scrapeData.find({}, function(error,found){
    if (error){
      console.log(error);
    }
    else{
      res.json(found);
    }
  });
});




// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request

  axios.get("https://www.dogonews.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
     var result = {};


    // Now, we grab every h2 within an article tag, and do the following:
    $("#post-content").each(function(i, element) {
      

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
        result.img = $(this)
        .children("img")
        .attr("src");
       
        console.log(result);

      // Create a new Article using the `result` object built from scraping
      database.Article
        .create(result)
        .then(function(databaseArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
          
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  database.Article
    .find({})
    .then(function(databaseArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(databaseArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  database.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  database.Note
    .create(req.body)
    .then(function(databaseNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return database.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(databaseArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
 });

 // Delete note for article
app.get("/deletenote/:id", function(req, res){
  console.log(req.params.id)
  Note.remove({'_id': req.params.id}).exec(function(err, data){
    if(err){
      console.log(err);
    } else {
      console.log("Note deleted");
    }
  })
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
