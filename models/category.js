const mongoose = require("mongoose"); //connect sa mongoose

const categorySchema = new mongoose.Schema(
  {
    //definiranje pravila, odnosno definiranje property-a sa tipovima i zahtjevima
    name: {
      type: String,
      trim: true, //odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
      required: true, //obavezan unos
      maxlength: 32,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema); //kreiramo model po nazivon Category baziran na categorySchemi
