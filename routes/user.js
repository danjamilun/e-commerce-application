const express=require('express')
const router=express.Router()

const {
    requireSignin, isAuth, isAdmin
}=require('../controllers/auth');
const {
    userById, read, update, purchaseHistory
}=require('../controllers/user');
//test, znaci pozivon ove rute /secret/:userId navodi se id te se radi pretraga po onoj doli navedenoj metodi
router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req,res) =>{
    res.json({
        user: req.profile
    });
});
//ruta za citanje profila od usera, tj da user moze ocitati svoj profil
router.get('/user/:userId', requireSignin, isAuth, read);

//ruta za update-anje profila od usera, tj da user moze update-ati profil
router.put('/user/:userId', requireSignin, isAuth, update);

// dohvat povesti narudzbi za odredenog user-a
router.get("/orders/by/user/:userId", requireSignin, isAuth, isAdmin, purchaseHistory);

//znaci svaki put kada se kao parametar rute navede naziv userId izvrsava se metoda userById
//ovo je kao middleware 
router.param('userId',userById);//param - znaci parametar

module.exports=router;