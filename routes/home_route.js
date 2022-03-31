const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();
const myuser=require('../models/user');
const myproduct=require('../models/prodotto');
const bcrypte=require('bcryptjs');
const { update, updateOne } = require('../models/user');


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
            //comparazione delle due password
            bcrypte.compare(result.password,myres.password,function(err,log){
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
        if(result.email[0]!=result.email[1] || result.password[0]!=result.password[1] || result.codice_fiscale.length>16 || result.codice_fiscale.length<16 || result.password[0].length<8 || result.numero_cell.length<10 || result.numero_cell.length>10){
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
                    if(err) throw handleError(err);
                    //save data to db
                    var registration= new myuser({
                        nome: result.nome,
                        cognome: result.cognome,
                        data_nascita: result.data_nascita,
                        codicefiscale: result.codice_fiscale,
                        numeroTelefono:result.numero_cell,
                        email: result.email[0],
                        password: hash,
                    });
                    registration.save();
                });

            })

        //mandare email di avvenuta registraione <-----Opzionale

    });

//Update user root
    router.get('/updateUser', isAuth ,(req,res)=>{
        //user from session
        var user=req.session.result;
        /**the line bellow is used to get only the date 
         *console.log(user.data_nascita.toISOString().split('T')[0]);
        **/
        const infoErrorObj= req.flash('infoError');
        const infoSubmitObj= req.flash('infoSubmit');
        res.render('update_user',{infoErrorObj,infoSubmitObj,user});
    });

    router.post('/updateUser',isAuth, async (req,res)=>{
        //user from session
        var user=req.session.result;
        var result=req.body;
        if(result.email[0]!=result.email[1] || result.password[0]!=result.password[1] || result.codice_fiscale.length>16 || result.codice_fiscale.length<16 || result.password[0].length<8 || result.numero_cell.length<10 || result.numero_cell.length>10){
            req.flash('infoError'," Errore di compilazione");
            res.redirect('/updateUser');
            return;
        };

        bcrypte.hash(result.password[0],10, async function(err,hash){
            if(err) throw handleError(err);
            await myuser.findByIdAndUpdate(user._id,{
                nome: result.nome,
                cognome: result.cognome,
                data_nascita: result.data_nascita,
                codicefiscale: result.codice_fiscale,
                numeroTelefono:result.numero_cell,
                email: result.email[0],
                password: hash,
            });
        });
        
        bcrypte.compare(result.password[0],user.password,function(err,bool){
            if(err) throw handleError(err);
            if(bool & result.email[0]==user.email){
                req.flash('infoSubmit',"Aggiornamento Completato");
                return res.redirect('/updateUser');
            }else{
                return res.redirect('/logout');
            }
        });

    });


//Personal Profile root
    router.get('/profilo',isAuth, async(req,res)=>{
        var user_s=req.session.result;

        myuser.findById(user_s._id,function(err,myres){
            if(err) return handleError(err);
            return res.render('pagina_profilo',{myres}); 
        });
    
    });
    
    //ADD ADDRESS ROOT
        router.post('/addAdress',isAuth, async(req,res)=>{
            //my var
            var user=req.session.result;
            var data=req.body;
        
            await myuser.findByIdAndUpdate(user._id,{$push:{
                indirizzi:{
                    via:data.via,
                    numero_civico:data.numero_civico,
                    citta:data.citta,
                    cap:data.cap,
                }
            }});
            return res.redirect('/profilo');

        })
    //Delete Address ROOT
        router.get('/deleteAddress/:indice', isAuth,async(req,res)=>{
            var parm=req.params.indice;
            var user=req.session.result;
            console.log(parm);
            myuser.updateOne({ _id: user._id }, { "$pull": { "indirizzi": { "_id": parm } }}, { safe: true, multi:true }, function(err, obj) {
                if(err)return handleError(err);
                return res.redirect('/profilo');
            });
            
        });

        //ADD CARD ROOT
        router.post('/addCard',isAuth, async(req,res)=>{
            //my var
            var user=req.session.result;
            var data=req.body;
        
            await myuser.findByIdAndUpdate(user._id,{$push:{
                carte:{
                    nome_carta:data.nome_carta,
                    numero_carta:data.numero_carta,
                    scadenza:data.scadenza,
                    cvv:data.cvv,
                }
            }});
            return res.redirect('/profilo');

        })
    //Delete CARD ROOT
        router.get('/deleteCard/:indice', isAuth,async(req,res)=>{
            var parm=req.params.indice;
            var user=req.session.result;
            myuser.updateOne({ _id: user._id }, { "$pull": { "carte": { "_id": parm } }}, { safe: true, multi:true }, function(err, obj) {
                if(err)return handleError(err);
                return res.redirect('/profilo');
            });
            
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



//temp
    router.get('/input',(req,res)=>{
        res.render('inserisci_abbigliamento');
    });

module.exports=router;

