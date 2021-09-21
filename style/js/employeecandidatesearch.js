var search       =   document.querySelector("#candidate-search-of-employes");
var matchlist    =   document.querySelector("#seachbox-container");

// search all the users from json file and filter.
if(search){
	const searchStates = async searchText => {
	var fetchurl = matchlist.getAttribute("data-id");
	var res = await fetch(fetchurl);
	var states = await res.json();
	   
	//  This is for Interviews
	states.forEach(function(job){
		
		// If job in interview
		if(!job.offerletter && job.interview.length > 0){
			var expdate  = job.interview[job.interview.length - 1].date;
			var date = new Date(expdate);
			var time = converttime(expdate);
			job.interview[job.interview.length - 1].date = date.toDateString() + " - " + time;
		}
		
		// IF job is offerletter
		if(job.offerletter){
			var expdate  = job.offerletter.expiring;
			var date = new Date(expdate);
			job.offerletter.expiring = date.toDateString();
		}
	  });
	   
	    // find all match..
		let matches = states.filter(state => {
			const regex = new RegExp(escapeRegex(searchText), 'gi');
			console.log(regex);
			if(!state.offerletter && state.interview.length > 0){
				var searchcontent = getfullname(state.to) + " " +  state.position + " " + state.interview[state.interview.length - 1].date + " " + textinterview();
				console.log(searchcontent);
			}
			if(state.offerletter){
				var searchcontent = getfullname(state.to) + " " +  state.position + " " + state.offerletter.expiring + " "  + textofferletter();
				console.log(searchcontent);
			}
			console.log(regex);
			return searchcontent.match(regex);
		});

		if(searchText.length === 0){
			matches = states;
		}
		console.log(matches);
		updatesearchboxofcandidates(matches);
} 

// For Interviews
var updatesearchboxofcandidates  = matches => {
	if(matches.length === 0){
		matchlist.innerHTML = "";  
	  }else{
		  var html = matches.map(match => `
        <a id="each-offerletter-link" href="/user/${match.author._id}/${match._id}/resume">
			   <div class="each-application-data d-flex justify-content-between">
					   <div class="application-sender-details d-flex">
						   <div class="user-image">
							   <img src="${getimgurl(match.to)}" alt="company-img">
						   </div>
						   <p class="application-sender-company">
							 ${getfullname(match.to)}
						   </p>
					   </div>
					    <p class="application-other-datas"> ${match.position}</p>
						<p class="application-other-datas">${getdatestr(match).date}</p>
						<p class="application-other-lastdatas">${getdatestr(match).type}</p>
			   </div>
		     </a>
  ` ).join('');
		matchlist.innerHTML = html;
	  }
}

var flag= true;
var pretime = "";
var nexttime = "";
var d = ""; 

search.addEventListener("input" , function(e){
	console.log("search something");
	if(pretime === ""){
		pretime = new Date().getTime();
	}
	
	nexttime = new Date().getTime();
	if(nexttime - pretime > 1000){
		searchStates(search.value);
	} else {
		clearTimeout(d);
		d = setTimeout(function(){
		    searchStates(search.value);
		} , 1000); 
	}
	pretime = nexttime;
});

}


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


function converttime(time){
	var time = new Date(time);
	 var hrs =  time.getUTCHours();
	 var mins =  time.getUTCMinutes();
	   if(hrs > 12){
		  hrs = hrs % 12;
          if(hrs < 10){
			  hrs = "0" + hrs;
           }
		  var part = "PM";
	  }else if(hrs < 12 && hrs >= 10){
          hrs = hrs;
		  var part = "AM";
	  }else{
		  hrs = "0" + hrs;
	    	var part = "AM";
 	  }
	  
	  if(mins < 10){
		  mins = "0" +  mins; 
	  }
	  
	   var finaltime = hrs + ":" + mins + " " + part;
	  return finaltime;
}


function getdatestr(obj){
	var datestr = {};
	if(obj.offerletter){
	    datestr.date = obj.offerletter.expiring;
		datestr.type = textofferletter();
		
	}
	
	if(!obj.offerletter && obj.interview.length > 0){
		datestr.date = obj.interview[obj.interview.length - 1].date;
		datestr.type = textinterview() + "(" +  obj.interview.length + ")";
	}
	
	return datestr;
}

// Function to get fullname of user
function getfullname(user){
	if(user.local.firstname){
		var fullname = user.local.firstname + " " + user.local.lastname; 
	}else if(user.googleauth.fullname){
		var fullname = user.googleauth.fullname;
	}else{
		var fullname = user.linkedinauth.fullname;
	}
	return fullname;
}

// Text of Interview
function textinterview(){
	return "Interview";
}

// Text of offerLetter
function textofferletter(){
	return "Offer Letter";
}

function getimgurl(user){
	if(user.local){
		if(user.local.avatar){
			var url = user.local.avatar;
		}
	}
	
	if(user.googleauth){
		if(user.googleauth.avatar){
			var url = user.googleauth.avatar;
		}
	}
	
	if(user.linkedinauth){
		if(user.linkedinauth.avatar){
			var url = user.linkedinauth.avatar;
		}
	}
	
	if(!url){
		var url = "/images/home/profile-img.jpg";
	}
	return url;
}
