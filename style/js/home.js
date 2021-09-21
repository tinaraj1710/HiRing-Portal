
// Code for file uploader
var inputfiled  = document.querySelector("#attach-file-session");
if(inputfiled){
	inputfiled.addEventListener("change" , function(e){
		var textfile = document.querySelector("#attachment-text");
	       if(e.target.files.length > 0){
			var filename = "";
			for(var i = 0 ; i < e.target.files.length ; i++){
				if(filename){
					filename = filename + " , " +  e.target.files[i].name;
				}else{
					filename = filename +  e.target.files[i].name;
				}
			}
		    textfile.innerHTML = filename;
	    }else{
			textfile.innerHTML = "No file Choosen, Yet";
		}
   });
}


var inputfiledsec  = document.querySelector("#attach-file-session2");
if(inputfiledsec){
	inputfiledsec.addEventListener("change" , function(e){
		var textfilesec = document.querySelector("#attachment-text2");
	       if(e.target.files.length > 0){
			var filename = "";
			for(var i = 0 ; i < e.target.files.length ; i++){
				if(filename){
					filename = filename + " , " +  e.target.files[i].name;
				}else{
					filename = filename +  e.target.files[i].name;
				}
			}
		    textfilesec.innerHTML = filename;
	    }else{
			textfilesec.innerHTML = "No file Choosen, Yet";
		}
   });
}

// Attach file for edit profile page
var inputfiledthird  = document.querySelector("#attach-file-session3");
if(inputfiledthird){
	inputfiledthird.addEventListener("change" , function(e){
		var textfilethird = document.querySelector("#attachment-text3");
	       if(e.target.files.length > 0){
			var filename = "";
			for(var i = 0 ; i < e.target.files.length ; i++){
				if(filename){
					filename = filename + " , " +  e.target.files[i].name;
				}else{
					filename = filename +  e.target.files[i].name;
				}
			}
		    textfilethird.innerHTML = filename;
	    }else{
			textfilethird.innerHTML = "No file Choosen, Yet";
		}
   });
}

// Attach file for edit profile page
var inputfiledfour  = document.querySelector("#attach-file-session4");
if(inputfiledfour){
	inputfiledfour.addEventListener("change" , function(e){
		var textfilethird = document.querySelector("#attachment-text4");
	       if(e.target.files.length > 0){
			var filename = "";
			for(var i = 0 ; i < e.target.files.length ; i++){
				if(filename){
					filename = filename + " , " +  e.target.files[i].name;
				}else{
					filename = filename +  e.target.files[i].name;
				}
			}
		    textfilethird.innerHTML = filename;
	    }else{
			textfilethird.innerHTML = "No file Choosen, Yet";
		}
   });
}


// For profile image file input selector
var profimginput = document.querySelector("#attach-file-session-img");
var imgtag = document.querySelector("#main-img-of-profile");
var imgtagsec = document.querySelector("#main-img-of-profile-sec2");
var uploadlink = document.querySelector(".select-img-caption");

if(profimginput){
	profimginput.addEventListener("change" , function(){
		var file = this.files[0];
		console.log(file);
		if(file){
			var reader = new FileReader();
			imgtag.style.display = "none";
			imgtagsec.style.display = "block";
			reader.addEventListener("load" , function(){
				console.log(this);
				imgtagsec.setAttribute("src" , this.result);
			});
			uploadlink.style.display = "block";
			reader.readAsDataURL(file);
			
			// reader.readAsDataUrl(file);
		}else{
			imgtagsec.style.display = null;
			imgtag.style.display = null;
			uploadlink.style.display = null;
			
		}
	});
}


