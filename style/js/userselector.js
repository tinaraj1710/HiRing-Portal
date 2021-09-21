$("#register-as-candidate").click(function(){
	$("#role").val("candidate");
});

$("#exampleCheck1").click(function(){
	var checinput = document.querySelector("#exampleCheck1");
	var workfrom = document.querySelector("#worked-from");
	var workto = document.querySelector("#worked-to");
	checkboxupdate(checinput , workfrom  , workto);
});


$("#exampleCheck2").click(function(){
	var checinput = document.querySelector("#exampleCheck2");
	var workfrom = document.querySelector("#date-of-start");
	var workto = document.querySelector("#dateofcompletion");
	checkboxupdate(checinput , workfrom  , workto);
});


var checkboxdiv = document.querySelector(".workexpsession");
var num = checkboxdiv.getAttribute("id");
for(var i = 1 ; i <= num ; i++){
	$("#exampleCheckboxes" + i).click(function(){
		for(var j = 1 ; j <= num ; j++){
			var checinput = document.querySelector("#exampleCheckboxes"+ j);
	    	var workfrom = document.querySelector("#updatedatefrom" + j);
	    	var workto = document.querySelector("#updatedatecompl" + j);
	   	    checkboxupdate(checinput , workfrom  , workto);
		}
	});
}


var checkboxdiv = document.querySelector(".projectsession");
var num = checkboxdiv.getAttribute("id");
console.log(num);
for(var i=1 ; i <= num ; i++){
	$("#exampleCheck15" + i).click(function(){
		for(var j = 1 ; j <= num ; j++){
			var checinput = document.querySelector("#exampleCheck15"+ j);
	    	var workfrom = document.querySelector("#projectstart" + j);
	    	var workto = document.querySelector("#projectcomplete" + j);
	   	    checkboxupdate(checinput , workfrom  , workto);
		}
		
	});
}


// ADD WORK EXP. SESSION DATE CHECKING
var worksessionto = document.querySelector("#worked-to");
var worksessionfrom = document.querySelector("#worked-from");
worksessionto.onchange  =  function(){
     checkdates(worksessionfrom , worksessionto);
}

// ADD PROJECT SESSION DATE CHECKING
var datefrom = document.querySelector("#date-of-start");
var dateto = document.querySelector("#dateofcompletion");
dateto.onchange  =  function(){
     checkdates(datefrom , dateto);
}

// WORKEXP UPDATE SESSION CHECK DATE
var checkboxdiv = document.querySelector("#workexpsession");
var num = checkboxdiv.getAttribute("class");
for(var i=1 ; i <= num ; i++){
	var workto = document.querySelector("#updatedatecompl" + i);
	workto.onchange  = function(){
		for(var j = 1 ; j <= num ; j++){
			var workto = document.querySelector("#updatedatecompl" + j);
	    	var workfrom = document.querySelector("#updatedatefrom" + j);
	   	    checkdates(workfrom  , workto);
		}
	}	
}

// PROJECT UPDATE SESSION CHECK DATE
var checkboxdiv = document.querySelector(".projectsession");
var num = checkboxdiv.getAttribute("id");
for(var i=1 ; i <= num ; i++){
	var workto = document.querySelector("#projectcomplete" +i);
	workto.onchange  = function(){
		for(var j = 1 ; j <= num ; j++){
	    	var workfrom = document.querySelector("#projectstart" + j);
	    	var workto = document.querySelector("#projectcomplete" + j);
	   	    checkdates(workfrom  , workto);
		}
	}
}


// CHECK THAT FIELD IF BOTH DATES ARE SAME OF WORKEXP UPDATE SESSION
var checkboxdiv = document.querySelector(".workexpsession");
var num = checkboxdiv.getAttribute("id");
for(var i=1 ; i <= num ; i++){
	    var workfrom = document.querySelector("#updatedatefrom" + i);
	    var workto = document.querySelector("#updatedatecompl" + i);
		if( workfrom.value === workto.value){
			var checinput = document.querySelector("#exampleCheckboxes"+ i);
			checinput.checked = true;
		}
	}



// PROJECT UPDATE SESSION CHECK DATE CHECK THE CHECKBOX
var checkboxdiv = document.querySelector(".projectsession");
var num = checkboxdiv.getAttribute("id");
for(var i=1 ; i <= num ; i++){
	var dateupdatefrom = document.querySelector("#projectstart" +i);
	var dateupdateto  = document.querySelector("#projectcomplete" + i);
	if( dateupdatefrom.value === dateupdateto.value){
			var checinput = document.querySelector("#exampleCheck15"+ i);
			checinput.checked = true;
		}
}



// FUNCTION FOR CHECK DATES 
function checkdates(startdate , enddate){
	if(startdate.value > enddate.value) {
        alert("End date should be greater than Start date");
        enddate.value = "";
    }
}


// check for function and update the checkbox
function checkboxupdate(checkboxelm , startdate , enddateelm){
	var chekboxval  = checkboxelm.getAttribute("value");
	if(chekboxval === "yes"){
	  var workfrom = startdate.value;
	  enddateelm.value = workfrom;
	}
}

