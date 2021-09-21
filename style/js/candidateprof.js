var closebutton = document.querySelector("#close-button-flash");
if(closebutton){
	closebutton.addEventListener("click" , function(){
		var flashcontainer = document.querySelector("#alertmess");
	    flashcontainer.style.top = "-100px";
	});
}
	


var genderdiv = document.querySelector(".gender-session");
var genderradio = document.querySelectorAll(".radio-buttons");
var gender = genderdiv.getAttribute("id");
if(gender === "male"){
	genderradio[0].setAttribute("checked" , true);
}else if(gender === "female"){
	genderradio[1].setAttribute("checked" , true);
}else{
	genderradio[2].setAttribute("checked" , true);
}

