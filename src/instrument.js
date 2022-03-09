const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InstrumentSchema = new Schema(
  {
    name: {
      type: String,

      trim: true,
    },
  },
  { timestamps: true }
);

const Instrument =
  mongoose.models.Instrument || mongoose.model("Instrument", InstrumentSchema);

exports.Instrument = Instrument;
exports.InstrumentSchema = InstrumentSchema;
