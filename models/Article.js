var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  //  short: {
  //   type: String,

  // },
  link: {
    type: String,
    required: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Model creation with the previously created schema.
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
