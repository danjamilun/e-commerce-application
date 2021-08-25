const User=require('../models/user');//get model user
const jwt=require('jsonwebtoken');//za generiranje signed token-a paket
const expressJwt=require('express-jwt');//za autorizacijsku provjeru
const {errorHandler}= require('../helpers/dbErrorHandler');
const { json } = require('body-parser');




exports.signup=(req,res)=>{ //exportanje funkcije 
    // console.log('req.body',req.body); //prikaz u konzoli sta smo poslali u body-u 
    const user=new User(req.body);//kreira se novi user baziran na tome sta se dobije iz request body-a
    user.save((err,user)=>{//nakon sto se dobije novi user baziran na request body-u sprema se to u bazu
      //moze se desiti greska ili je ispravno sve, sa tim sse bazi callback function
      if(err){//ako se desila greska
          return res.status(400).json({
              err: errorHandler(err) //error kao argument
          })
      }
      user.salt=undefined
      user.hashed_password=undefined
      res.json({//ako je normalno posalji respons odnosno user u json-u
          user
      })
    })
};
exports.signin=(req,res)=>{
    //pronadi usera u odnosu na email(find the user based on email)
    const {email,password}=req.body//dohvacamo email i password iz request bodya te spremamo 
    //zatim po emailu trazimo usera pomocu User modela
    User.findOne({email},(err,user)=>{//pronaci po email-u i zatim izvrsi arrow funkciju
        if(err || !user){
            return res.status(400).json({
                error:"User with that email doen not exist.Please sigup"
            });
        }
        //ako je user pronaden, provjeri da li odgovara navedeni email i password match
        //kreiraj autentikacijsku metodu u user modelu
        if(!user.authenticate(password)){//ako autentifikacija nije prosla u toj metodi definiranoj u models/user.js
            return res.status(401).json({//vracamo odgovor odnosno error
                error: 'Email and password dont match'
            })
        }
        //autentificirano je
        //generiraj signed token sa user id-om i secret-om
        const token=jwt.sign({_id:user._id}, process.env.JWT_SECRET)//kreiramo token sa id od usera koji je pronaden 
        //i secreta kljuca kojeg smo definirali unutar .env-a
        //u cookies-ima token cemo oznacat sa 't' sa vremenom isticanja
        res.cookie('t', token,{expired:new Date() + 9999})//prvi argument oznaka sa kojom cemo oznacavati
        //drugi sto oznacavamo, a treci vrijeme isticanja definiramo sa expired
        //zatim vracamo odgovor(res) sa useron i tokenon u frontend client
        const {_id, name, email, role}=user//iz usera uzimamo _id,name,email,role
        return res.json({token, user:{_id, email, name, role}})
        //vracamo token i usera a unutar usera sa gore povucenim podacima, moramo ih prvo povuc iz usera trenutnog
        //da bi slali u odgovoru
        
    });

};

//signout
//znaci samo tribamo ocistiti cookie iz response zahtjeva, odnosno token koji je tu spremljen
exports.signout=(req,res)=>{
    res.clearCookie('t')//ne zab da je ovo oznaka koju smo dali tokenu
    res.json({
        message: "Sigout success" 
    });
}
//middleware za provjeru pristupa(postavi se
//nad rutom koju stitimo, ako korisnik nije logiran nema prava pristupa)
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth",
});
//middleware za prijavljenog korisnika
exports.isAuth=(req,res,next)=>{
    //znaci ovaj middleware se izvrsava nakon requireSigin-a, userById-a te se radi usporedba
    //ovaj id je ruta za prijavljenog korisnika
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if(!user){//greska
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
};
//provjera da li je admin
exports.isAdmin=(req,res,next) =>{
    if(req.profile.role === 0){//0 je standardni korisnik, 1 je admin
        return res.status(403).json({
            //user is not admin
            error :'Admin resourse! Access denied'
        });
    }

    next();
};