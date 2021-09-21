var posturl     =   document.querySelector("[data-form]").getAttribute("data-form");
var form        =   document.querySelector("[data-form]");
var flashelm    =   document.querySelector("#faliure-meessage-of-aadhar-verification");

form.addEventListener("submit" , function(e){
    e.preventDefault();
	console.log("removing mssage");
	flashelm.style.display = null;
	console.log("forced prevenet");
	screenblock();
	startloadersec();
	var formdata = new FormData(this);
	axios.post(posturl, formdata)
	.then(function (response){
		console.log(response);
		if(response.status === 200){
			if(response.data.status){
				if(response.data.status === 400){
					screenclear();
					loadoutsec();
					flashelm.style.display = "block";
				}
			}
			if(response.data.status === 200){
				screenclear();
				loadoutsec();
				flashelm.style.display = null;
				verifyotp(response.data);
			}
		}else{
			console.log("Something-went wrong");
		}
       
	}).catch(function (error) {
	console.log(error);
	});
});

// Messages selection
var successmessage = document.querySelector("#success-meessage-of-otp-verification");
var failuremessage = document.querySelector("#failure-meessage-of-otp-verification");


function verifyotp(data){
	successmessage.style.display = null;
	failuremessage.style.display = null;
	// Disclose firstmodal
	var disclosemodal = document.querySelector(".phone_number-attchment-reject");
	disclosemodal.click();
	// Set OTP message and addhar Number
	var ptag = document.querySelector("#otp-phone-number-and-aadhar1");
	var textdataofpone = "An OTP has been send to " + data.number.substring(0,1) + "******" + data.number.substring(7);
	ptag.innerHTML = textdataofpone;
	var ptagtwo = document.querySelector("#otp-phone-number-and-aadhar2");
	var textdataofptwo = " Aadhar Number :"  + data.aadharnum;
	ptagtwo.innerHTML = textdataofptwo;
	// Open OTP modal
	var triggerbutton = document.querySelector("#OTP-verification-modal-button");
	triggerbutton.click();
	// Setting value to 
	var phone_input = document.querySelector("#phone_input"); 
	phone_input.setAttribute("value" , data.number);
	var otpposturl = document.querySelector("[data-formsec]").getAttribute("data-formsec");
    var otpsubmitform = document.querySelector("[data-formsec]");
	
	otpsubmitform.addEventListener("submit" , function(e){
		e.preventDefault();
		screenblock();
		startloaderthree();
		var formdata = new FormData(this);
		// Appending data in formdata
		formdata.append("files" , data.subdata);
		formdata.append("aadharnum" , data.aadharnum);
		
		axios.post(otpposturl , formdata)
		 .then(function (response){
			if(response.data.status === 200){
				failuremessage.style.display = null;
				successmessage.style.display = null;
				successmessage.style.display = "block";
				location.reload(true);
			}
			
			if(response.data.status === 400){
				screenclear();
				loadoutthree();
				failuremessage.style.display = null;
				successmessage.style.display = null;
				failuremessage.style.display = "block";
			}
			
		 }).catch(function (error) {
		   console.log(error);
		 });
});
}

// DOM Block function =================
function screenblock(){
	var screenblockelm = document.querySelector(".screen-blocker"); 
	screenblockelm.classList.remove("main-loader-div");
}

function screenclear(){
	var screenblockelm = document.querySelector(".screen-blocker"); 
	screenblockelm.classList.add("main-loader-div");
}
// ========================

// Aadhar screen loader ===================

function startloadersec(){
	 var loader = document.querySelector(".aadhar-loadar-candidate");
	 loader.classList.remove("main-loader-div");
}

function loadoutsec(){
	var loader = document.querySelector(".aadhar-loadar-candidate");
	loader.classList.add("main-loader-div");
	 
}
// ==========================

// OTP screen loader ==================

function startloaderthree(){
	 var loader = document.querySelector(".otp-loadar-candidate");
	 loader.classList.remove("main-loader-div");
}

function loadoutthree(){
	var loader = document.querySelector(".otp-loadar-candidate");
	loader.classList.add("main-loader-div");
	 
}
//=================================
