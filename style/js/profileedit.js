var nametext =  document.querySelector("#user-name-of-profile");
if(!nametext){
	var nametext =  document.querySelector(".employee-profile-name");
}
var editform = document.querySelector("#edit-username-form");
var firstsavebutton  = document.querySelector("#first-save-button");
var inputofname = document.querySelector(".input-to-profile-username-update").firstElementChild;
var editbuttonlinkfirst = document.querySelector(".edit-main-button-of-profile-page1");
if(editform && editbuttonlinkfirst){
	editbuttonlinkfirst.addEventListener("click" , function(){
		editform.style.display = "block";
		nametext.style.display =  "none";
		inputofname.setAttribute("class" , "form-control"); 
	});
}


// For position session
var positionfield = document.querySelector("#user-passion-text");
var editformsec = document.querySelector("#edit-username-form2");
var firstsavebuttonsec  = document.querySelector("#first-save-button2");
var inputofnamesec = document.querySelector(".input-to-profile-username-update2").firstElementChild;
var editbuttonlinksec = document.querySelector(".edit-main-button-of-profile-page2");
if(editformsec && editbuttonlinksec){
   	editbuttonlinksec.addEventListener("click" , function(){
		editformsec.style.display = "block";
		 positionfield.style.display = "none";
		 inputofnamesec.setAttribute("class" , "form-control"); 
	});
}

