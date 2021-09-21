require('dotenv').config();
var   express 			 = 	  require("express"),
 	  app 				 = 	  express(),
	  mongoose           =    require("mongoose"),
	  methodOverride     =    require("method-override"),
	  flash              =    require("connect-flash"),
	  multer             =    require("multer"),
      passport           =    require("passport"),
	  googleAuthRoutes   =    require("./routes/google-auth"),
	  googleAuthSetup    =    require("./config/google-config"),
	  linkedinAuthRoutes =    require("./routes/linkedin-auth"),
	  linkedinAuthSetup  =    require("./config/linkedin-config"),
	  localAuthSetup     =    require("./config/local-config"),
	  indexRoutes        =    require("./routes/Index"),
	  resumeRoutes       =    require("./routes/resumeRoutes"),
	  jobroutes          =    require("./routes/job"),
	  User               =    require("./models/user.js"), 
	  Education          =    require("./models/resume/education.js"),
	  Workexp            =    require("./models/resume/workexp.js"),
	  Award              =    require("./models/resume/award.js"),
	  Profdata           = 	  require("./models/resume/professionaldata.js"),
	  Resume             = 	  require("./models/resume/resume.js"),
	  cookieSession      =    require("cookie-session"),
	  bodyParser         =    require("body-parser");


// MONGODB DATABASE SETUP
mongoose.set("debug" , true);
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASEURL , { 
    useNewUrlParser: true, 
    useUnifiedTopology : true,
    keepAlive : true 
}).then(() => {
    console.log("connected to DB")
}).catch(err => {
    console.log("Got Error ===> " , err.message);
});


// STYLE FILES ========
app.use(express.static(__dirname + "/style"));

app.use(bodyParser.urlencoded({ extended : true}));

app.use(methodOverride("_method"));

// storage file name from multer 
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

// checks and only allow images 
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) { 
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

// cloudinary config
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "dgohuy1mb", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

// COOKIE SESSION  =============
app.use(cookieSession({
	maxAge :3*60*60*1000,
	keys : ["Hi This is simple dashboard"]
}));

// EXPRESS SESSION
app.use(require("express-session")({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave : false,
	saveUninitialized : false
}));

app.use(flash());

// PASSPORT AUTH SETUP ========
app.use(passport.initialize());
app.use(passport.session()); 

// VARIABLES THAT ARE ACCESSBLE TO ALL PAGES =========
app.use(async function(req,res,next){
	res.locals.CurrentUser = req.user;
	try {
		  var user = await User.findById(req.user._id).populate({path : "notifications",
			 populate: { path: "jobid" , populate : {path : "to author offerletter interview"}}}).exec();
			var allnotifications = [];
			for(var notification of user.notifications){
				if(notification.isRead === false){
					await allnotifications.push(notification);
				}
			}
		
        res.locals.notifications = allnotifications.reverse();
    } catch(err) {
      console.log("something went wrong 12345");
    }
	res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
	next();
});

// ROUTES ============
app.use("/dashboard/auth" ,  googleAuthRoutes);
app.use("/dashboard/auth" , linkedinAuthRoutes);
app.use(indexRoutes);
app.use("/user" , resumeRoutes);
app.use(jobroutes);

// UPLOAD IMAGE TO CLOUDINARY.COM SENDING OBJECT..
function upload_get_url(image){
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(image , {exif : true , resource_type: "image",} , (err, url) => {
      if (err) return reject(err);
      return resolve(url);
    });
  });
}

// PORT SETUP 
app.listen( process.env.PORT || 3000 , function(){
   console.log("server started..");
});