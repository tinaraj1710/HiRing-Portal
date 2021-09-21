var   passport           =    require("passport"),
	  fs                 =    require("fs"),
 	  LinkedInStrategy   =    require('passport-linkedin-oauth2').Strategy,
	  User				 =    require("../models/user");

passport.serializeUser((user , done)=>{
	done(null , user.id);
});

passport.deserializeUser(function(id , done){
	User.findById(id , function(err , founduser){
		done(err , founduser);
	});
});

// LINKEDIN LOGI STRATEGY
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "/dashboard/auth/linkedin/redirect",
  scope: ['r_emailaddress', 'r_liteprofile'],
  passReqToCallback   : true
}, function(req , accessToken, refreshToken, profile, done) {
	// CHECK USER DATA IN DB IF USER IS NOT EXIST THEN CREATE USER
	User.findOne({"linkedinauth.linkedinid" : profile.id} , function(err , founduser){
		if(err){
			console.log(err);
		}else{
			if(founduser){
				// USER ALREADY EXIST IN DB
				done(null,founduser);
			}else{
				// USER DOES NOT EXIST IN DB
				User.create({
					"linkedinauth.fullname" : profile.displayName,
					"linkedinauth.firstname" : profile.name.givenName,
					"linkedinauth.lastname" : profile.name.familyName,
					"linkedinauth.email" : profile.emails[0].value,
					"linkedinauth.linkedinid" : profile.id
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
