var middlewareobj = {};

//  CHECK WHETHER THE PERSON IS LOGGED-IN OR NOT.
// middlewareobj.roleset = function(req , res , next){
// 	if(req){
// 		console.log(req);
// 		req.params = 
// 	}
// }

middlewareobj.isLoggedin   =  function(req ,res , next){
	if(req.isAuthenticated()){
		return	next();
	} 
	req.flash("error" , "You Need To Be Logged In To Do That");	
	res.redirect("/dashboard/auth/login");	
}


middlewareobj.alreadyLoggedin = function(req,res , next){
	if(!req.user){
		return next()
	}
	
	res.redirect("/user/" + req.user._id);
}


middlewareobj.tConvert   =  function (time) {
			  // Check correct time format and split into components
			  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

			  if (time.length > 1) { // If time format correct
				time = time.slice (1);  // Remove full string match value
				time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
				time[0] = +time[0] % 12 || 12; // Adjust hours
			  }
			  return time.join (''); // return adjusted time or original string
			}


// function to sort date and time (for accending order)
middlewareobj.jobsortas =  function(jobs){
  for (var i = 1; i < jobs.length; i++) {
    let j = i - 1;
	let temp =  jobs[i] ; 
    let tempdata = jobs[i].interview[jobs[i].interview.length - 1].date.getTime();
    while (j >= 0 && jobs[j].interview[jobs[j].interview.length - 1].date.getTime() > tempdata) {
      jobs[j + 1] = jobs[j];
      j--;
    }
    jobs[j+1] = temp;
  }
  return jobs
}

// Sort interviews in decending order
middlewareobj.jobsortde =  function(jobs){
  for (var i = 1; i < jobs.length; i++) {
    let j = i - 1;
	let temp =  jobs[i] ; 
    let tempdata = jobs[i].interview[jobs[i].interview.length - 1].date.getTime();
    while (j >= 0 && jobs[j].interview[jobs[j].interview.length - 1].date.getTime() < tempdata) {
      jobs[j + 1] = jobs[j];
      j--;
    }
    jobs[j+1] = temp;
  }
  return jobs
}

// function to sort date and time in decending order
middlewareobj.offerlettersortde =  function(jobs){
  for (var i = 1; i < jobs.length; i++) {
    let j = i - 1;
	let temp =  jobs[i] ; 
    let tempdata = jobs[i].offerletter.expiring.getTime();
    while (j >= 0 && jobs[j].offerletter.expiring.getTime() < tempdata) {
      jobs[j + 1] = jobs[j];
      j--;
    }
    jobs[j+1] = temp;
  }
  return jobs
}


// Sort mixed offerletter and interviews in decending order
middlewareobj.sortallde = function(jobs){
  for (var i = 1; i < jobs.length; i++) {
    let j = i - 1;
	let temp = jobs[i];
	let tempdata =  jobs[i].num;
    while (j >= 0 && jobs[j].num < tempdata) {
      jobs[j + 1] = jobs[j];
      j--;
    }
    jobs[j+1] = temp;
  }
  return jobs

}

middlewareobj.pagination = function(modal , page , limit){
	var datas = modal;
	if(!page && !limit){
		var page = 1;
		var limit = 10;
	}else{
	    var page = parseInt(page);
		var limit = parseInt(limit);	
	}
	
	var startindex = (page - 1)*limit;
	var endindex = page*limit;
	
	var results = {};
	results.limit = limit;
	results.pageno = page;
	results.pages = Math.ceil(modal.length/limit);
	results.limit = limit;
	if(endindex < datas.length){
		results.next = {
		   page : page + 1,
		   limit : limit
		}
	}
	
	if(startindex > 0){
		results.previous = {
			page : page - 1,
			limit  : limit
	   }
	}
	
	results.results = datas.slice(startindex , endindex);
	return results;
}


module.exports = middlewareobj;