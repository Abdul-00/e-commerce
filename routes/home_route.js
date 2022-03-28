const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();
const myuser=require('../models/user');
const myproduct=require('../models/prodotto');
const bcrypte=require('bcryptjs');


//Auth function
    const isAuth = (req, res, next) => {
        if (req.session.result) {
            next();
        } else {
            res.redirect('/login');
        }
    }


//MAIN ROOT
    router.get('/', isAuth, (req, res,next) =>{
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
                if(log){

                    //creare il token per l'accesso
                    req.session.result=myres;
                    //reindirizzare verso la home
                    return res.redirect('/');
                }else{
                    return res.redirect('/login');
                }
            });
        });
    });

//LOG-OUT
    router.get('/logout',(req,res)=>{
        req.session.destroy((err)=>{
            if(err) throw err;
            res.redirect('/');
        })
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
//Update user root
    router.get('/updateUser',(req,res)=>{
        
        //res.render('update_user',);
    });


//Upload Product route --->WHAITING FOR UPLOAD PAGE
   /*router.get('/Upload',isAuth,(req,res)=>{
        res.render('Upload-product');
    });*/

    router.get('/upload',(req,res)=>{
        var upload= new myproduct({

            categorie:"t-shirt",
            mf:"male",
            nome:"jeans couture",
            brand:"versace",
            usato: false,
            foto:{
                colore:"bianco",
                url:"t-shirt_versace.jpeg"
            },
            taglai_prezzo:{
                colore:"bianco",
                taglia:{
                    quantità:"20",
                    size:"M",
                    prezzo: 300
                }
            },
            dettagli:{
                composizione:"cotone",
                avvertenze:"EHHH",
                colletto:"crew",
                chiusura:"nessuna",
                tasche:"nessuna",
            },
            taglia_fit:{
                vestibilita:"normale",
                lunghezza:"normale",
                lunghezza_manica:"media",
                lung_delle_maniche:"media",
                lung_dello_schienale:"uniforme",
            }
        });
        upload.save();
        res.send("Inserimento completato");
    });

//Product-list Route 
    router.get('/product-list/:category',(req,res)=>{
        var cat=req.params.category;
        myproduct.find({categorie:cat},function(err,myres){
            if(err) return handleError(err);
            //contolli necessari sul risultato 
            var conta=myres.length;
            var mess;
            if(conta<1) return res.render('product-list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
            
            return res.render('product-list',{myres,mess});
        });
    });

module.exports=router;

