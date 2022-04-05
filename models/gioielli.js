//Documento per categoria gioielli
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gioielli=new Schema({
    categoria:{type:String,required:true,max:80},
    sesso:{type:String,required:true},
    nome_prodotto:{type:String,required:true},
    brand:{type:String,required:true},
    second_hand:{usato:{type:Boolean,required:true},condizione:{type:String,required:true}},
    more_materiali:{type:Boolean, required:true},
    materiali_carati:[{
        materiale:{type:String, required:true},
        carati:{tyope:String, required:true}
    }],
    foto:[{type:String}],
    quantita:{type:String,required:true},
    prezzo:{type:Number,required:true},
    dettagli:{
        anno_produzione:{type:String},
        provenienza:{type:String},
        descrizione:{type:String, max:200},
        avvertenze:{type:String,max:100}
    },
    taglia_fit:{
        mm_diametro:{type:String},
        mm_spessore:{type:String},
        cm_lunghezza:{type:String},
        pendente:{type:Boolean}
    },
    utente:{type:Schema.Types.ObjectId,required:true},

});

module.exports=mongoose.model('gioielli',gioielli);