const mongoose = require("mongoose"); //connect sa mongoose
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    //definiranje pravila, odnosno definiranje property-a sa tipovima i zahtjevima
    name: {
      type: String,
      trim: true, //odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
      required: true, //obavezan unos
      maxlength: 32,
    },
    description: {
      type: String,
      required: true, //obavezan unos
      maxlength: 200,
    },
    price: {
      type: Number,
      trim: true, //odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
      required: true, //obavezan unos
    },
    category: {
      type: ObjectId, //kada zelimo prikazati kategoriju produkta ide se u category model i zato se ovaj objektId koristi
      ref: "Category", //referenca kao na category model
      required: true, //jer produkt triba imat kategoriju
    },
    quantity: {
      //kolicina dostupnog proizvoda, kako se bude prodavalo smanjivat ce se broj
      type: Number,
    },
    sold: {
      // broj prodanog proizvoda
      type: Number,
      default: 0, //pocetna vrijednost 0 jer se jos nije prodano, kako se bude prodavalo povecavat ce se broj sold
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      //dostava
      required: false, //moze biti true ili false, ovisno o zahtjevu
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema); //kreiramo model po nazivon User baziran na userSchemi
