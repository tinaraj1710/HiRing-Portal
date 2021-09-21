var searchinputsession    =    document.querySelector("#candidate-from-search");
var matchlist             =    document.querySelector("#seachbox-container");

if(searchinputsession){
	
// search all the users from json file and filter.
   const searchStates = async searchText => {
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
			var searchcontent = getfullname(state.author) + " " +  state.position + " " + state.interview[state.interview.length - 1].title   +   state.interview[state.interview.length - 1].date 
			return searchcontent.match(regex);
		});


		if(searchText.length === 0){
			matches = states;
		}
		
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
			var searchcontent = getfullname(state.author) + " " +  state.position + " " + state.offerletter.expiring  + getstatus(state);
			return searchcontent.match(regex);
		});


		if(searchText.length === 0){
			matches = states;
		}
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
			href="/user/${match.to._id}/offerletter/${match._id}">
				<div class="each-offer-letter d-flex justify-content-between">
					<div class="offerletter-comp d-flex align-items-center">
						<div class="comapny-img-from-offerletter">
							<img src="${getimgurl(match.author)}" alt="company-img">
						</div>
						<p> ${getfullname(match.author)} </p>
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
            <div class="each-interview-data d-flex justify-content-between">
					   <div class="interview-sender-details d-flex">
						   <div class="user-image">
							   <img src="${getimgurl(match.author)}" alt="company-img">
						   </div>
						   <p class="Interview-candidate-name">
							 ${getfullname(match.author)}(${match.interview.length})
						   </p>
					   </div>
					   <p class="employee-interview-p">${match.position}</p>
				       <p class="employee-interview-p">${match.interview[match.interview.length -1 ].title}</p>
					   <p class="interview-employer-last-p">${match.interview[match.interview.length -1 ].date}</p>
				</div>
  ` ).join('');
		matchlist.innerHTML = html;
	  }
}

var flag= true;
var pretime = "";
var nexttime = "";
var d = ""; 
searchinputsession.addEventListener("input" , function(e){
	
	if(pretime === ""){
		pretime = new Date().getTime();
	}
	
	nexttime = new Date().getTime();
	if(nexttime - pretime > 1000){
		searchStates(searchinputsession.value);
	} else {
		clearTimeout(d);
		d = setTimeout(function(){
		    searchStates(searchinputsession.value);
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

// Getting status of Offer Letter OR Interviews
 function getstatus(jobobj){ 
    if(jobobj.status === "offerletter-sent"){ 
	 	var status = "Offerletter-sent"; 

    }else if(jobobj.status === "accepted"){ 
	 	var status = "Accepted"; 

    }else if(jobobj.status === "rejected"){ 
	   var status = "Rejected"; 

    }else if(jobobj.status === "defaulted"){ 
	   var status = "Defaulted"; 

    }else if(jobobj.status === "withdrawn"){ 

			 var status = "Withdrawn";    
	  }else if(jobobj.status === "interview-scheduled"){ 
	    var status = "Interview-scheduled"; 

    }else if(jobobj.status === "rescheduled"){ 
	    var status = "Re-scheduled"; 

    }else if(jobobj.status === "joined"){ 
	    var status = "joined"; 
    }else{ 
	    var status = ""; 
    }  

     return status 
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
