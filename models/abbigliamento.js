//Documento per categoria abbigliamento
const mongoose=require('mongoose');

var Schema = mongoose.Schema;

var abbigliamento=new Schema({
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
        descrizione:{type:String, max:200},
        avvertenze:{type:String,max:100}
    },
    taglia_fit:{
        vestibilita:{type:String},
        cm_manica:{type:String},
        cm_schienale:{type:String},
        cm_gamba_interna:{type:String},
        cm_gamba_esterna:{type:String}
    },
    utente:{type:Schema.Types.ObjectId,required:true},
});

module.exports=mongoose.model('abbigliamento',abbigliamento);