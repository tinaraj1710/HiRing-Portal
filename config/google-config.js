var   passport           =    require("passport"),
	  fs				 =    require("fs"),
 	  GoogleStrategy	 =    require("passport-google-oauth20").Strategy,
	  User				 =    require("../models/user");


// SERIALIZE USER
passport.serializeUser((user , done)=>{
	done(null , user.id);
});

// DESERIAL USER
passport.deserializeUser(function(id , done){
	User.findById(id , function(err , founduser){
		done(err , founduser);
	});
});

// PASSPORT JS GOOGLE LOGIN ===================
passport.use(new GoogleStrategy({
	callbackURL	: `${process.env.WEBSITEURL}/dashboard/auth/google/redirect`,
	clientID : process.env.GOOGLE_CLIENT_ID,
	clientSecret : process.env.GOOGLE_CLIENT_SECRET,
	passReqToCallback : true
    } , function(req , accessToken , refreshToken , profile , email , done){
	  // FIND USER FROM DATABASE AND IF USER NOT EXIST THN CREATE NEW USER
	   	User.findOne({"googleauth.googleid" : email._json.sub} , function(err , founduser){
		if(err){
			console.log(err);
		}else{
			if(founduser){
				// USER ALRAEDY EXIST 
				done(null,founduser);
			}else{
				// CREATE NEW USER 
				User.create({
					"googleauth.fullname" : email._json.name,
					"googleauth.firstname" : email._json.family_name,
					"googleauth.lastname" : email._json.given_name,
					"googleauth.email" : email._json.email,
					"googleauth.googleid" :email._json.sub
				} , function(err , createduser){
					if(err){
						console.log(err);
					}else{
						done(null , createduser);
					}
				});
				
			}
		}
	}); 
}));
// ===================================
