var sidebarlis  = document.querySelectorAll(".sidebar li");
for(var i = 0 ; i < sidebarlis.length ; i++){
	sidebarlis[i].addEventListener("click" , function(){
		for(var j = 0 ; j < sidebarlis.length ; j++){
			var imagetag = sidebarlis[j].firstElementChild.firstElementChild.getAttribute("src");
			var constantstr = imagetag.slice(0,16);
			
			if(imagetag.slice(16) === "whitedashboard.svg"){
				var imgurl = constantstr + "dashboard.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
			if(imagetag.slice(16) === "whitepaper.svg"){
				var imgurl = constantstr + "paper.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
			if(imagetag.slice(16) === "whiteofferletter.svg"){
				var imgurl = constantstr + "offerletter.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
			if(imagetag.slice(16) === "whiteinterview.svg"){
				var imgurl = constantstr + "interview.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
			if(imagetag.slice(16) === "whiteinbox.svg"){
				var imgurl = constantstr + "inbox.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
			if(imagetag.slice(16) === "whiteemployer.svg"){
				var imgurl = constantstr + "employer.svg";
			    sidebarlis[j].firstElementChild.firstElementChild.setAttribute("src" , imgurl);
			}
		    sidebarlis[j].firstElementChild.style.color = "#313131";	
			sidebarlis[j].firstElementChild.style.fontWeight = "400";
			sidebarlis[j].style.backgroundColor = "#FFFFFF"
		}
		
		this.style.backgroundColor = "#18A4E0";
		var anchorelm  =  this.firstElementChild;
		anchorelm.style.color =  "#FFFFFF";
		anchorelm.style.fontWeight = "500";
		var imgtag = anchorelm.firstElementChild.getAttribute("src");
		var constring = imgtag.slice(0,16);
		
		if(imgtag.slice(16) === "dashboard.svg"){
		    var imgurl = constring + "whitedashboard.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}else if(imgtag.slice(16) === "paper.svg"){
			var imgurl = constring + "whitepaper.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}else if(imgtag.slice(16) === "offerletter.svg"){
			var imgurl = constring + "whiteofferletter.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}else if(imgtag.slice(16) === "interview.svg"){
			var imgurl = constring + "whiteinterview.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}else if(imgtag.slice(16) === "inbox.svg"){
			var imgurl = constring + "whiteinbox.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}else{
			var imgurl = constring + "whiteemployer.svg";
			anchorelm.firstElementChild.setAttribute("src" , imgurl);
		}
		
	});
}

$(document).ready(function(){
	var maincontainer = document.querySelector("#content-session");
	var offerletterdiv = document.querySelector("#offer-letter-content-session");
	var interviewdiv = document.querySelector("#interviews-content-session");
	var applicationdiv  = document.querySelector("#content-resume-session");
	var candidatesession = document.querySelector("#myapplication-content-session");
	var employerprofile = document.querySelector("#content-profile-session");
	if(offerletterdiv){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
		    if(page === "offerletter-page"){
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whiteofferletter.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
			}
			
			
		});
	}
	if(interviewdiv){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
			if(page ===  "interviews-page"){
				console.log("interview page");
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whiteinterview.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
		    }
		});	
	}
	
	if(applicationdiv){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
			if(page ===  "myapplication-page"){
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whitepaper.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
		    }
		});	
	}
	
	
	if(maincontainer){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
			if(page ===  "dashboard-page"){
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whitedashboard.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
		    }
		});	
	}
	
	if(candidatesession){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
			if(page ===  "myapplication-page"){
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whitepaper.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
		    }
		});	
	}
	
	if(employerprofile){
		sidebarlis.forEach(function(eachli){
			var page = eachli.firstElementChild.getAttribute("id");
			if(page ===  "employer-profile-page"){
				setcolortonav(eachli);
				var imagetag = eachli.firstElementChild.firstElementChild.getAttribute("src");
				var constantstr = imagetag.slice(0,16);
				var imgurl = constantstr + "whiteemployer.svg";
				var anchorelm  =  eachli.firstElementChild;
				anchorelm.firstElementChild.setAttribute("src" , imgurl);
		    }
		});	
	}
	
	
});


function setcolortonav(liitem){
	liitem.style.backgroundColor = "#18A4E0";
	var anchorelm  =  liitem.firstElementChild;
	anchorelm.style.color =  "#FFFFFF";
	anchorelm.style.fontWeight = "500"; 
}