const mongoose=require('mongoose');

var Schema = mongoose.Schema;

var user = new Schema({
    nome: {type:String,required:true},
    cognome: {type:String,required:true},
    data_nascita:{type:Date,required:true},
    codicefiscale: {type:String,required:true,min:16,max:16},
    email:{type:String ,email:true,required:true,min:9,max:50},
    password:{type:String,require:true, min:6,max:100},
    lista_desideri:[{type:Schema.Types.ObjectId, ref:'prodotto'}],
    aquisti:[
        {
            data:Date,
            articoli:[{type:Schema.Types.ObjectId, ref:'prodotto'}],
            importo_pagato:{type:Number,required:true}
        }]
        
});

module.exports=mongoose.model('user',user);