const express=require('express');
const bodyparser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const myroutes=require('./routes/home_route');
require('dotenv/config');

//Middlewere
app.use(bodyparser.json());
app.use('/',myroutes);

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

//Start Server
app.listen(3000);