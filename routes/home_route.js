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


/*Funzione che permette di verificare l'identità dell'utente
*input-->session id
*output-->reindirizzamento alle pagine/root-->login,pagina richiesta o homepage
*/
    const isAuth = (req, res, next) => {
        if (req.session.result) {
            next();
        } else {
            res.redirect('/login');
        }
    }


/*Root principale Home Page
*input-->richiesta [localhost:3000]
*output-->reindirizzamento alle pagina/root-->homepage.ejs
*/
    router.get('/',(req, res) =>{
        res.render('home_page');
    });

/*Root di login per permettere ad un utente registrato di accedere*/
    /*get login
    *input-->richiesta di accesso
    *output-->login.ejs
    */
    router.get('/login' ,(req,res,next) =>{
        res.render('login');
    });
    /*Post login + controlli sui dati
    *input-->email e password
    *output-->reindirizzamento alle pagine/root-->home page,login,register
    */
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

/**Root di logout , permette di terminare la sessione personale iniziata con il login
 * input-->session id
 * output-->reindirizzamento alle pagine/root-->home_page.ejs */ 
    router.get('/logout',(req,res)=>{
        req.session.destroy((err)=>{
            if(err) throw err;
            res.redirect('/');
        })
    });

/**Root per permettere a un utente di registrarsi*/
    /**Get register 
     * input-->richiesta di registrazione
     * output-->reindirizzamento alle pagine/root-->register.ejs
    */
    router.get('/register',(req,res)=>{
        const infoErrorObj= req.flash('infoError');
        const infoSubmitObj= req.flash('infoSubmit');
        res.render('register',{infoErrorObj,infoSubmitObj});
    });
    /**Post register + controlli sui dati
     * input-->dati personali del utente + email,password e codicefiscale come identificativo univoco
     * output-->reindirizzamento alle pagine/root-->login.ejs 
    */
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

/**Route di aggiornamento dati utente */
    /**Get updateUser
     * input-->richiesta di aggiornamento
     * output-->reindirizzamento alle pagine/root-->update_user.ejs + campi pre compilati
    */
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
    /**Post updateUser + controlli
     * input-->informazio modificate
     * output-->reindirizzamento alle pagine/root-->update_user.ejs + messaggio di okay o fail
     */
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


/**Root profilo personale per vedere e modificare tutte le proprie informazioni
 * input-->richiesta profilo
 * output-->reindirizzamento alle pagine/root-->pagina_profilo.ejs + query sui dati personali 
 */
    router.get('/profilo',isAuth, async(req,res)=>{
        var user_s=req.session.result;

        myuser.findById(user_s._id,function(err,myres){
            if(err) return handleError(err);
            return res.render('pagina_profilo',{myres}); 
        });
    
    });
    
    /**Root per l'inserimento di nuove vie o metodi di pagamento*/
        /**Post addAddress
         * input-->nuovo indirizzo
         * output-->reindirizzamento alle pagine/root-->pagina_profilo.ejs 
        */
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
        /**get deleteAddress
         * input-->id indirizzo
         * output-->reindirizzamento alle pagine/root-->pagina_profilo.ejs 
        */
        router.get('/deleteAddress/:indice', isAuth,async(req,res)=>{
            var parm=req.params.indice;
            var user=req.session.result;
            console.log(parm);
            myuser.updateOne({ _id: user._id }, { "$pull": { "indirizzi": { "_id": parm } }}, { safe: true, multi:true }, function(err, obj) {
                if(err)return handleError(err);
                return res.redirect('/profilo');
            });
            
        });

        /**Post addCard
         * input-->nuova carta
         * output-->reindirizzamento alle pagine/root-->pagina_profilo.ejs 
        */
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
        /**Get DeleteCard
         * input-->id carta
         * output-->reindirizzamento alle pagine/root-->pagina_profilo.ejs
        */
        router.get('/deleteCard/:indice', isAuth,async(req,res)=>{
            var parm=req.params.indice;
            var user=req.session.result;
            myuser.updateOne({ _id: user._id }, { "$pull": { "carte": { "_id": parm } }}, { safe: true, multi:true }, function(err, obj) {
                if(err)return handleError(err);
                return res.redirect('/profilo');
            });
            
        });

    /**Root per eliminare un utente*/
        /**Get eliminaProfilo
         * input-->richiesta di eliminazione
         * output-->reindirizzamento alle pagine/root-->delete_account.ejs
        */
        router.get('/eliminaProfilo',isAuth,(req,res)=>{
            res.render('delete_account');
        });
        /**Post eliminaProfilo
         * input-->email e password + motivazione
         * output-->reindirizzamento alle pagine/root-->  /logout
        */
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

/**Root alla pagina per selezionare  il tipo di prodotto da vendere */
    /**Get chooseProduct + verifica se l'utente ha inserito l'iban
     * input-->richiesta di vendere un prodotto
     * output-->reindirizzamento alle pagine/root-->choose-prodotto.ejs
     */
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

    /**Post addIban aggiunge l'iban per ricevere i pagamenti
     * input-->l'iban
     * output-->reindirizzamento alle pagine/root--> /chooseProduct
    */
    router.post('/addIban',isAuth,async(req,res)=>{
        var user=req.session.result;
        var iban=req.body;
        await myuser.findByIdAndUpdate(user._id,{
            iban:iban.iban
        });
        res.redirect('/chooseProduct');
    })

/**Root per l'inserimento dei prodotti abbigliamento,scarpe,orologi,gioielli e accessori */

    /**Get uploadType A SECONDA DEL PARAMETRO PASSATOMI DA "choose-prodotto" RENDERIZZO LA PAGINA GIUSTA
     * input-->richiesta di inserimento del prodotto + il tipo di prodotto
     * output--> reindirizzamento alle pagine/root--> inserisci_"tipo prodotto".ejs
     */
    router.get('/uploadType/:type',isAuth,(req,res)=>{
            var type=req.params.type;
            var myroute="inserisci_"+type;
            const infoErrorObj= req.flash('infoError');
            const infoSubmitObj= req.flash('infoSubmit');
            res.render(myroute,{infoErrorObj,infoSubmitObj});
        });
        
    /**Post inserimento abbigliamento Controlli,inserimento immagini e query inserimento prodotto
     * input-->immagini e informazioni prodotto
     * output-->reindirizzamento alle pagine/root--> /uploadType/abbigliamento + messaggio di okay o fail
     */
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
    /**Post inserimento scarpe + controlli,inserimento immagini e query
     * input-->immagini + informazioni scarpe
     * output-->reindirizzamento alle pagine/root-->/uploadType/scarpe + messaggio di okay o fail
    */
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

    /**Post inserimento orologi + controlli,inserimento immagini e query
     * input-->immagini + informazioni orologi
     * output-->reindirizzamento alle pagine/root-->/uploadType/orologi + messaggio di okay o fail
    */
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
                descrizione:data.descrizione,
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
    /**Post inserimento GIOIELLI + controlli,inserimento immagini e query
     * input-->immagini + informazioni gioielli
     * output-->reindirizzamento alle pagine/root-->/uploadType/gioielli + messaggio di okay o fail
    */
    router.post('/upload_gioielli',isAuth,(req,res)=>{
        var user=req.session.result;
        var data=req.body;
        var materiali_carati,pendente;
        if(data.categoria=="null" || data.usato=="null" || data.more_materials=="null" || data.sesso=="null"){
            req.flash('infoError','Errore di Compilazione "nelle opzioni a tendina"');
            return res.redirect('/uploadType/gioielli');
        }
        else{

            if(data.more_materials=="no"){
                if(data.materiale1=="" || data.carati_materiale1==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione meteriale prodotto prodotto"!');
                    req.flash('infoSubmit',null);
                    return res.redirect('/uploadType/gioielli');
                }else{
                    materiali_carati=[{
                        materiale:data.materiale1,
                        carati:data.carati_materiale1
                    }];
                }
            }
            if(data.more_materials=="due"){
                if(data.materiale1=="" || data.carati_materiale1=="" || data.materiale2=="" || data.carati_materiale2==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione meteriale prodotto prodotto"!');
                    req.flash('infoSubmit',null);
                    return res.redirect('/uploadType/gioielli');
                }else{
                    materiali_carati=[{
                        materiale:data.materiale1,
                        carati:data.carati_materiale1
                    },{
                        materiale:data.materiale2,
                        carati:data.carati_materiale2
                    }];
                }
            }
            if(data.more_materials=="tre"){
                if(data.materiale1=="" || data.carati_materiale1=="" || data.materiale2=="" || data.carati_materiale2=="" || data.materiale3=="" || data.carati_materiale3==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione meteriale prodotto prodotto"!');
                    req.flash('infoSubmit',null);
                    return res.redirect('/uploadType/gioielli');
                }else{
                    materiali_carati=[{
                        materiale:data.materiale1,
                        carati:data.carati_materiale1
                    },{
                        materiale:data.materiale2,
                        carati:data.carati_materiale2
                    },{
                        materiale:data.materiale3,
                        carati:data.carati_materiale3
                    }];
                }
            }
            if(data.more_materials=="quattro"){
                if(data.materiale1=="" || data.carati_materiale1=="" || data.materiale2=="" || data.carati_materiale2=="" || data.materiale3=="" || data.carati_materiale3=="" || data.materiale4=="" || data.carati_materiale4==""){
                    req.flash('infoError','!Errore di Compilazione "Nella sezione meteriale prodotto prodotto"!');
                    req.flash('infoSubmit',null);
                    return res.redirect('/uploadType/gioielli');
                }else{
                    materiali_carati=[{
                        materiale:data.materiale1,
                        carati:data.carati_materiale1
                    },{
                        materiale:data.materiale2,
                        carati:data.carati_materiale2
                    },{
                        materiale:data.materiale3,
                        carati:data.carati_materiale3
                    },{
                        materiale:data.materiale4,
                        carati:data.carati_materiale4
                    }];
                }
            }
            //contollo compilazione campo condizioni
            if(data.usato=="true" & data.condizione=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Condizione prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/gioielli');
            }
            if(data.usato=="true" & data.provenienza=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione provenienza prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/gioielli');
            }
            if(data.anno.length>4 || data.anno.length<4){
                req.flash('infoError','!Errore di Compilazione "Anno non valido"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/gioielli');
            }
            if(data.categoria=="collana" || data.categoria=="orecchino"){
                if(data.categoria=="collana"){
                    pendente=data.pendente_collana;
                }else{
                    pendente=data.pendente_orecchino;
                }
            }else{
                pendente=null;
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

        //Query di inserimento
        var upload= new mygioielli({
            categoria:data.categoria,
            sesso:data.sesso,
            nome_prodotto:data.nome_prodotto,
            brand:brand,
            second_hand:{usato:data.usato,condizione:data.condizione},
            materiali_carati:materiali_carati,
            foto:[
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name},
                {url:user._id+req.files.immagine1.name}],
            quantita:data.quantita,
            prezzo:prezzo,
            dettagli:{
                anno_produzione:data.anno,
                provenienza:data.provenienza,
                descrizione:data.descrizione,
                avvertenze:data.avvertenze
            },
            taglia_fit:{
                mm_diametro:data.mm_diametro,
                mm_spessore:data.mm_spessore,
                cm_lunghezza:data.cm_lunghezza,
                pendente:pendente
            },
            utente:user._id,
        });
        upload.save();

        res.redirect('/uploadType/gioielli');

    });
    /**Post inserimento ACCESSORI + controlli,inserimento immagini e query
     * input-->immagini + informazioni accessori
     * output-->reindirizzamento alle pagine/root-->/uploadType/accessori + messaggio di okay o fail
    */
     router.post('/upload_accessori',isAuth,(req,res)=>{
        var user=req.session.result;
        var data=req.body;
        var dettagli,taglia_fit;
        if(data.categoria=="null" || data.usato=="null" || data.sesso=="null" || data.taglia=="null" || data.colore=="null" ){
            req.flash('infoError','Errore di Compilazione "nelle opzioni a tendina"');
            return res.redirect('/uploadType/gioielli');
        }
        else{
            if(data.categoria=="borsa"){
                if(data.materiale_esterno_borsa=="" || data.fodera_borsa=="" || data.lunghezza_borsa=="" || data.altezza_borsa==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari della borsa"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        materiale_esterno:data.materiale_esterno_borsa,
                        materiale_fodera:data.fodera_borsa,                                                                 
                        descrizione:data.descrizione,
                        avvertenze:data.avvertenze
                    },
                    taglia_fit={
                        cm_altezza:data.lunghezza_borsa,
                        cm_lunghezza:data.altezza_borsa
                    }
                }
            }
            if(data.categoria=="cintura"){
                if(data.composizione_cintura=="" || data.chiusura_cintura=="" || data.lunghezza_cintura==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari della cintura"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        tipologia_chiusura:data.chiusura_cintura,
                        composizione:data.composizione_cintura,
                        descrizione:data,descrizione,
                        avvertenze:data.avvertenze
                    },
                    taglia_fit={
                        cm_lunghezza:data.lunghezza_cintura
                    }
                }
            }
            if(data.categoria=="cravatta"){
                if(data.composizione_cravatta==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari della cravatta"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        composizione:data.composizione_cravatta,
                        descrizione:data,descrizione,
                        avvertenze:data.avvertenze
                    }
                }
            }
            if(data.categoria=="papillion"){
                if(data.composizione_papillion==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari della papillion"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        composizione:data.composizione_papillion,
                        descrizione:data,descrizione,
                        avvertenze:data.avvertenze
                    }
                }
            }
            if(data.categoria=="sciarpa"){
                if(data.composizione_sciarpa==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari della sciarpa"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        composizione:data.composizione_sciarpa,
                        descrizione:data,descrizione,
                        avvertenze:data.avvertenze
                    }
                }
            }
            if(data.categoria=="portafoglio"){
                if(data.materiale_esterno_portafoglio=="" || data.fodera_portafoglio=="" || data.lunghezza_portafoglio=="" ||data.altezza_portafoglio==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari del portafoglio"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        materiale_esterno:data.materiale_esterno_portafoglio,
                        materiale_fodera:data.fodera_portafoglio,
                        descrizione:data.descrizione,
                        avvertenze:data.avvertenze
                    },
                    taglia_fit={
                        cm_altezza:data.altezza_portafoglio,
                        cm_lunghezza:data.lunghezza_portafoglio
                    }
                }
            }
            if(data.categoria=="occhiali"){
                if(data.forma_occhiale=="" || data.colore_lenti_occhiale=="" || data.astine_occhiale==""){
                    req.flash('infoError','Errore di Compilazione "nei dati basilari dei occhiali"');
                    return res.redirect('/uploadType/gioielli');
                }else{
                    dettagli={
                        forma_occhiale:data.forma_occhiale,
                        colore_lenti:data.colore_lenti_occhiale,
                        tipo_astine:data.astine_occhiale,
                        protezione_uv:data.uv_occhiali,
                        descrizione:data.descrizione,
                        avvertenze:data.avvertenze
                    }
                }
            }
            //contollo compilazione campo condizioni
            if(data.usato=="true" & data.condizione=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Condizione prodotto"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/gioielli');
            }
            if(data.colore_1=="null" || data.colore_2=="null" || data.colore_3=="null" || data.colore_4=="null"){
                req.flash('infoError','!Errore di Compilazione "Nella sezione Colore Immagine"!');
                req.flash('infoSubmit',null);
                return res.redirect('/uploadType/gioielli');
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

        //Query di inserimento
        var upload= new myaccessori({
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
            dettagli:dettagli,
            taglia_fit:taglia_fit,
            utente:user._id,
        });
        upload.save();

        res.redirect('/uploadType/accessori');
    });


/**Root per vizualizzare i prodotti a seconda della categoria/sottocategoria o brand
 * input-->richiesta + categoria(abbigliamneto,scarpe,orologi,...,second hand)+sottocategorie o brand(t-shirt&polo, gucci)
 * output-->reindirizzamento alle pagine/root--> /product-list + oggetto contenete i prodotti a seconda della categoria/sottocategoria o brand 
*/
    router.get('/product-list/:category&:subcategory',(req,res)=>{
        
        const cat=req.params.category;
        const subcat=req.params.subcategory;
        //Abbigliamento , sotto categorie e Brand
        if(req.params.category=="abbigliamento"){
            if(req.params.subcategory=="all"){
                myabbigliamento.find({'second_hand.usato':false},function(err,myres){
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
                myabbigliamento.find({categoria:subcat,'second_hand.usato':false},function(err,myres){
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
                myabbigliamento.find({brand:subcat,'second_hand.usato':false},function(err,myres){
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
                myscarpe.find({'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="scarpe" || subcat=="scarpe_eleganti" || subcat=="mocassini" ||subcat=="stivali"){
                myscarpe.find({categoria:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="prada" || subcat=="dolce_gabbana" || subcat=="louis_vuitton" || subcat=="salvatore_ferragamo" || subcat=="bulgari" || subcat=="gucci" || subcat=="versace"){
                myscarpe.find({brand:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }
        //OROLOGI
        if(req.params.category=="orologi"){
            
            if(req.params.subcategory=="all"){
                myorologi.find({'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="meccanico" || subcat=="automatico" || subcat=="vintage" || subcat=="cronografo" || subcat=="subacqueo" || subcat=="aviatore" || subcat=="militare" || subcat=="nautico"){
                myorologi.find({categoria:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="rolex" || subcat=="audemar_piguet" || subcat=="cartier" || subcat=="patek_philippe" || subcat=="bulgari" || subcat=="richard_mille" || subcat=="panerai"){
                myorologi.find({brand:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }
        if(req.params.category=="accessori"){
            
            if(req.params.subcategory=="all"){
                myaccessori.find({'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="borsa" || subcat=="cintura" || subcat=="cravatta" || subcat=="papillon" || subcat=="sciarpa" || subcat=="portafoglio" || subcat=="occhiali"){
                myaccessori.find({categoria:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="prada" || subcat=="dolce_gabbana" || subcat=="louise_vuitton" || subcat=="salvatore_ferragamo" || subcat=="bulgari" || subcat=="versace" || subcat=="gucci" || subcat=="fendi"){
                myaccessori.find({brand:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }

        if(req.params.category=="gioielli"){
            
            if(req.params.subcategory=="all"){
                mygioielli.find({'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="anello" || subcat=="bracciale" || subcat=="collana" || subcat=="orecchino"){
                mygioielli.find({categoria:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTA CATEGORIA",myres});
                    return res.render('product_list',{mess,myres});
                });
            }
            if(subcat=="cartier" || subcat=="chopard" || subcat=="tiffany_co" || subcat=="bulgari" || subcat=="chanel" || subcat=="gucci" || subcat=="bucellati"){
                mygioielli.find({brand:subcat,'second_hand.usato':false},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    return res.render('product_list',{mess,myres});
                });
            }   
        }
    });
    /**Root per le categorie,sottocategorie e brand per SECOND HAND 
     * input-->richiesta per vizualizzare prodotti usati + categoria o marca
     * output--> reindirizzamento alle pagine/root--> /product-list + oggetto contenete i prodotti a seconda della categoria/sottocategoria o brand 
    */
    router.get('/second_hand/:category&:subcategory',async(req,res)=>{
        const cat=req.params.category;
        const subcat=req.params.subcategory;
        
        /*if(cat=="all"){
            var myres=[];

            myres.push(await myabbigliamento.find({'second_hand.usato':true}));
            myres.push(await myscarpe.find({'second_hand.usato':true}));
            myres.push(await myorologi.find({'second_hand.usato':true}));
            myres.push(await mygioielli.find({'second_hand.usato':true}));
            myres.push(await myaccessori.find({'second_hand.usato':true}));
            console.log(myres);
            var conta=myres.length;
            var mess;
            if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO CATEGORIA",myres});
            console.log("tutto usato");
            return res.render('product_list',{mess,myres});
        }*/

        if(cat=="abbigliamento"){
            if(subcat=="all"){
                myabbigliamento.find({'second_hand.usato':true},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento usato")
                    return res.render('product_list',{mess,myres});
                });
            }else{
                myabbigliamento.find({'second_hand.usato':true,brand:subcat},function(err,myres){
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

        if(cat=="scarpe"){
            if(subcat=="all"){
                myscarpe.find({'second_hand.usato':true},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento usato")
                    return res.render('product_list',{mess,myres});
                });
            }else{
                myscarpe.find({'second_hand.usato':true,brand:subcat},function(err,myres){
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

        if(cat=="orologi"){
            if(subcat=="all"){
                console.log("ciao");
                myorologi.find({'second_hand.usato':true},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento usato")
                    return res.render('product_list',{mess,myres});
                });
            }else{
                myorologi.find({'second_hand.usato':true,brand:subcat},function(err,myres){
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
        if(cat=="gioielli"){
            if(subcat=="all"){
                console.log("ciao");
                mygioielli.find({'second_hand.usato':true},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento usato")
                    return res.render('product_list',{mess,myres});
                });
            }else{
                mygioielli.find({'second_hand.usato':true,brand:subcat},function(err,myres){
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
        if(cat=="borse" || cat=="cintura" || cat=="occhiali"){
            if(subcat=="all"){
                myaccessori.find({'second_hand.usato':true,categoria:cat},function(err,myres){
                    if(err) return handleError(err);
                    //contolli necessari sul risultato 
                    var conta=myres.length;
                    var mess;
                    if(conta<1) return res.render('product_list',{ mess:"NON CI SONO PRODOTTI PER QUESTO BRAND",myres});
                    console.log("abbigliamento usato")
                    return res.render('product_list',{mess,myres});
                });
            }else{
                myaccessori.find({'second_hand.usato':true,brand:subcat},function(err,myres){
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

    });

/**Root per la pagina singola
 * input-->richiesta per vizualizzare prodotto + id prodotto
 * output--> reindirizzamento alle pagine/root--> prodotto.ejs + con informazioni relative al prodotto richiesto
*/
    router.get('/prodotto/:category&:id',(req,res)=>{
        var cat=req.params.category;
        var id=req.params.id;
        var collection;
        console.log(cat);
        if(cat=="tshirt_polo" || cat=="camicia" || cat=="maglieria" || cat=="completo" || cat=="giacca" || cat=="cappotto" || cat=="jeans" || cat=="pantalone"){
            myabbigliamento.findById(id,function(err,myres){
                if(err) throw handleError(err);
                collection="abbigliamento";
                res.render('prodotto',{myres,collection});
            });
        }
        if(cat=="borsa" || cat=="cintura" || cat=="cravatta" || cat=="papillion" || cat=="sciarpa" || cat=="portafoglio" || cat=="occhiali"){
            myaccessori.findById(id,function(err,myres){
                if(err) throw handleError(err);
                collection="accessori";
                res.render('prodotto',{myres,collection});
            });
        }
        if(cat=="anello" || cat=="bracciale" || cat=="collana" || cat=="orecchino"){
            mygioielli.findById(id,function(err,myres){
                if(err) throw handleError(err);
                collection="gioielli";
                res.render('prodotto',{myres,collection});
            });
        }
        if(cat=="cronografo" || cat=="automatico" || cat=="aviatore" || cat=="meccanico" || cat=="militare" || cat=="nautico" || cat=="vintage" || cat=="subacqueo" || cat=="svizzero"){
            myorologi.findById(id,function(err,myres){
                if(err) throw handleError(err);
                collection="orologi";
                res.render('prodotto',{myres,collection});
            });
        }
        if(cat=="scarpe" || cat=="scarpe_eleganti" || cat=="stivali" || cat=="mocassini"){
            myscarpe.findById(id,function(err,myres){
                if(err) throw handleError(err);
                collection="scarpe";
                res.render('prodotto',{myres,collection});
            });
        }
    });

    /**Aggiungi carrello*/
        router.get('/addCarrello/:id',isAuth,async(req,res)=>{
            var user=req.session.result;
            var id_prodotto=req.params.id;
            myuser.find({'carrello.prodotto':id_prodotto},async(err,flag)=>{
                if(err) throw err;
                if(flag.length>0){
                    res.redirect('/carrello');
                }else{
                    await myuser.findByIdAndUpdate(user._id,{$push:{
                        carrello:{prodotto:id_prodotto}
                    }});
                    res.redirect('/carrello');
                }
            });
        });

    /**Rimuovi carrello*/
        router.get('/rimuoviCarrello/:id',isAuth,async(req,res)=>{
            var user=req.session.result;
            var id_prodotto=req.params.id;
            myuser.updateOne({ _id: user._id }, { "$pull": { "carrello": { "prodotto": id_prodotto } }}, { safe: true, multi:true }, function(err, obj) {
                if(err)return handleError(err);
                return res.redirect('/carrello');
            });
            
        });

    /**Aggiungi preferiti*/
        router.get('/addPreferiti/:id',isAuth,async(req,res)=>{
            var user=req.session.result;
            var id_prodotto=req.params.id;
            console.log(id_prodotto);
            myuser.find({'preferiti.prodotto':id_prodotto},async(err,flag)=>{
                if(err) throw err;
                console.log(flag.length);
                if(flag.length>0){
                    res.redirect('/lista_preferiti');
                }else{
                    await myuser.findByIdAndUpdate(user._id,{$push:{
                        preferiti:{prodotto:id_prodotto}
                    }});
                    console.log("aggiunto");
                    res.redirect('/lista_preferiti');
                }
            });
        });
        
    /**Rimuovi preferiti*/
    router.get('/removePreferiti/:id',isAuth,(req,res)=>{
        var user=req.session.result;
        var id_prodotto=req.params.id;
        myuser.updateOne({ _id: user._id }, { "$pull": { "preferiti": { "prodotto": id_prodotto } }}, { safe: true, multi:true }, function(err, obj) {
            if(err)return handleError(err);
            return res.redirect('/lista_preferiti');
        });
    });
        

/**ROOT CARRELLO */
    router.get('/carrello',isAuth,async(req,res)=>{
        var user=req.session.result;
        var db_user=await myuser.findById(user._id);
        var len=db_user.carrello.length;
        var ilMioCarrello=[];
        //qui sarebbero necessarie le query composte (come su sql la congiunzione)
        //ho barato un po perchè su mongodb non sono intuitive per niente
        //questo metodo pero puo dare problemi relativi al tempo
        if(len<=0){
            return res.render('carrello',{ilMioCarrello,len,mess:"non ci sono prodotti nel carrello"});
        }else{
            db_user.carrello.forEach(async function(value,key){
                ilMioCarrello.push(await myabbigliamento.findById(value.prodotto));
                ilMioCarrello.push(await myscarpe.findById(value.prodotto));
                ilMioCarrello.push(await myaccessori.findById(value.prodotto));
                ilMioCarrello.push(await mygioielli.findById(value.prodotto));
                ilMioCarrello.push(await myorologi.findById(value.prodotto));
                if(key==len-1){
                    return res.render('carrello',{ilMioCarrello,len,mess:null});
                }
            });
        }
    });

/**ROOT LISTA PREFERITI */
    router.get('/lista_preferiti',isAuth,async(req,res)=>{
        var user=req.session.result;
        var db_user=await myuser.findById(user._id);
        var len=db_user.preferiti.length;
        var mieipreferiti=[];
        if(len<=0){
            return res.render('lista_preferiti',{mieipreferiti,mess:"non ci sono preferiti"});
        }else{
            db_user.preferiti.forEach(async function(value,key){
                mieipreferiti.push(await myabbigliamento.findById(value.prodotto));
                mieipreferiti.push(await myscarpe.findById(value.prodotto));
                mieipreferiti.push(await myaccessori.findById(value.prodotto));
                mieipreferiti.push(await mygioielli.findById(value.prodotto));
                mieipreferiti.push(await myorologi.findById(value.prodotto));
                if(key==len-1){                    
                    return res.render('lista_preferiti',{mieipreferiti,mess:null});
                }
            });
        }
    });


/**Root per effettuare un'acquisto */
    router.get('/aquisti/:totale',isAuth,async(req,res)=>{
        var user=req.session.result;
        var totale=req.params.totale;
        var articoli=[];
        var comprati=[];
        myuser.findById(user._id,async(err,db_user)=>{
            if(err) throw handleError(err);
            if(db_user.carrello.length<=0){
                return res.redirect('/lista_acquisti');
            }else{
                var len=db_user.carrello.length;
                db_user.carrello.forEach(async function(value,key){
                    articoli.push(value.prodotto);
                    //vado a cercare l'utente he ha caricato i prodotti per segnalare la vendita
                    comprati.push(await myabbigliamento.findById(value.prodotto,('_id utente')));
                    comprati.push(await myscarpe.findById(value.prodotto,('_id utente')));
                    comprati.push(await myorologi.findById(value.prodotto,('_id utente')));
                    comprati.push(await mygioielli.findById(value.prodotto,('_id utente')));
                    comprati.push(await myaccessori.findById(value.prodotto,('_id utente')));
                    console.log("nel carrello-->",comprati);
                    if(key==len-1){
                        comprati.forEach(async function(value,key){
                            console.log("nelle vendite-->",value);
                            if(value!=null){
                                await myuser.findByIdAndUpdate(value.utente,{$push:{
                                    vendite:{
                                        prodotto:value._id
                                    }
                                }});
                            }
                        });
                    }

                });
                
                //aggiungo gli articoli alla lista dei acquisti
                await myuser.findByIdAndUpdate(user._id,{$push:{
                    aquisti:{
                        articoli:articoli,
                        importo_pagato:totale
                    }
                }});
                //elimino gli articoli dal carrello
                var len=db_user.carrello.length;
                db_user.carrello.forEach(function(value,key){
                    myuser.updateOne({ _id: user._id }, { "$pull": { "carrello": { "prodotto": value.prodotto} }}, { safe: true, multi:true }, function(err, obj) {
                        if(err)return handleError(err);
                    });
                    if(key==len-1){
                        return res.redirect('/lista_acquisti');
                    }
                });
                
            }
        });

    });

/**Roote per vizualizzare la lista dei propri acquisti */
    router.get('/lista_acquisti',isAuth,(req,res)=>{
        var user=req.session.result;
        var len,len2;
        var mieiAquisti=[];
        myuser.findById(user._id,(err,myres)=>{
            if(err) throw handleError(err);

            if(myres.aquisti.length<=0){
                return res.render('lista_acquisti',{myres,mieiAquisti,mess:"non hai ancora comprato niente"});
            }else{
                len=myres.aquisti.length;
                myres.aquisti.forEach(async function(value,key){
                    len2=value.articoli.length;
                    value.articoli.forEach(async function(value,key2){
                        mieiAquisti.push(await myabbigliamento.findById(value._id));
                        mieiAquisti.push(await myscarpe.findById(value._id));
                        mieiAquisti.push(await myaccessori.findById(value._id));
                        mieiAquisti.push(await mygioielli.findById(value._id));
                        mieiAquisti.push(await myorologi.findById(value._id));
                        if(key==len-1 & key2==len2-1){
                            return res.render('lista_acquisti',{myres,mieiAquisti,mess:null});
                        }
                    });
                });
            }
        });
    });

/**Roote per la lista dei prodotto  venduti */
    router.get('/lista_vendite',isAuth,(req,res)=>{
        var user=req.session.result;
        var prodotti=[];
        var len;
        myuser.findById(user._id,(err,myres)=>{
            if(err) throw handleError(err);
            len=myres.vendite.length;
            if(len<=0){
                return res.render('lista_vendite',{myres,mess:"non ha ancora venduto nessun prodotto"});
            }else{
                myres.vendite.forEach(async function(value,key){
                    prodotti.push(await myabbigliamento.findById(value.prodotto));
                    prodotti.push(await myscarpe.findById(value.prodotto));
                    prodotti.push(await myorologi.findById(value.prodotto));
                    prodotti.push(await mygioielli.findById(value.prodotto));
                    prodotti.push(await myaccessori.findById(value.prodotto));

                    if(key==len-1){
                        console.log(prodotti);
                        return res.render('lista_vendite',{prodotti,mess:null});
                    }
                    
                });
            }

        });
    });

module.exports=router;

