const express=require('express')
const router=express.Router()


const { //metoda za kreiranje kategorije, dohvat i citanje kategorije po id, update-anje kategorije te brisanje
    create,
    categoryById,
    read,
    update,
    remove,
    list
}=require('../controllers/category');//od controllers/category dohvacamo funckiju create koja je definirana unutar {}
//tribaju nam ovi middlewarei jer ce jedino admin imat pravo dodavanja kreiranja kategorija, pa se radi provjera
const {
    requireSignin, isAuth, isAdmin
}=require('../controllers/auth');
//triba nam metoda userById jer se zahtjeva id za izradu kao tko izraduje
const {
    userById
}=require('../controllers/user');
//ruta kojom se zove create metoda
router.post('/category/create/:userId',//prvo se pozivaju svi navedeni middlwarei a tek onda metoda create
            requireSignin,
            isAdmin,
            isAdmin,
            create
);
//ruta za upadate-anje kategorije, triba bit navaden id od kategorije i usera
router.put('/category/:categoryId/:userId',//prvo se pozivaju svi navedeni middlwarei a tek nakon njih metoda update
            requireSignin,
            isAdmin,
            isAdmin,
            update
);
//ruta za brisanje kategorije, id od kategorije i user id
router.delete('/category/:categoryId/:userId',//prvo se pozivaju svi navedeni middlwarei a tek nakon njih metoda delete
            requireSignin,
            isAdmin,
            isAdmin,
            remove
);
//ruta za dohvacanje odredene kategorije, navodeci id od kategorije
router.get('/category/:categoryId', read);
//ruta za dohvacanje svih kategorija
router.get('/categories', list);

//parametri ruta, kada se navede neki od ovih naziva u parametrama ruta onda se zovu odredeni middlewarei, odnsosno oni navedeni iza zareza
router.param('categoryId', categoryById);
router.param('userId',userById);//navodeci userId zove se userById metoda koja je definirana unutar kontrolora i user.js
module.exports=router;
