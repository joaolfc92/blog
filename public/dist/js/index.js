const bootstrap = require('bootstrap');
const jquery = require('jquery');
const popper = require('popper.js');



function menuToggle(){
	let abrir = document.getElementById("menu-area");
	let open = document.getElementById("open");
	let close = document.getElementById("fechar");


	if(abrir.style.width == "285px"){
		abrir.style.width = "0px";
		open.style.display = "block";
		close.style.display ="none";

	}else{
		abrir.style.width = "285px";
		open.style.display = "none";
		close.style.display ="block";
	}
}

