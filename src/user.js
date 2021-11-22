const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    name: {
      type: String,

      trim: true,
    },
    nickname: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    birth_date: {
      type: Date,
    },
    address: {
      type: String,
    },
    instruments: [
      {
        name: { type: String },
      },
    ],
    avatar: {
      url: { type: String },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UsersSchema);

exports.User = User;
exports.UsersSchema = UsersSchema;
