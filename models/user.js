const mongoose=require('mongoose');

var Schema = mongoose.Schema;

var user = new Schema({
    nome: String,
    indirizzo: String,
    email: String 
});

module.exports=mongoose.model('user',user);