var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  title: String,
  quality: String,
  body: String
});

// Model creation with the previously created schema.
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
