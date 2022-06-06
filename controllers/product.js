const formidable = require("formidable");
const _ = require("lodash"); //koristi se za update-anje najvise
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

//midlleware
exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product; //pronadeni produkt spremi u request objekt product, odnosno bit ce dostupan unutar req.product
      //znaci svaki put kada se ova metoda(middleware)poziva prije triba imat na umu da se produkt nalazi unutar req.product
      next();
    });
};
exports.read = (req, res) => {
  req.product.photo = undefined; //za sad ne saljemo sliku jer ce tako biti sporije
  //uglavnon sve osim slike saljemo jer je tako brze
  return res.json(req.product);
};
//kreiranje produkta
exports.create = (req, res) => {
  let form = new formidable.IncomingForm(); //dohvacanje forme
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    //check for all fields, provjera da su svi uneseni
    const { name, description, price, category, quantity, shipping, rate } =
      fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        //ako nije nesto uneseno
        error: "All fields are required",
      });
    }
    let product = new Product(fields); //kreira se product sa podacima koji su uneseni u formu

    // 1kb= 1000
    // 1mb= 1000000
    if (files.photo) {
      //ako je slika uploadana
      if (files.photo.size > 1000000)
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      //console.log("Files photo:",files.photo);// mozemo u konzoli viditi podatke o slici, velicina il nes
      product.photo.data = fs.readFileSync(files.photo.path); //da bi se dohvatila slika sa kompa i stavila u node.js server koristimo fs
      product.photo.contentType = files.photo.type; //.jpg
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};
//brisanje produkta
exports.remove = (req, res) => {
  //jer se prije pozvao middleware productById koja ce sadrzavati product unutar req.product
  //pa tako pristupamo productu
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    //ako je uspijesno izbrisan
    res.json({
      //deletedProduct,  //ovo za provjeru koji je proizvod izbrisan
      message: "Product deleted successfully",
    });
  });
};
//update-anje produkta
exports.update = (req, res) => {
  let form = new formidable.IncomingForm(); //dohvacanje forme
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    //za update-anje postojeceg producta sa novim podacima
    let product = req.product; //dohvat postojeceg produkta
    product = _.extend(product, fields); //lodash paket, extend prima za prvi argument postojeci produkt, a drugi arg. novi podaci za update

    // 1kb= 1000
    // 1mb= 1000000
    if (files.photo) {
      //ako je slika uploadana
      if (files.photo.size > 1000000)
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      //console.log("Files photo:",files.photo);// mozemo u konzoli viditi podatke o slici, velicina il nes
      product.photo.data = fs.readFileSync(files.photo.path); //da bi se dohvatila slika sa kompa i stavila u node.js server koristimo fs
      product.photo.contentType = files.photo.type; //.jpg
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};

/* 
  sell / arrival
  kreiranje metode koja ce dohvatiti parametar rute i bazirano na tome ce napraviti fetch podataka 
  iz baze i vratit frontend klijentu
  - ako zelimo vratiti produkt by sell definiramo query parametar na sljedeci nacin: 
  =/products?sortBy=sold&order=desc&limit=4, kao ako je limit 4 vraca se samo 4 proizvoda, sortira po sold-u
  - ako zelimo vratit produkt by arrival:
  =/products?sortBy=createdAt&order=desc&limit=4, ovo createdAt se stvara kada se kreira produkt, vidi u bazi
  - ako nema zadani parametara onda se svi proizvodi vracaju !!
*/
exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc"; //ako je postavljen order po tome kao odredi inace dohvati ascending ??
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"; //dohvati sortBy ako je postvaljen a ako nije sortiraj po defaultu po id-u
  let limit = req.query.limit ? parseInt(req.query.limit) : 6; //dohvati limit ako je postavljen a ako nije postavi ga na 6

  Product.find()
    .select("-photo") //deselektiraj photo jer je prekomplicirano ovako slat slike svih produkata
    .populate("category") //populiraj kategorije, kao dohvati i informacije o kategorijama za produkt
    .sort([[sortBy, order]]) //sortiraj po ovome
    .limit(limit) //dohvati limit ili uzmi onaj po defaultu
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      res.json(products);
    });
};
//metoda listRelated trazit ce produkte bazirano na req product category (odnosno bazirano na kategoriji produkta)
//odnosno vratit ce se svi produkti sa istom navedenom kategorijom
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  /*pronadi produkte po odredenoj kategoriji odnosno po istoj kategoriji koju ima produkt u request-u
    s tim da izlistas sve produkte osim toga u requestu, jer po njemu dohvacamo druge povezane pa nam on
    ne triba*/
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name") //dohvati i informacije o kategoriji ali odredene informacije, drugi argument koje odredene inf. ce dohvatiti
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      res.json(products);
    });
};
exports.listCategories = (req, res) => {
  //dohvat svih categories koji se nalazu i product modelu
  //prvi arg. sta dohvacamo, drugi query ali sad saljemo prazan, i treci callback funkcija
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};
/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip); //za prikaz produkata, po defultu ce se prikazati 6 ili 8 produkata, a ako se izabere na prikazi vise prikazat ce se vise
  let findArgs = {}; //argument objekt, u njega stavljamo filtere po kojima filtriramo (category id i price range)

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0], //0, donja granica
          $lte: req.body.filters[key][1], //10, gornja granica
        };
      } else {
        findArgs[key] = req.body.filters[key]; //category
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        size: data.length, //kolko je proizvoda
        data,
      });
    });
};
//middleware za dohvacanje slike za proizvode
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType); //jpg...
    return res.send(req.product.photo.data);
  }

  next();
};

exports.listSearch = (req, res) => {
  const query = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };

    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }

    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(products);
    }).select("-photo"); //ne mozemo slat i sliku jer bi to bilo presporo, pa stavljamo select( minus photo)
  }
};

exports.decreaseQuantity = (req, res, next) => {
  /* znaci dohvacamo iz order produkte te ih mapiramo jedan po jedan i za svaki od njih iz 
    narudzbe smanjivamo quantity za broj kolka je kolicina tog proizvoda narucena i povecavamo
    sold tj. broj kolko je prodane kolicine tog proizvoda
    UpdateOne(metoda koja updatea)
    filter-filtrira tipa po id-u
    update-update odredenog atributa ili karakteristike proizvoda */
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  // bulkWrite- metoda mongo baza za ubacivanje update-og za tipa proizvod u bazu
  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }

    next();
  });
};
