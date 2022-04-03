//--------------------------------NON VIENE USATO ---PER IL MOMENTO
// When the user scrolls the page, execute myFunction
//window.onscroll = function() {myFunction()};

window.addEventListener('scroll',myFunction());

// Get the navbar
var anteprima = document.getElementById("anteprima");

// Get the offset position of the navbar
var sticky = anteprima.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset >= sticky) {
    anteprima.classList.add("sticky");
  } else {
    anteprima.classList.remove("sticky");
  }
}