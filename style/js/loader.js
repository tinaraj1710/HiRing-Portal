var loaders = document.querySelectorAll(".preloader-all-pages");
var screenblockelm = document.querySelector(".screen-blocker"); 
var allforms = document.querySelectorAll(".submit-forms");
for(var i = 0 ; i < allforms.length ; i++){
	allforms[i].addEventListener("submit" , function(e){
		screenblock();
		startloader();
	});
}

function screenblock(){
	screenblockelm.classList.remove("main-loader-div");
}

function screenclear(){
	screenblockelm.classList.add("main-loader-div");
}

function startloader(){
	 loaders.forEach(function(loader){
		 loader.classList.remove("main-loader-div");
	 });
}

function loadout(){
	$(".preloader-all-pages").fadeOut("slow");
	loaders.forEach(function(loader){
		 loader.classList.add("main-loader-div");
	 });
}

//  This is for whole-page submission
var allforms = document.querySelectorAll(".submit-forms-whole");
for(var i = 0 ; i < allforms.length ; i++){
	allforms[i].addEventListener("submit" , function(e){
		screenblock();
		var fullloader = document.querySelector("#whole-loader");
		fullloader.classList.remove("main-loader-div");
	});
}
