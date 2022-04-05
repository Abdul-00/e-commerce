//Documento per categoria orologi
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orologi=new Schema({
    categoria:{type:String,required:true,max:80},
    tipologia:{type:String,required:true},
    modello:{type:String,required:true,max:80},
    sesso:{type:String,required:true},
    nome_prodotto:{type:String,required:true},
    brand:{type:String,required:true},
    corredo:{type:String,required:true},
    second_hand:{usato:{type:Boolean,required:true},condizione:{type:String,required:true}},
    foto:[{type:String}],
    quantita:{type:String,required:true},
    prezzo:{type:Number,required:true},
    dettagli:{
        anno_produzione:{type:String},
        carica:{type:String},
        descrizione:{type:String, max:200},
        avvertenze:{type:String,max:100}
    },
    taglia_fit:{
        mm_diametro:{type:String},
    },
    utente:{type:Schema.Types.ObjectId,required:true},
});

module.exports=mongoose.model('orologi',orologi);