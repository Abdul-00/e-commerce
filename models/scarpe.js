//Documento per categoria scarpe
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var scarpe=new Schema({
    categoria:{type:String,required:true,max:80},
    sesso:{type:String,required:true},
    nome_prodotto:{type:String,required:true},
    brand:{type:String,required:true},
    second_hand:{usato:{type:Boolean,required:true},condizione:{type:String,required:true}},
    foto:[{
        url:{type:String}
    }],
    prodotti_disponibili:[{
        colore:String,
        taglia:{
            quantita:{type:String,required:true},
            size:{type:String,max:10,required:true},
            prezzo:{type:Number,required:true}
        }
    }],
    dettagli:{
        composizione:{type:String,max:100},
        materiale_superiore:{type:String},
        materiale_rivestimento:{type:String},
        materiale_solette:{type:String},
        materiale_suola:{type:String},
        materiale_fodera:{type:String},
        tipo_punta:{type:String},
        tipo_chiusura:{type:String},
        tacco:{type:String},
        descrizione:{type:String, max:200},
        avvertenze:{type:String,max:100}
    },
    utente:{type:Schema.Types.ObjectId,required:true},

});

module.exports=mongoose.model('scarpe',scarpe);