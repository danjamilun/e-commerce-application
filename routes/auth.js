const express=require('express')
const router=express.Router()


const {signup,
    signin,
    signout,
    requireSignin
}=require('../controllers/auth');//od controllers/user  dohvacamo funckiju singup koja je definirana unutar {}
const {userSignupValidator}=require('../validator');//netriba definirat i /index jer mu se automatski pristupa

//signup
router.post('/signup',userSignupValidator, signup);//zatim userSignupValidator dodajemo prije signup radi provjere
//signin
router.post('/signin', signin);
//signout
router.get('/signout', signout);//get
module.exports=router;