const User = require("../models/user");
const { Order } = require("../models/order");
//tribamo pozvati model da bi se uspilo traziti po tom modelu
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    //execute callback function, nakon findById funkcije koja prima id ce se vratiti user ili error
    if (err || !user) {
      //error ili nema usera
      return res.status(400).json({
        //status, sa json tekston, odnosno erroron
        error: "User not found",
      });
    }
    //ako nije error i ako se nade user, spremi ga u request objekt naziva profile
    req.profile = user;
    next(); //moramo ovo jer je ovo middleware, da se izvrsava dalje
  });
};
//citanje user profila, user spremljen u req.profile zbog middlewarea userById koji ga tu sprema, i zove se prije ove metode
exports.read = (req, res) => {
  req.profile.hashed_password = undefined; //ne saljemo hashed lozinku i salt
  req.profile.salt = undefined;
  return res.json(req.profile);
};
//update user profila, user spremljen u req.profile zbog middlewarea userById koji ga tu sprema, i zove se prije ove metode
exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id }, //id od usera
    { $set: req.body }, //u set spremi iz request body-a sve novo kao
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to perform this action",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
      next();
    }
  );
};
/* unutar narudzbe(Order model) ima referenca na user-a, pronalazimo Order te unutar nje
   pronadi user-a po user id iz profila iz requesta te popuni user-a sa id-om i name-om
   i sortiraj po kreiranim narudzbama-narudzbe */
exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(orders);
    });
};
