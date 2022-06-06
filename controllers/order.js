const { Order, CartItem } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

// dohvacanje narudzbe po order id-u
exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }

      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  // console.log("CREATE ORDER: ", req.body);
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error),
      });
    }
    res.json(data);
  });
};

exports.listOrders = (req, res) => {
  // Order.find() pronalazi sve order(narudzbe) te dohvaca od user-a id, name i adresu te to kreira ka orders
  // i nakon toga cemo to dohvacat u front-endu
  Order.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error),
        });
      }
      res.json(orders);
    });
};

// na ovaj nacin mozemo poslati enumValues za status na front-end
exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateOrderStatus = (req, res) => {
  Order.updateOne(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(order);
    }
  );
};
// za filtriranje po statusu
exports.listBySearch = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
   //za prikaz produkata, po defultu ce se prikazati 6 ili 8 produkata, a ako se izabere na prikazi vise prikazat ce se vise
  let findArgs = {}; //argument objekt, u njega stavljamo filtere po kojima filtriramo (category id i price range)

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    findArgs[key] = req.body.filters[key]; //category
    console.log(findArgs[key]);
  }

  Order.find(findArgs)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Orders not found",
        });
      }
      res.json({
        size: data.length, //kolko je proizvoda
        data,
      });
    });
};
