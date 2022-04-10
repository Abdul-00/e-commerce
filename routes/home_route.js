const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();
const myuser=require('../models/user');
const myabbigliamento=require('../models/abbigliamento');
const myscarpe=require('../models/scarpe');
const myaccessori=require('../models/accessori');
const mygioielli=require('../models/gioielli');
const myorologi=require('../models/orologi');
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
    router.get('/',(req, res) =>{
        res.render('home_page');
    });

//Login root
    router.get('/login' ,(req,res,next) =>{
        res.render('login');
    });

    router.post('/login', async (req,res) =>{
        var result=req.body;
        
        //query per verificare i dati
        myuser.findOne({ 'email':result.email},async function(err,myres){
            if (err) return handleError(err);
            if(myres){
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
            }else{
                return res.redirect('/login');
            }
            
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
                iban:result.iban,
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

    //Delete user Root
        router.get('/eliminaProfilo',isAuth,(req,res)=>{
            res.render('delete_account');
        });

        router.post('/eliminaProfilo',isAuth,(req,res)=>{
            var data=req.body;
            var user=req.session.result;
            if(data.email==user.email){
                bcrypte.compare(data.password,user.password,function(err,log){
                    if(err) throw handleError(err);
                    if(log){
                        myuser.findByIdAndDelete(user._id,(err,res)=>{
                            if(err) throw handleError(err);
                        });
                        res.redirect('/logout');
                    }else{
                        res.redirect('/eliminaProfilo');
                    }
                });
            }
            else{
                res.redirect('/eliminaProfilo');
            }

        });

//Choose prodotto and Add iban
    router.get('/chooseProduct',isAuth,(req,res)=>{
        var user= req.session.result;
        var flag=null;
        myuser.find({_id:user._id},('iban'),function(err,myres){
            if(err) return handleError(err);
            if(myres[0].iban){
                flag=true;
                res.render('choose-prodotto',{flag});
            }else{
                flag=false;
                res.render('choose-prodotto',{flag});
            }
        });
    });

    //Add IBAN
    router.post('/addIban',isAuth,async(req,res)=>{
        var user=req.session.result;
        var iban=req.body;
        await myuser.findByIdAndUpdate(user._id,{
            iban:iban.iban
        });
        res.redirect('/chooseProduct');
    })


//Upload Product route
    //A SECONDA DEL PARAMETRO PASSATOMI DA "choose-prodotto" RENDERIZZO LA PAGINA GIUSTA    
    router.get('/uploadType/:type',isAuth,(req,res)=>{
            var type=req.params.type;
            var myroute="inserisci_"+type;
            const infoErrorObj= req.flash('infoError');
            const infoSubmitObj= req.flash('infoSubmit');
            res.render(myroute,{infoErrorObj,infoSubmitObj});
        });
        
    // INPUT_ABBIGLIAMENTO
    router.post('/upload_abbigliamento',isAuth,async(req,res)=>{
        var data=req.body;
        var user=req.session.result;
        var sezione=["","",""];
        if(data.sesso=='null' || data.categoria=='null' || data.usato=='null' ||data.taglia=='null' || data.vestibilita=='null'){
            req.flash('infoError','Errore di Compilazione "nelle opzioni a tendina"');
            return res.redirect('/uploadType/abbigliamento');
        }
        else{

            if(data.categoria=="tshirt_polo" || data.categoria=="camicia" || data.categoria=="maglieria" || data.categoria=="giacca" || data.categoria=="cappotto"){
                //controllo parte superiore
                if(data.composizione_superiore=="" || data.colore_superiore=="null" || data.cm_manica_superiore=="" || data.cm_schienale_superiore==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione superiore"!');
                    return res.redirect('/uploadType/abbigliamento');
                }else{
                    req.flash('infoSubmit','Inserimento completato');
                    sezione[0]="superiore";
                }
            }else{
                if(data.categoria=="jeans" || data.categoria=="pantalone"){
                    //controllo parte inferiore
                    if(data.composizione_inferiore=="" || data.colore_inferiore=="null" || data.cm_gamba_interna_inferiore=="" || data.cm_gamba_esterna_inferiore==""){
                        req.flash('infoError','!Errore di Compilazione "Nella sezione inferiore"!');
                        return res.redirect('/uploadType/abbigliamento');
                    }else{
                        req.flash('infoSubmit','Inserimento completato');
                        sezione[1]="inferiore";
                    }
                }else{
                    //Controllo completo
                    if(data.composizione=="" || data.colore=="null" || data.cm_gamba_interna=="" || data.cm_gamba_esterna=="" || data.cm_manica=="" || data.cm_schienale==""){
                        req.flash('infoError','!Errore di Compilazione "Nella sezione completo"!');
                        return res.redirect('/uploadType/abbigliamento');
                    }else{
                        req.flash('infoSubmit','Inserimento completato');
                        sezione[2]="completo";
                    }
                    
                }
            }
            //contollo compilazione campo condizioni
            if(data.usato=="true" & data.condizione=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Condizione prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/abbigliamento');
            }
            if(data.colore_1=="null" || data.colore_2=="null" || data.colore_3=="null" || data.colore_4=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Colore Immagine"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/abbigliamento');
            }

        }
        //CONTROLLI SUL PREZZO . AL POSTO DELLA ,
        var prezzo=data.prezzo.replace(',','.');
        console.log(prezzo);
        //brand in minuscolo
        var brand=data.brand.toLowerCase();
        brand=brand.replace(' ','_');
        console.log(brand);
        //save imagine
        var fileKeys = Object.keys(req.files);

        fileKeys.forEach(function(key) {
            var upload_path='../e-commerce/public/upload/'+user._id+req.files[key].name;
            req.files[key].mv(upload_path, function(err) {
                if (err) return console.log(err);
            });
        });
        //QUERY SUPERIORE
        if(sezione[0]=="superiore" & sezione[1]=="" & sezione[2]==""){
            var upload= new myabbigliamento({
                categoria:data.categoria,
                sesso:data.sesso,
                nome_prodotto:data.nome_prodotto,
                brand:brand,
                second_hand:{usato:data.usato,condizione:data.condizione},
                foto:[{
                    colore:data.colore_1,
                    url: user._id+req.files.immagine1.name,
                },{
                    colore:data.colore_2,
                    url:user._id+req.files.immagine2.name,
                },{
                    colore:data.colore_3,
                    url:user._id+req.files.immagine3.name,
                },{
                    colore:data.colore_4,
                    url:user._id+req.files.immagine4.name,
                }],
                prodotti_disponibili:[{
                    colore:data.colore_superiore,
                    taglia:{
                        quantita:data.quantita,
                        size:data.taglia,
                        prezzo:prezzo
                    }
                }],
                dettagli:{
                    composizione:data.composizione_superiore,
                    descrizione:data.descrizione,
                    avvertenze:data.avvertenze
                },
                taglia_fit:{
                    vestibilita:data.vestibilita,
                    cm_manica:data.cm_manica_superiore,
                    cm_schienale:data.cm_schienale_superiore,
                },
                utente:user._id
            });
            upload.save();
        }
        // QUERY INFERIORE
        if(sezione[0]=="" & sezione[1]=="inferiore" & sezione[2]==""){
            var upload= new myabbigliamento({
                categoria:data.categoria,
                sesso:data.sesso,
                nome_prodotto:data.nome_prodotto,
                brand:brand,
                second_hand:{usato:data.usato,condizione:data.condizione},
                foto:[{
                    colore:data.colore_1,
                    url:user._id+req.files.immagine1.name,
                },{
                    colore:data.colore_2,
                    url:user._id+req.files.immagine2.name,
                },{
                    colore:data.colore_3,
                    url:user._id+req.files.immagine3.name,
                },{
                    colore:data.colore_4,
                    url:user._id+req.files.immagine4.name,
                }],
                prodotti_disponibili:[{
                    colore:data.colore_inferiore,
                    taglia:{
                        quantita:data.quantita,
                        size:data.taglia,
                        prezzo:prezzo
                    }
                }],
                dettagli:{
                    composizione:data.composizione_inferiore,
                    descrizione:data.descrizione,
                    avvertenze:data.avvertenze
                },
                taglia_fit:{
                    vestibilita:data.vestibilita,
                    cm_gamba_interna:data.cm_gamba_interna_inferiore,
                    cm_gamba_esterna:data.cm_gamba_esterna_inferiore
                },
                utente:user._id
            });
            upload.save();
        }

        //QUERY COMPLETO
        if(sezione[0]=="" & sezione[1]=="" & sezione[2]=="completo"){
            var upload= new myabbigliamento({
                categoria:data.categoria,
                sesso:data.sesso,
                nome_prodotto:data.nome_prodotto,
                brand:brand,
                second_hand:{usato:data.usato,condizione:data.condizione},
                foto:[{
                    colore:data.colore_1,
                    url:user._id+req.files.immagine1.name,
                },{
                    colore:data.colore_2,
                    url:user._id+req.files.immagine2.name,
                },{
                    colore:data.colore_3,
                    url:user._id+req.files.immagine3.name,
                },{
                    colore:data.colore_4,
                    url:user._id+req.files.immagine4.name,
                }],
                prodotti_disponibili:[{
                    colore:data.colore,
                    taglia:{
                        quantita:data.quantita,
                        size:data.taglia,
                        prezzo:prezzo
                    }
                }],
                dettagli:{
                    composizione:data.composizione,
                    descrizione:data.descrizione,
                    avvertenze:data.avvertenze
                },
                taglia_fit:{
                    vestibilita:data.vestibilita,
                    cm_manica:data.cm_manica,
                    cm_schienale:data.cm_schienale,
                    cm_gamba_interna:data.cm_gamba_interna,
                    cm_gamba_esterna:data.cm_gamba_esterna
                },
                utente:user._id
            });
            upload.save();
        }

        res.redirect('/uploadType/abbigliamento');
    });

    router.post('/upload_scarpe',isAuth,(req,res)=>{
        var data=req.body;
        var user=req.session.result;
        var sezione=["","","",""];
        
        if(data.sesso=='null' || data.categoria=='null' || data.usato=='null' ||data.taglia=='null' || data.colore=='null'){
            req.flash('infoError','Errore di Compilazione "nelle opzioni a tendina"');
            return res.redirect('/uploadType/scarpe');
        }
        else{

            //Controlli nelle sezione
            if(data.categoria=="scarpe"){
                if(data.materiale_scarpe=="" || data.solette_scarpe=="" || data.suola_scarpe=="" || data.fodera_scarpe==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione scarpe"!');
                    req.flash('infoSubmit',null);
                }else{
                    req.flash('infoSubmit','Compilato correttamente');
                    sezione[0]="scarpe";
                }

            }else{
                if(data.categoria=="scarpe_eleganti"){
                    if(data.materiale_scarpe_eleganti=="" || data.rivestimento_scarpe_eleganti=="" || data.solette_scarpe_eleganti=="" || data.suola_scarpe_eleganti=="" || data.fodera_scarpe_eleganti=="" || data.punta_scarpe_eleganti=="" || data.chiusura_scarpe_eleganti==""){
                        req.flash('infoError','!Errore di Compilazione "Nella sezione scarpe eleganti"!');
                        req.flash('infoSubmit',null);
                    }else{
                        req.flash('infoSubmit','Compilato correttamente');
                        sezione[1]="scarpe_eleganti";
                    }
                }else{
                    if(data.categoria=="stivali"){
                        if(data.materiale_stivali=="" || data.rivestimento_stivali=="" || data.solette_stivali=="" || data.suola_stivali=="" || data.fodera_stivali=="" || data.punta_stivale=="" || data.tacco_stivale=="" || data.chiusura_stivale==""){
                                req.flash('infoError','!Errore di Compilazione "Nella sezione Stivali"!');
                                req.flash('infoSubmit',null);
                        }else{
                                req.flash('infoSubmit','Compilato correttamente');
                                sezione[2]="stivali";
                        }

                    }else{
                        if(data.categoria=="mocassini"){
                            if(data.materiale_mocassini=="" || data.rivestimento_mocassini=="" || data.solette_mocassini=="" || data.suola_mocassini=="" || data.fodera_mocassini=="" || data.punta_mocassi=="" || data.chiusura_mocassini==""){
                                req.flash('infoError','!Errore di Compilazione "Nella sezione Mocassini"!');
                                req.flash('infoSubmit',null);
                            }else{
                                req.flash('infoSubmit','Compilato correttamente');
                                sezione[3]="mocassini";
                            }
                        }
                    }
                }
            }

            //contollo compilazione campo condizioni
            if(data.usato=="true" & data.condizione=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Condizione prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/scarpe');
            }
            if(data.colore_1=="null" || data.colore_2=="null" || data.colore_3=="null" || data.colore_4=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Colore Immagine"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/scarpe');
            }
        }
        
        //CONTROLLI SUL PREZZO . AL POSTO DELLA ,
        var prezzo=data.prezzo.replace(',','.');
        console.log(prezzo);
        //brand in minuscolo
        var brand=data.brand.toLowerCase();
        brand=brand.replace(' ','_');
        console.log(brand);

       //save imagine
        var fileKeys = Object.keys(req.files);

        fileKeys.forEach(function(key) {
            var upload_path='../e-commerce/public/upload/'+user._id+req.files[key].name;
            req.files[key].mv(upload_path, function(err) {
                if (err) return console.log(err);
            });
        });

        //Dettagli a seconsa della categoria
        var mydettagli;
        if(sezione[0]=="scarpe" & sezione[1]=="" & sezione[2]=="" & sezione[3]==""){
            console.log("sono in scarpe");
            mydettagli={
                composizione:data.materiale_scarpe,
                materiale_solette:data.solette_scarpe,
                materiale_suola:data.suola_scarpe,
                materiale_fodera:data.fodera_scarpe,
                descrizione:data.descrizione,
                avvertenze:data.avvertenze
            };
        }
        if(sezione[0]=="" & sezione[1]=="scarpe_eleganti" & sezione[2]=="" & sezione[3]==""){
            console.log("sono in scarpe eleganti");
            mydettagli={
                materiale_superiore:data.materiale_scarpe_eleganti,
                materiale_rivestimento:data.rivestimento_scarpe_eleganti,
                materiale_solette:data.solette_scarpe_eleganti,
                materiale_suola:data.suola_scarpe_eleganti,
                materiale_fodera:data.fodera_scarpe_eleganti,
                tipo_punta:data.punta_scarpe_eleganti,
                tipo_chiusura:data.tipo_chiusura,
                descrizione:data.descrizione,
                avvertenze:data.avvertenze
            };
        }
        if(sezione[0]=="" & sezione[1]=="" & sezione[2]=="stivali" & sezione[3]==""){
            console.log("sono in stivali");
            mydettagli={
                materiale_superiore:data.materiale_stivali,
                materiale_rivestimento:data.rivestimento_stivali,
                materiale_solette:data.solette_stivali,
                materiale_suola:data.suola_stivali,
                materiale_fodera:data.fodera_stivali,
                tipo_punta:data.punta_stivale,
                tipo_chiusura:data.chiusura_stivale,
                tacco:data.tacco_stivale,
                descrizione:data.descrizione,
                avvertenze:data.avvertenze
            };
        }
        if(sezione[0]=="" & sezione[1]=="" & sezione[2]=="" & sezione[3]=="mocassini"){
            console.log("sono in mocassini");
            mydettagli={
                materiale_superiore:data.materiale_mocassini,
                materiale_rivestimento:data.rivestimento_mocassini,
                materiale_solette:data.solette_mocassini,
                materiale_suola:data.suola_mocassini,
                materiale_fodera:data.fodera_mocassini,
                tipo_punta:data.punta_mocassi,
                tipo_chiusura:data.chiusura_mocassini,
                descrizione:data.descrizione,
                avvertenze:data.avvertenze
            };
        }


        //QUERY 
        var upload= new myscarpe({
            categoria:data.categoria,
            sesso:data.sesso,
            nome_prodotto:data.nome_prodotto,
            brand:brand,
            second_hand:{usato:data.usato,condizione:data.condizione},
            foto:[{
                colore:data.colore_1,
                url:user._id+req.files.immagine1.name
            },{
                colore:data.colore_2,
                url:user._id+req.files.immagine2.name
            },{
                colore:data.colore_3,
                url:user._id+req.files.immagine3.name
            },{
                colore:data.colore_4,
                url:user._id+req.files.immagine4.name
            }],
            prodotti_disponibili:[{
                colore:data.colore,
                taglia:{
                    quantita:data.quantita,
                    size:data.taglia,
                    prezzo:prezzo
                }
            }],
            dettagli:mydettagli,
            utente:user._id,
        });
        upload.save();
        
        res.redirect('/uploadType/scarpe');
    });

    //UPLOAD OROLOGI ROOT
    router.post('/upload_orologi',isAuth,(req,res)=>{
        var data=req.body;
        var user=req.session.result;

        if(data.tiplogia=="null" || data.categoria=="null" || data.usato=="null" || data.corredo=="null" || data.sesso=="null" || data.carica=="null"){
            req.flash('infoError','Errore di Compilazione "nelle opzioni a tendina"');
            return res.redirect('/uploadType/orologi');
        }
        else{
            //contollo compilazione campo condizioni
            if(data.usato=="true" & data.condizione=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Condizione prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/orologi');
            }
            if(data.anno_produzione.length>4 || data.anno_produzione.length<4){
                req.flash('infoError','!Errore di Compilazione "Anno non valido"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/orologi');
            }
        }
        req.flash('infoSubmit','Inserimento Completato');
        //CONTROLLI SUL PREZZO . AL POSTO DELLA ,
        var prezzo=data.prezzo.replace(',','.');
        console.log(prezzo);
        //brand in minuscolo
        var brand=data.marca.toLowerCase();
        brand=brand.replace(' ','_');
        console.log(brand);
       
        //save imagine
        var fileKeys = Object.keys(req.files);
        fileKeys.forEach(function(key) {
            var upload_path='../e-commerce/public/upload/'+user._id+req.files[key].name;
            req.files[key].mv(upload_path, function(err) {
                if (err) return console.log(err);
            });
        });
    
        //QUERY 
        var upload= new myorologi({
            categoria:data.categoria,
            tipologia:data.tipologia,
            modello:data.modello,
            sesso:data.sesso,
            brand:brand,
            corredo:data.corredo,
            second_hand:{usato:data.usato,condizione:data.condizione},
            foto:[
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name}
            ],
            quantita:data.quantita,
            prezzo:prezzo,
            dettagli:{
                anno_produzione:data.anno_produzione,
                carica:data.carica,
                descrizione:data.descrizone,
                avvertenze:data.avvertenze
            },
            taglia_fit:{
                mm_diametro:data.diametro,
            },
            utente:user._id,
        });
        upload.save();
        
        res.redirect('/uploadType/orologi');
    });


//Product-list Route  TEMP
    router.get('/product-list/:category&:subcategory',(req,res)=>{
        
        const cat=req.params.category;
        const subcat=req.params.subcategory;
        //Abbigliamento , sotto categorie e Brand
        if(req.params.category=="abbigliamento"){
            if(req.params.subcategory=="all"){
                myabbigliamento.find({},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    console.log(conta);
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    console.log("Abbigliamento all")
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="tshirt_polo" || subcat=="maglieria" || subcat=="jeans" || subcat=="giacca" || subcat=="cappotto" || subcat=="completo" || subcat=="camicia" || subcat=="pantalone"){
                myabbigliamento.find({categoria:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    console.log("abbigliamento categoria")
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="prada" || subcat=="dolce_gabbana" || subcat=="louis_vuitton" || subcat=="salvatore_ferragamo" || subcat=="bulgari" || subcat=="gucci" || subcat=="fendi" || subcat=="versace" || subcat=="Burberry"){
                myabbigliamento.find({brand:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento brand")
                    return res.render('product_list',{mess,myres});
                });
            }

        }
        // Scarpe,sotto categorie e Brand
        if(req.params.category=="scarpe"){
            
            if(req.params.subcategory=="all"){
                myscarpe.find({},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="scarpe" || subcat=="scarpe_eleganti" || subcat=="mocassini" ||subcat=="stivali"){
                myscarpe.find({categoria:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="prada" || subcat=="dolce_gabbana" || subcat=="louis_vuitton" || subcat=="salvatore_ferragamo" || subcat=="bulgari" || subcat=="gucci" || subcat=="versace"){
                myscarpe.find({brand:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }
        //OROLOGI
        if(req.params.category=="orologi"){
            
            if(req.params.subcategory=="all"){
                myorologi.find({},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="meccanico" || subcat=="automatico" || subcat=="vintage" || subcat=="cronografo" || subcat=="subacqueo" || subcat=="aviatore" || subcat=="militare" || subcat=="nautico"){
                myorologi.find({categoria:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="rolex" || subcat=="audemar_piguet" || subcat=="cartier" || subcat=="patek_philippe" || subcat=="bulgari" || subcat=="richard_mille" || subcat=="panerai"){
                myorologi.find({brand:subcat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }

    });

module.exports=router;

