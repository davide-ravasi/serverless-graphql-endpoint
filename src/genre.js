const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    name: {
      type: String,

      trim: true,
    },
  },
  { timestamps: true }
);

const Genre = mongoose.models.Genre || mongoose.model("Genre", GenreSchema);

exports.Genre = Genre;
exports.GenreSchema = GenreSchema;
