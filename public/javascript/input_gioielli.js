function mymaterials(materials){
    if(materials=="no"){
        document.getElementById("primo_materiale").style.display="block";
        document.getElementById("secondo_materiale").style.display="none";
        document.getElementById("terzo_materiale").style.display="none";
        document.getElementById("quarto_materiale").style.display="none";
    }
    if(materials=="due"){
        document.getElementById("primo_materiale").style.display="block";
        document.getElementById("secondo_materiale").style.display="block";
        document.getElementById("terzo_materiale").style.display="none";
        document.getElementById("quarto_materiale").style.display="none";
    }
    if(materials=="tre"){
        document.getElementById("primo_materiale").style.display="block";
        document.getElementById("secondo_materiale").style.display="block";
        document.getElementById("terzo_materiale").style.display="block";
        document.getElementById("quarto_materiale").style.display="none";
    }
    if(materials=="quattro"){
        document.getElementById("primo_materiale").style.display="block";
        document.getElementById("secondo_materiale").style.display="block";
        document.getElementById("terzo_materiale").style.display="block";
        document.getElementById("quarto_materiale").style.display="block";
    }
}

function mycategory(category){
    if(category=="anello"){
        document.getElementById("input_anello").style.display="block";
        document.getElementById("input_bracciale").style.display="none";
        document.getElementById("input_collana").style.display="none";
        document.getElementById("input_orecchino").style.display="none";
    }
    if(category=="bracciale"){
        document.getElementById("input_anello").style.display="none";
        document.getElementById("input_bracciale").style.display="block";
        document.getElementById("input_collana").style.display="none";
        document.getElementById("input_orecchino").style.display="none";
    }
    if(category=="collana"){
        document.getElementById("input_anello").style.display="none";
        document.getElementById("input_bracciale").style.display="none";
        document.getElementById("input_collana").style.display="block";
        document.getElementById("input_orecchino").style.display="none";
    }
    if(category=="orecchino"){
        document.getElementById("input_anello").style.display="none";
        document.getElementById("input_bracciale").style.display="none";
        document.getElementById("input_collana").style.display="none";
        document.getElementById("input_orecchino").style.display="block";
    }
}

function second_hand(usato){
    if(usato=="true"){
        document.getElementById("condizione").style.display="flex";
        document.getElementById("provenienza").style.display="flex";
    }
    if(usato=="false"){
        document.getElementById("condizione").style.display="none";
        document.getElementById("provenienza").style.display="none";

    }
}