const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan"); //morgan middleware
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
require("dotenv").config(); //.env
//imports routes
const authRouters = require("./routes/auth");
const userRouters = require("./routes/user");
const categoryRouters = require("./routes/category");
const productRouters = require("./routes/product");
const braintreeRouters = require("./routes/braintree");
const orderRouters = require("./routes/order");

//app
const app = express();
//database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Database connect")); //nakon sto se izvrsi ovo gori zove se promise te se u konzoli ispisuje ovo
//middleware
app.use(morgan("dev"));
app.use(bodyParser.json()); //dohvacanje json data iz request body-a
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

//routes middleware
app.use("/api", authRouters); //bilo da sta koristimo i bilo kolko ruta uvik triba naznacit ovo /api prije te rute
app.use("/api", userRouters);
app.use("/api", categoryRouters);
app.use("/api", productRouters);
app.use("/api", braintreeRouters);
app.use("/api", orderRouters);

const port = process.env.PORT || 8000; //dohvati port iz .env ili ako se pravilno ne dohvati il nije def. onda neka bude 8000

app.listen(port, () => {
  //ovako radimo provjeru na kojem portu se slusa app
  console.log(`Server is running on port ${port}`);
}); //da aplikacija slusa na tom portu
