//Documento utenti
const mongoose=require('mongoose');

var Schema = mongoose.Schema;

var user = new Schema({
    nome: {type:String,required:true},
    cognome: {type:String,required:true},
    data_nascita:{type:Date,required:true},
    codicefiscale: {type:String,required:true,min:16,max:16},
    numeroTelefono:{type:String,required:true,min:10,max:10},
    email:{type:String ,email:true,required:true,min:9,max:50},
    password:{type:String,require:true, min:6},
    lista_desideri:[{type:Schema.Types.ObjectId, ref:'prodotto'}],
    aquisti:[
        {
            data:Date,
            articoli:[{type:Schema.Types.ObjectId, ref:'prodotto'}],
            importo_pagato:{type:Number,required:true}
        }],
    indirizzi:[{
        via:{type:String,required:true},
        numero_civico:{type:Number,max:5,required:true},
        citta:{type:String,required:true},
        cap:{type:Number,min:5,max:5},
    }],
    /**venditore:[{
        partita_iva:{type:String,min:11,max:11},
        iban:{type:String,required:true}
    }],**/
        
});

module.exports=mongoose.model('user',user);