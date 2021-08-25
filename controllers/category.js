const Category=require('../models/category')
const {errorHandler}= require('../helpers/dbErrorHandler');

//middleware
exports.categoryById=(req, res, next, id)=>{
    //nakon sto nademo kategoriju by id, execute metodu koja ce nam dati ili error ili kategoriju 
    Category.findById(id).exec((err, category)=>{
        if(err || !category){
            return res.status(400).json({
                error: 'Category does not exist'
            });
        }
        req.category = category; //kada je nademo spremimo u request objekt
        next();
    });

};
//dohvat odredene kategorije, prije read metode je bio pozvan middleware categoryById
exports.read=(req, res)=>{
    //znaci samo tribamo vratiti kategoriju spremljenu u request objektu(definirano unutar categoryById)
    return res.json(req.category);
}
//kreiranje kategorije
exports.create=(req,res)=>{
    const category=new Category(req.body);
    category.save((err,data)=>{//ovo data je kao ako se uredno kreira kategorija
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({data});//ako je sve oke vraca se data odnosno kreirana kategorija

    });

};
//update-anje kategorije
exports.update=(req,res)=>{
    const category= req.category// dohvat postojece kategorije iz request objekta da bi se update-alo
    category.name= req.body.name;// dohvat iz body-a nove informacije odnosno samo name jer kategorija ima samo name
    category.save((err, data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
}

//brisanje kategorije
exports.remove=(req,res)=>{
    const category = req.category;
    category.remove((err, data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Category deleted'
        });
    });
}

//dohvat svih kategorija
exports.list=(req,res)=>{
    //find daje sve kategorije
    Category.find().exec((err, data)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data)
    });
};
