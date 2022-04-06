function EnableDisableTextBox(drop_down_motivazione) {
    if (drop_down_motivazione=="altro"){
        document.getElementById("text_box_motivazione_altro").style.display = "block";
    }  else{
        document.getElementById("text_box_motivazione_altro").style.display = "none";
    }
}