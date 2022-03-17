const mongoose=require('mongoose');

var schema=mongoose.schema;

var prodotto=new schema({
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
    }

});

module.exports=mongoose.model('prodotto',prodotto);