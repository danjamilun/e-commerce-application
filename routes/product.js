const express = require("express");
const router = express.Router();

const {
  //metoda za kreiranje produkta,citanje producta by id metoda, brisanje produkta, update produkta, dohvat svih produkata i doh. related produkata
  create,
  productById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
  updateRate,
} = require("../controllers/product"); //od controllers/product dohvacamo funckiju create koja je definirana unutar {}
//tribaju nam ovi middlewarei jer ce jedino admin imat pravo dodavanja kreiranja producta, pa se radi provjera
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
//triba nam metoda userById jer se zahtjeva id za izradu kao tko izraduje
const { userById } = require("../controllers/user");

//rute
//dohvat pojedinog produkta
router.get("/product/:productId", read);
//ruta kojom se zove create metoda za kreiranje produkta
router.post(
  "/product/create/:userId", //prvo se pozivaju svi navedeni middlwarei a tek onda metoda create
  requireSignin,
  isAuth,
  isAdmin,
  create
);
//ruta za brisanje produkta, zahtjeva id od produkta kojeg se brise i id od usera jer samo admin smi brisat
router.delete(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
//ruta za update podataka, provjera korisnika i id od proizvoda koji se update-a
//put sluzi za update
router.put(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
//ruta za dohvat svih proizvoda odnosno produkata
router.get("/products", list);

router.get("/products/search", listSearch); //get za dohvat po pretragi
//ruta za dohvat related products
router.get("/products/related/:productId", listRelated);
//ruta za dohvat svih kategorija po produktu, odnosno svih koristenih kategorija u produktima
router.get("/products/categories", listCategories);
//ruta za product by search (pretraga za prikaz produkata)
router.post("/products/by/search", listBySearch); //post jer saljemo parametre pretrage
//ruta za dohvacanje photo odnosno slika za pojedini proizvod
router.get("/products/photo/:productId", photo);

//parametri ruta, kada se navede neki od ovih naziva u parametrama ruta onda se zovu odredeni middlewarei, odnosno oni navedeni iza zareza
router.param("userId", userById); //navodeci userId zove se userById metoda koja je definirana unutar controllers/user.js
router.param("productId", productById); //navodeci productId zove se metoda productById koja je definirana unutar controllers/product.js
module.exports = router;
