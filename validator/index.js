exports.userSignupValidator=(req, res,next)=>{ 
    req.check('name','Name is required').notEmpty()//provjera za ime, ako ime nije dano odnosno ako nema nista ispisat ce se poruka(drugi argument)
    req.check('email','Email must be between 3 to 32 characters ')
        .matches(/.+\@.+\..+/)//provjera da imamo ovo u emailu, staviti unutar oznaka / /
        .withMessage('Email must contain @')//ako se linija prije ne ispuni salji poruku
        .isLength({//duzina email-a, pazi na zagrade
            min:4,
            max:32
        });
    req.check('password','Password is required').notEmpty()
    req.check('password')
        .isLength({min:6})
        .withMessage('password must contain at least 6 characters')
        .matches(/\d/)//makar jedan digit(broj)
        .withMessage('Password must contain a number') 
        //ako postoji greska dohvati je 
        const errors=req.validationErrors()//validationErrors dohvaca gresku ako je ima u req
        if(errors){//ako je errors true odnosno ako postoji errors
            const firstError=errors.map(error => error.msg)[0];
            return res.status(400).json({error: firstError});
            /*znaci ako je error uhvacen ulazi se u if, mapiramo errore tako da dohvacamo prvi error iz niza errora
            te ga vracamo u responsu(res) sa statuson 400 i json odgovoron koji ce prikazati error: i odgovarajuću
            poruku, ako ima jos errora ispisuje se prvo prvi u nizu, pa kad se od rjesi slat ce se opet zahtjev
            i ispisat drugi po redu, dok se ne rjesu svi iz niza errora */

        }
        next();
};