function mycategory(category){
    if(category=="borsa"){
       document.getElementById("input_borse").style.display="block";
       document.getElementById("input_cinture").style.display="none";
       document.getElementById("input_papillon").style.display="none";
       document.getElementById("input_cravatte").style.display="none";
       document.getElementById("input_sciarpe").style.display="none";
       document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="cintura"){
        document.getElementById("input_cinture").style.display="block";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_papillon").style.display="none";
        document.getElementById("input_cravatte").style.display="none";
        document.getElementById("input_sciarpe").style.display="none";
        document.getElementById("input_portafogli").style.display="none";
        document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="cravatta"){
        document.getElementById("input_cravatte").style.display="block";
        document.getElementById("input_cinture").style.display="none";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_papillon").style.display="none";
        document.getElementById("input_sciarpe").style.display="none";
        document.getElementById("input_portafogli").style.display="none";
        document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="papillon"){
        document.getElementById("input_papillon").style.display="block";
        document.getElementById("input_cinture").style.display="none";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_cravatte").style.display="none";
        document.getElementById("input_sciarpe").style.display="none";
        document.getElementById("input_portafogli").style.display="none";
        document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="sciarpa"){
        document.getElementById("input_sciarpe").style.display="block";
        document.getElementById("input_papillon").style.display="none";
        document.getElementById("input_cinture").style.display="none";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_cravatte").style.display="none";
        document.getElementById("input_portafogli").style.display="none";
        document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="portafoglio"){
        document.getElementById("input_portafogli").style.display="block";
        document.getElementById("input_sciarpe").style.display="none";
        document.getElementById("input_papillon").style.display="none";
        document.getElementById("input_cinture").style.display="none";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_cravatte").style.display="none";
        document.getElementById("input_occhiali").style.display="none";
    }
    if(category=="occhiali"){
        document.getElementById("input_occhiali").style.display="block";
        document.getElementById("input_portafogli").style.display="none";
        document.getElementById("input_sciarpe").style.display="none";
        document.getElementById("input_papillon").style.display="none";
        document.getElementById("input_cinture").style.display="none";
        document.getElementById("input_borse").style.display="none";
        document.getElementById("input_cravatte").style.display="none";
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