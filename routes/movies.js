var express = require("express");
var router = express.Router();
var movie = require("../models/movie.js");
var Comment = require("../models/comment.js");
var request = require("request");

router.get("/movies",function(req,res){
    movie.find({}, function(err, foundMovies){
     if(err)
      console.log(err);
     else
      {   
          res.render("movie/index.ejs", {movies: foundMovies});
      }
    });
});

//=========================================================================================================================

router.get("/movies/new", isLoggedIn, function(req,res){
    res.render("movie/new_name.ejs");
});

router.get("/movies/new/aman", isLoggedIn, function(req,res){
    var name=req.query.movie_name;
    request("http://www.omdbapi.com/?s="+name+"&apikey=thewdb", function(error,response,body){
        if(!error&&response.statusCode==200)
        {  var arr = [];
           var data = JSON.parse(body);
        //   for(var i=0;i<data.Search.length;i++)
        //     {var id = data.Search[i].imdbID;
        //      request("http://www.omdbapi.com/?i="+id+"&apikey=thewdb", function(error,response,body){
        //      var data1 = JSON.parse(body);
        //      arr[i]=data1.imdbRating;
        //      console.log(arr[i]);
        //      }); 
        //     }
        //     setTimeout(function(){
        //         console.log(arr.length+" ====== "+data.Search.length);
        //     //  for(var i=0;i<arr.length;i++)
        //     //  {console.log(data.Search[i].Title+" - "+arr[i]); }
           res.render("movie/new_aman.ejs",{ data: data, res: res });
        }
        else{
            res.send("SORRY");
        }
        
    });
});

router.post("/movies/new", isLoggedIn, function(req, res){
    var imdbID = req.body.imdbID;
    var link = req.body.link;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    request("http://www.omdbapi.com/?i="+imdbID+"&apikey=thewdb", function(error, response, foundMovie){
        var poster;
        if(error)
         res.send("Sorry !!");
        else
        {
            var mv = JSON.parse(foundMovie);
            poster = mv.Poster;
            var obj = {imdbID: imdbID, link: link, author: author, title: mv.Title, poster: poster};
            movie.create(obj, function(err, success){
                if(err)
                 console.log(err);
                else
                {
                    req.flash("success", "New movie added successfully");
                    res.redirect("/movies");
                }
            });
        }
        });
    
    
    
});

//==============================================================================================================================

router.get("/movies/:id", function(req, res) {
    var _id = req.params.id;
    movie.findById(_id).populate({
    path: 'comments',
    populate: { path: 'replies' }
  }).exec(function(err, foundMovie){
     if(err)
      console.log(err);
     else{
            request("http://www.omdbapi.com/?i="+foundMovie.imdbID+"&apikey=thewdb", function(error, response, mv){
                    if(error)
                     res.send("Sorry !!");
                    else
                    {
                        var mve = JSON.parse(mv);
                        res.render("movie/show.ejs", {moviec: mve, movie: foundMovie, Comment: Comment}); }
            });
     }
    });
});

router.get("/movies/:id/edit", hasOwnership, function(req, res){
    movie.findById(req.params.id, function(err, foundMovie){
        if(err)
         { console.log(err);
           res.redirect("/movies/"+req.params.id); }
        else
        {
            res.render("movie/edit.ejs", {movie: foundMovie});
        }
    })
    
});

router.post("/movies/:id/edit", hasOwnership, function(req, res){
    movie.findByIdAndUpdate(req.params.id, req.body.movie, function(err, success){
        if(err)
        {
            console.log(err);
            res.redirect("/movies/"+req.params.id);
        }
        else
        {   req.flash("success", "Your movie's link updated successfully");
            res.redirect("/movies/"+req.params.id);
        }
    });
});

router.post("/movies/:id/delete", hasOwnership, function(req, res){
    movie.findByIdAndRemove(req.params.id, function(err){
        if(err)
         { console.log(err);
           res.redirect("/movie/"+req.params.id); }
        else
         {   req.flash("success", "movie deleted successfully");
             res.redirect("/movies"); }
    });
});

router.post("/movies/search", function(req, res){
    var searchParameter = req.body.search;
    movie.find({title: new RegExp(searchParameter, 'i')}, function(err, foundMovies){
        if(err)
            console.log(err);
        else{
            console.log(foundMovies);
            res.render("movie/searchResult.ejs", {movies: foundMovies});
        }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
    else
    {   
        req.flash("error", "You need to login first");
        res.redirect("/login");
    }
}

function hasOwnership(req, res, next){
    if(!req.isAuthenticated())
     {   res.flash("error", "You don't have permission to do this");
         res.redirect("back"); }
    else{
        movie.findById(req.params.id, function(err, foundmovie){
            if(err)
            {
                console.log(err);
                res.flash("error", "You don't have permission to do this");
                res.redirect("back");
            }
            else{
                if(req.user._id.equals(foundmovie.author.id))
                 next();
                else
                {res.flash("error", "You don't have permission to do this");
                 res.redirect("back"); }
            }
        });
    }
   
}

module.exports = router;