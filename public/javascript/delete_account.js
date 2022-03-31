'use strict';

function EnableDisableTextBox(drop_down_motivazione) {
    let selectedValue = drop_down_motivazione.options[drop_down_motivazione.selectedIndex].value;
    let text_box_motivazione_altro = document.getElementById("text_box_motivazione_altro");
    if (selectedValue !== "Altro") {
        text_box_motivazione_altro.style.display = "none";
    }else{
        text_box_motivazione_altro.style.display = "block";
    }
}