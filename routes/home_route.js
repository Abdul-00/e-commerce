const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();
const myuser=require('../models/user');
const myproduct=require('../models/prodotto');
const bcrypte=require('bcryptjs');
//MAIN ROOT
router.get('/', (req, res) =>{
    res.render('home_page');
});

//Login root
    router.get('/login' ,(req,res) =>{
        res.render('login');
    });

    router.post('/login', async (req,res) =>{
        var result=req.body;
        
        //query per verificare i dati
        myuser.findOne({ 'email':result.email},async function(err,myres){
            if (err) return handleError(err);
            console.log(myres.password);

            //comparazione delle due password
            bcrypte.compare(result.password,myres.password,function(err,log){
                console.log(log);
                // if log true then start session 
            });
        });
        //creare il token per l'accesso
        //reindirizzare verso la home
    });

//Registration root
    router.get('/register',(req,res)=>{
        const infoErrorObj= req.flash('infoError');
        const infoSubmitObj= req.flash('infoSubmit');
        res.render('register',{infoErrorObj,infoSubmitObj});
    });

    router.post('/register', async (req,res)=>{
        var result=req.body;
        //verificare i dati
        console.log(result.password[0].length);
        if(result.email[0]!=result.email[1] || result.password[0]!=result.password[1] || result.codice_fiscale.length>16 || result.codice_fiscale.length<16 || result.password[0].length<8){
            req.flash('infoError'," Errore di compilazione");
            res.redirect('/register');
            return;
        };
        //query se esite gia un utente con la mail inserita o codicefiscale
        myuser.findOne({ $or:[{'email':result.email[0]},{'codicefiscale':result.codice_fiscale}] },async function (err, myres) {
                if (err) return handleError(err);
                console.log(myres);
                if (myres) {
                    req.flash('infoError'," Errore di compilazione");
                    res.redirect('/register');
                    return;
                }
                console.log("okay");
                req.flash('infoSubmit','Registrazione Completata');
                res.redirect('/register');
                //hash the password
                bcrypte.hash(result.password[0], 10 , function(err, hash) {
                    //save data to db
                    var registration= new myuser({
                        nome: result.nome,
                        cognome: result.cognome,
                        data_nascita: result.data_nascita,
                        codicefiscale: result.codice_fiscale,
                        email: result.email[0],
                        password: hash,
                    });
                    registration.save();
                });

            })

        //mandare email di avvenuta registraione <-----Opzionale

    });

//General Porpuse
router.get('/find',(req,res)=>{

    /*var ali = mongoose.model('user');

    ali.find({ 'nome': 'ali' }, function (err, result) {
        if (err) return handleError(err);
        res.send(result);
        })
    */
});

//ROOTE PROVA
    router.get('/product-list',(req,res)=>{
        res.render('product-list')
    });

module.exports=router;

