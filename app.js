var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"), 
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    passportLocal   = require("passport-local"),
    expressSession  = require("express-session"),
    flash           = require("connect-flash"),
    User            = require("./models/user.js"),
    movie           = require("./models/movie.js"),
    Comment         = require("./models/comment.js"),
	Reply           = require("./models/reply.js");
    
var movieRoute = require("./routes/movies.js"),
    commentsRoute   = require("./routes/comments.js"),
    indexRoute       = require("./routes/index.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
// mongoose.connect("mongodb://localhost/filmy_geek");
// mongoose.connect("mongodb+srv://amansohani222:kirtisohani@cluster0-hytoc.mongodb.net/test?retryWrites=true&w=majority");
// seedDB();
mongoose.connect("mongodb+srv://katmovie:aman@cluster0-0dfpm.gcp.mongodb.net/test?retryWrites=true&w=majority");

//################################ ADDING PASSPORT ##########################################\\
app.use(expressSession({
    secret: "My name is Aman",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//##########################################################################################\\

app.use(flash());

// For accessing variables in ejs files
app.use(function(req, res, next){
    res.locals.currentUsr = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});



app.use(movieRoute);
app.use(commentsRoute);
app.use(indexRoute);



app.listen(3000,function(){
    console.log("Server Started");
});

