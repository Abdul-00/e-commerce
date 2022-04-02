function mycategory(category){
    if(category=="manica_corta" || category=="camicia" || category=="maglieria" || category=="giacca" || category=="cappotto"){
        document.getElementById("input_parte_superiore").style.display="block";
        document.getElementById("input_parte_inferiore").style.display="none";
        document.getElementById("input_completo").style.display="none";
    }
    if(category=="jeans" || category=="pantalone"){
        document.getElementById("input_parte_inferiore").style.display="block";
        document.getElementById("input_parte_superiore").style.display="none";
        document.getElementById("input_completo").style.display="none";
    }
    if(category=="completo"){
        document.getElementById("input_completo").style.display="block";
        document.getElementById("input_parte_superiore").style.display="none";
        document.getElementById("input_parte_inferiore").style.display="none";
    }
}

function second_hand(usato){
    if(usato=="true"){
        document.getElementById("condizione").style.display="flex";
    }
    if(usato=="false"){
        document.getElementById("condizione").style.display="none";
    }
}