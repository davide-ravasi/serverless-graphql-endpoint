const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { UsersSchema } = require("./user");

const BandsSchema = new Schema(
  {
    name: {
      type: String,

      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
    },
    foundation_date: {
      type: Date,
    },
    email: {
      type: String,
    },
    genres: [
      {
        name: { type: String },
      },
    ],
    videos: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    images: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    avatar: {
      name: { type: String },
      url: { type: String },
    },
    searching: [
      {
        name: { type: String },
      },
    ],
    members: [UsersSchema],
  },
  { timestamps: true }
);

const Band = mongoose.models.Band || mongoose.model("Band", BandsSchema);

exports.Band = Band;
exports.BandsSchema = BandsSchema;
