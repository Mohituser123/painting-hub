const mongoose = require("mongoose");

const paintingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  medium: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Fix this: image should be full object with url and filename
  image: {
    url: {
      type: String,
      required: true,
    },
    filename: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Painting = mongoose.model("Painting", paintingSchema);
module.exports = Painting;
