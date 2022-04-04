const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const myroutes=require('./routes/home_route');
const fileupload=require('express-fileupload');
const session=require('express-session');
const mongoDBSession=require('connect-mongodb-session')(session);
const flash=require('connect-flash');
require('dotenv/config');

//set views
    app.set('views','./views');
    app.set('view engine','ejs');
    app.use(express.urlencoded({extended:true}));
    app.use(express.static('public'));

//DATABASE CONNCETION
    mongoose.connect(process.env.db_connection,{useNewUrlParser: true});
    const db=mongoose.connection;
    db.on('error',()=>console.log("errore di connessione al db"));
    db.once('open',()=>console.log("connesso al db"));

//session and cookies
    //app.use(cookieparser(process.env.secure_cookie));
    const store=new mongoDBSession({
        uri:process.env.db_connection,
        collection:'mysessions'
    });
    app.use(session({
        secret: process.env.session_sec,
        saveUninitialized: false,
        resave: false,
        store: store
    }));
    app.use(flash());
    app.use(fileupload());

    // General Middlewere
    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({extended:true}));
    app.use('/',myroutes);


//Start Server
    app.listen(3000);