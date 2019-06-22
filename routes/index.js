var express = require("express");
var router = express.Router();
var User = require("../models/user.js");
var passport = require("passport");

router.get("/",function(req,res){
    res.render("landing.ejs");
});

router.get("/register", function(req, res){
    res.render("register.ejs");
});

router.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err)
        {
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome "+user.username+" to FilmyGeek.com");
                res.redirect("/movies");
            });
            
        }
    })
});

router.get("/login", function(req, res){
    res.render("login.ejs");
});

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Username or password didn't match"
}), function(req, res){
    req.flash("success", "Welcome back "+req.user.username);
    res.redirect("/movies");
});

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged you out");
    res.redirect("/movies");
});

// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated())
//      return next();
//     else
//     {   
//         res.redirect("/login");
//     }
// }

module.exports = router;