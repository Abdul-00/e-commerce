const express=require('express');
const { default: mongoose } = require('mongoose');
const router=express.Router();
const myuser=require('../models/user');
const myproduct=require('../models/prodotto');

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
router.post('/register',(req,res)=>{
    //WORKING ON THIS FOR NOW
    var registration = new myuser({ 'nome': 'alex','indirizzo':'via mario 25','email':'alex.b@gmail.com'});
    // Save the new model instance, passing a callback
    awesome_instance.save(function (err) {
    if (err) return handleError(err);
        res.send("controlla mongodb atlas");
    });
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

