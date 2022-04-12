
function mymenu(name){
  var menu=document.getElementById("ul_"+name);
  
  if(menu.style.display=="block"){
    menu.style.display="none";
  }else{
    menu.style.display="block";
  }
}



/*
//--------------------------------NON VIENE USATO ---PER IL MOMENTO
// When the user scrolls the page, execute myFunction
//window.onscroll = function() {myFunction()};

window.addEventListener('scroll',myFunction());
// Get the navbar
var side_menu = document.getElementById("side_menu");
// Get the offset position of the navbar
var sticky = side_menu.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset >= sticky) {
    side_menu.classList.add("sticky");
  } else {
    side_menu.classList.remove("sticky");
  }
}
*/