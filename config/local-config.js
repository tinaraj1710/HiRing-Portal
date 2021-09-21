var   passport           =    require("passport"),
	  User				 =    require("../models/user"),
	  LocalStrategy      =    require("passport-local").Strategy,
      bcrypt             =    require("bcrypt");



passport.use(new LocalStrategy(({usernameField : "email"}) ,
  function(email, password, done) {
	// FIND USER FROM DB IF NOT FOUND THEN CREATE USER
	User.findOne({"local.email" : email }, async function (err, user) {
      if(err){
			console.log(err);
		}else{
			if(!user){
				// USER NOT EXIST IN DB
				return done(null, false);
			}
			try{
				if(await bcrypt.compare(password , user.local.password)){
					// USER SHOULD LOGGEDIN
					// IF USER HAD NOT VERIFIED THEIR EMAIL THEN NOT ABLE TO LOGGEDIN
					if(user.local.emailverified === true){
						return done(null,user); 
					}
					return done(null,false); 
					
				}else{
					// PASSWORD IS WRONG
					return done(null,false); 
				}
			}catch(err){
				return done(err);
			}
		}
    });
  }
));