//Documento per categoria accessori
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var accessori=new Schema({
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
        materiale_esterno:{type:String},
        materiale_fodera:{type:String},
        tipologia_chiusura:{type:String},
        forma_occhiale:{type:String},
        colore_lenti:{type:String},
        tipo_astine:{type:String},
        protezione_uv:{type:Boolean},
        composizione:{type:String,max:100},
        descrizione:{type:String, max:200},
        avvertenze:{type:String,max:100}
    },
    taglia_fit:{
        cm_altezza:{type:String},
        cm_lunghezza:{type:String}
    },
    utente:{type:Schema.Types.ObjectId,required:true},

});

module.exports=mongoose.model('accessori',accessori);