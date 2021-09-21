var searchinput      =   document.querySelector("#candidate-search");
var matchlist        =   document.querySelector("#seachbox-container");

if(searchinput){
	
// search all the users from json file and filter.
   const searchdateapi = async searchText => {
	var fetchurl = matchlist.getAttribute("data-id");
	var res = await fetch(fetchurl);
	var states = await res.json();
	   
	//  This is for Interviews
	if(!states[0].offerletter && states[0].interview.length > 0 ){
		 // convert all expiring date to  UTC string
		states.forEach(function(offerletter){
			var expdate  = offerletter.interview[offerletter.interview.length - 1].date;
			var date = new Date(expdate);
			var time = converttime(expdate);
			offerletter.interview[offerletter.interview.length - 1].date = date.toDateString() + " - " + time;
		});

		   // find all match..
		let matches = states.filter(state => {
			const regex = new RegExp(escapeRegex(searchText), 'gi');
			var searchcontent = getfullname(state.to) + " " +  state.position + " " + state.interview[state.interview.length - 1].title   +   state.interview[state.interview.length - 1].date ;
			console.log(searchcontent);
			console.log(regex);
			return searchcontent.match(regex);
		});


		if(searchText.length === 0){
			matches = states;
		}
		console.log(matches);
		updatesearchboxofofinterviews(matches);
	}
	
	// This is for offerletter
	if(states[0].offerletter){
		 // convert all expiring date to  UTC string
		states.forEach(function(offerletter){
			var expdate  = offerletter.offerletter.expiring;
			var date = new Date(expdate);
			offerletter.offerletter.expiring = date.toDateString();
		});

		   // find all match..
		let matches = states.filter(state => {
			const regex = new RegExp(escapeRegex(searchText), 'gi');
			var searchcontent = getfullname(state.to) + " " +  state.position + " " + state.offerletter.expiring  + getstatus(state);
			console.log(searchcontent);
			console.log(regex);
			return searchcontent.match(regex);
		});


		if(searchText.length === 0){
			matches = states;
		}
		console.log(matches);
		updatesearchboxofofferletter(matches);
	}
	   
   
}
// for Offerletter session
var updatesearchboxofofferletter  = matches => {
	if(matches.length === 0){
		matchlist.innerHTML = "";  
	  }else{
		  var html = matches.map(match => `
        <a id="employer-each-offerletter-session" 
			href="/user/${match.author._id}/employer/offerletter/${match._id}">
				<div class="each-offer-letter d-flex justify-content-between">
					<div class="offerletter-comp d-flex align-items-center">
						<div class="comapny-img-from-offerletter">
							<img src="${getimgurl(match.to)}" alt="company-img">
						</div>
						<p>${getfullname(match.to)} </p>
					</div>
				    <p class="offer-letter-p-data">${match.position}</p>
					<p class="offer-letter-p-data">${match.offerletter.expiring}</p>
					<p class="offer-letter-p-data-end">${getstatus(match)}</p>
				</div>
		</a>
  ` ).join('');
		matchlist.innerHTML = html;
	  }
}

// For Interviews
var updatesearchboxofofinterviews  = matches => {
	if(matches.length === 0){
		matchlist.innerHTML = "";  
	  }else{
		  var html = matches.map(match => `
        <a class="employee-interviews-page-link" href="/user/${match.author._id}/${match._id}/resume">
				 <div class="each-interview-data d-flex justify-content-between">
					   <div class="interview-sender-details d-flex">
						   <div class="user-image">
							   <img src="${getimgurl(match.to)}" alt="company-img">
						   </div>
						   <p class="Interview-candidate-name">
							 ${getfullname(match.to)} (${match.interview.length})
						   </p>
					   </div>
					   <p class="employee-interview-p">${match.position}</p>
				       <p class="employee-interview-p">${match.interview[match.interview.length -1 ].title}</p>
					   <p class="interview-employer-last-p">${match.interview[match.interview.length -1 ].date}</p>
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
searchinput.addEventListener("input" , function(e){
	
	if(pretime === ""){
		pretime = new Date().getTime();
	}
	
	nexttime = new Date().getTime();
	if(nexttime - pretime > 1000){
		searchdateapi(searchinput.value);
	} else {
		clearTimeout(d);
		d = setTimeout(function(){
		    searchdateapi(searchinput.value);
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
