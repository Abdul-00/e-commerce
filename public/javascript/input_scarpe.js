function mycategory(category){
    if(category=="scarpe"){
        document.getElementById("input_scarpe").style.display="block";
        document.getElementById("input_scarpe_eleganti").style.display="none";
        document.getElementById("input_stivali").style.display="none";
        document.getElementById("input_mocassini").style.display="none";
    }
    if(category=="scarpe_eleganti"){
        document.getElementById("input_scarpe_eleganti").style.display="block";
        document.getElementById("input_scarpe").style.display="none";
        document.getElementById("input_stivali").style.display="none";
        document.getElementById("input_mocassini").style.display="none";
    }
    if(category=="stivali"){
        document.getElementById("input_stivali").style.display="block";
        document.getElementById("input_scarpe_eleganti").style.display="none";
        document.getElementById("input_scarpe").style.display="none";
        document.getElementById("input_mocassini").style.display="none";
    }
    if(category=="mocassini"){
        document.getElementById("input_mocassini").style.display="block";
        document.getElementById("input_stivali").style.display="none";
        document.getElementById("input_scarpe_eleganti").style.display="none";
        document.getElementById("input_scarpe").style.display="none";
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