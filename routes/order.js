const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById, addOrderToUserHistory } = require("../controllers/user");
const {
  create,
  listOrders,
  getStatusValues,
  orderById,
  updateOrderStatus,
  listBySearch,
} = require("../controllers/order");
const { decreaseQuantity } = require("../controllers/product");
//
router.post(
  "/order/create/:userId",
  requireSignin,
  isAuth,
  addOrderToUserHistory,
  decreaseQuantity,
  create
);
router.post("/order/by/search/:userId", requireSignin, isAuth, isAdmin, listBySearch);
// dohvat liste narudzbi
router.get("/order/list/:userId", requireSignin, isAuth, isAdmin, listOrders);
// dohvat statusa od narudzbe
router.get(
  "/order/status-values/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  getStatusValues
);
// postavljanje statusa za narudzbu, to jest update statusa narudzbe koji se promini
router.put(
  "/order/:orderId/status/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateOrderStatus
);

router.param("userId", userById);
router.param("orderId", orderById);
module.exports = router;
