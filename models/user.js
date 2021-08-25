const mongoose=require('mongoose');//connect sa mongoose
const crypto=require('crypto');//password, kriptiranje
const {v1 : uuidv1}=require('uuid');//unique id verzija 1

const userSchema=new mongoose.Schema({//definiranje pravila, odnosno definiranje property-a sa tipovima i zahtjevima
    name:{
        type: String,
        trim:true,//odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
        required:true,//obavezan unos
        maxlength:32
    },
    email:{
        type: String,
        trim:true,//odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
        required:true,//obavezan unos
        maxlength:32,
        unique:32//jedinstveno
    },
    hashed_password:{
        type: String,
        required:true,//obavezan unos
        maxlength:50,
    },
    about:{
        type: String,
        trim:true,//odnsosno svaki razmak na pocetku i kraju bit ce otklonjen
    },
    salt:{
        type:String //string koji ce se koristit da se kreira jaka i duga lozinka 
    },
    role:{//dva usera: admin i standardni korisnik
        type:Number, //autentifikacija odnosno : 1-za admina, 0- za standardnog korisnika
        default:0 //svaki korisnik ce dobiti defaultnu vridnost

    },
    history:{//pamcenje povijesti user-a
        type:Array,
        default:[]

    }
},{timestamps:true}
);
//virtual field //virtualno polje

userSchema.virtual('password')//virtualno polje za password
.set(function(password){//password koja dolazi sa client side-a

    this._password=password
    this.salt=uuidv1()//UUID verzija 1// random string ce dati
    this.hashed_password=this.encryptPassword(password)//enkriptiraj password, koja dolazi od strane client side, prije spremanja
})
.get(function (){
    return this._password;

});

userSchema.methods={//ovako mozemo dodati metode u userSchema-u
    //prva metoda
    authenticate: function(plainText){//ovaj plainText predstavlja lozinku,passwoord koja se provjerava
        //usporedba koja ce vratiti true ili false, ako je true autentifikacija je prosla
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    //druga metoda
    encryptPassword:function(password){//funkcija sa argumentom password
        if(!password) return ''; //ako to nije lozinka ili nesto drugo uneseno vrati nas
        try{
            return crypto.createHmac('sha1',this.salt).update(password).digest('hex');//crateHmac je funkcija za kreiranje hash lozinke, ka argument uzima sha1 i this.salt odnosno uuid, zatim se update-a lozinka
                        
        }
        catch(err){
            return '';//ovo znaci vrati nista
        }
    }

};

module.exports=mongoose.model("User", userSchema);//kreiramo model po nazivon User baziran na userSchemi