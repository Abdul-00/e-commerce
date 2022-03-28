function mycategory(category){
    if(category=="manica_corta" || category=="camicia" || category=="maglieria" || category=="giacca" || category=="cappotto"){
        document.getElementById("input_parte_superiore").style.display="block";
        document.getElementById("input_parte_inferiore").style.display="none";
    }
    if(category=="jeans" || category=="pantalone"){
        document.getElementById("input_parte_inferiore").style.display="block";
        document.getElementById("input_parte_superiore").style.display="none";
    }
    if(category=="completo"){
        document.getElementById("input_parte_superiore").style.display="block";
        document.getElementById("input_parte_inferiore").style.display="block";
    }
}