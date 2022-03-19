//Documento prodoto
const mongoose=require('mongoose');

var Schema = mongoose.Schema;

var prodotto=new Schema({
    categorie:{type:String,required:true,max:80},
    mf:{type:String,required:true},
    nome:{type:String,required:true},
    brand:{type:String,required:true},
    usato:{type:Boolean},
    foto:[{
        colore:{type:String,required:true},
        url:{type:String}
    }],
    taglai_prezzo:[{
        colore:String,
        taglia:{
            quantità:{type:String,required:true},
            size:{type:String,max:4,required:true},
            prezzo:{type:Number,required:true}
        }
    }],
    dettagli:{
        composizione:{type:String,max:100},
        avvertenze:{type:String,max:100},
        colletto:{type:String,max:100},
        chiusura:{type:String,max:100},
        tasche:{type:String,max:100},
    },
    taglia_fit:{
        vestibilita:{type:String},
        lunghezza:{type:String},
        lunghezza_manica:{type:String},
        lung_delle_maniche:{type:String},
        lung_dello_schienale:{type:String},
    }

});

module.exports=mongoose.model('prodotto',prodotto);