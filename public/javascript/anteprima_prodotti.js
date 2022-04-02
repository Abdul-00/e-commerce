function mygenere(input){
    var select = document.getElementById("input_genere");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_genere").value = testo;
    }else{
        document.getElementById("output_genere").value = "";
    }
}
function mymarca(input){
    var testo = document.getElementById("input_marca").value;
    if(testo != 0){
        document.getElementById("output_marca").value = testo;
    }else{
        document.getElementById("output_marca").value = "";
    }
}
function mycategoria(input){
    var select = document.getElementById("input_categoria");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_categoria").value = testo;
    }else{
        document.getElementById("output_categoria").value = "";
    }
}
function myusato(input){
    var select = document.getElementById("usato");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato == "true"){
        document.getElementById("output_usato").value = testo;
        document.getElementById("sezione_condizione").style.display = "block";
    }
    if(valore_selezionato == "false"){
        document.getElementById("output_usato").value = testo;
        document.getElementById("sezione_condizione").style.display = "none";
    }
    if(valore_selezionato == "null"){
        document.getElementById("output_usato").value = "";
        document.getElementById("sezione_condizione").style.display = "none";
    }
}
function mycondizione(input){
    var select = document.getElementById("input_condizione");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_condizione").value = testo;
    }else{
        document.getElementById("output_condizione").value = "";
    }
}
function mynome(input){
    var testo = document.getElementById("input_nome").value;
    if(testo != 0){
        document.getElementById("output_nome").value = testo;
    }else{
        document.getElementById("output_nome").value = "";
    }
}
function mydescrizione(input){
    var testo = document.getElementById("input_descrizione").value;
    if(testo != 0){
        document.getElementById("output_descrizione").value = testo;
    }else{
        document.getElementById("output_descrizione").value = "";
    }
}
function myquantita(input){
    var testo = document.getElementById("input_quantita").value;
    if(testo != 0){
        document.getElementById("output_quantita").value = testo;
    }else{
        document.getElementById("output_quantita").value = "";
    }
}
function myprezzo(input){
    var testo = document.getElementById("input_prezzo").value;
    if(testo != 0){
        document.getElementById("output_prezzo").value = testo;
    }else{
        document.getElementById("output_prezzo").value = "";
    }
}
function mytipologia(input){
    var select = document.getElementById("input_tipologia");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_tipologia").value = testo;
    }else{
        document.getElementById("output_tipologia").value = "";
    }
}
function mymodello(input){
    var testo = document.getElementById("input_modello").value;
    if(testo != 0){
        document.getElementById("output_modello").value = testo;
    }else{
        document.getElementById("output_modello").value = "";
    }
}
function mycorredo(input){
    var select = document.getElementById("input_corredo");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_corredo").value = testo;
    }else{
        document.getElementById("output_corredo").value = "";
    }
}
function mytaglia(input){
    var select = document.getElementById("input_taglia");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_taglia").value = testo;
    }else{
        document.getElementById("output_taglia").value = "";
    }
}
function mycolore(input){
    var select = document.getElementById("input_colore");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_colore").value = testo;
    }else{
        document.getElementById("output_colore").value = "";
    }
}
function myvestibilita(input){
    var select = document.getElementById("input_vestibilita");
    var indice = select.selectedIndex;
    var valore = select.options[indice];
    var valore_selezionato = valore.value;
    var testo = valore.text;
    if(valore_selezionato != "null"){
        document.getElementById("output_vestibilita").value = testo;
    }else{
        document.getElementById("output_vestibilita").value = "";
    }
}