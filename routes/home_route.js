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
    
   /* var awesome_instance = new myschema({ 'nome': 'alex','indirizzo':'via mario 25','email':'alex.b@gmail.com'});
    // Save the new model instance, passing a callback
    awesome_instance.save(function (err) {
    if (err) return handleError(err);
        res.send("controlla mongodb atlas");
    });*/
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
        if(result.email[0]!=result.email[1] || result.password[0]!=result.password[1] || result.codice_fiscale.lenght>16 || result.codice_fiscale.lenght<16 ){
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

        //creare il token per l'accesso
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

module.exports=router;

