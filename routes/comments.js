var express = require("express");
var router = express.Router();
var movie = require("../models/movie.js");
var Comment = require("../models/comment.js");
var Reply = require("../models/reply.js");

router.get("/movies/:id/comments/new", isLoggedIn, function(req, res){
    movie.findById(req.params.id, function(err, foundmovie){
        if(err)
         console.log(err);
        else
        {
            
            res.render("comment/new.ejs", {movie: foundmovie});
        }
    });
});

router.post("/movies/:id/comments", isLoggedIn, function(req,res){
    var comment = req.body.comment;
    Comment.create(comment, function(err, success){
        if(err)
         console.log(err);
        else
        {   success.author.id = req.user._id;
            success.author.username = req.user.username;
            success.save();
            movie.findById(req.params.id, function(err, foundmovie){
                if(err)
                 console.log(err);
                else
                {
                    foundmovie.comments.push(success);
                    foundmovie.save();
                    req.flash("success", "New comment added successfully");
                }
                
                res.redirect("/movies/"+req.params.id);
            });
        }
    });
});

router.get("/movies/:id/comments/:comment_id/edit", hasOwnership, function(req, res){
    movie.findById(req.params.id, function(err, foundmovie){
        if(err)
        {
            console.log(err);
            res.redirect("/movies/"+req.params.id);
        }
        else
        {
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err)
                {
                    console.log(err);
                    res.redirect("/movies/"+req.params.id);
                }
                else
                {  
                    res.render("comment/edit.ejs", {movie: foundmovie, comment: foundComment});
                }
            });
        }
    });
});

router.post("/movies/:id/comments/:comment_id/edit", hasOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, success){
        if(err)
         { console.log(err);
           res.redirect("/movies/"+req.params.id); }
        else
        { req.flash("success", "Comment edited successfully");
          res.redirect("/movies/"+req.params.id); }
    });
});

router.post("/movies/:id/comments/:comment_id/delete", hasOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err)
         { console.log(err);
           res.redirect("/movies/"+req.params.id); }
        else
         {   req.flash("success", "Comment deleted successfully");
             res.redirect("/movies/"+req.params.id); }
         
    });
});

//REPLY PART

router.get("/movies/:id/comments/:comment_id/reply", isLoggedIn, function(req, res){
    movie.findById(req.params.id, function(err, foundmovie){
        if(err)
         console.log(err);
        else
        {            
            res.render("reply/new.ejs", {movie: foundmovie, comment: req.params.comment_id});
        }
    });
});

router.post("/movies/:id/comments/:comment_id/reply", isLoggedIn, function(req,res){
    var reply = req.body.reply;
	Reply.create(reply, function(err, success){
		if(err)
			console.log(err);
		else
			{
				success.author.id = req.user._id;
				success.author.username = req.user.username;
            	success.save();
				Comment.findById(req.params.comment_id, function(err, foundComment){
					if(err)
					 console.log(err);
					else
					{
						foundComment.replies.push(success);
						foundComment.save();
						req.flash("success", "New reply added successfully");
					}
					
					res.redirect("/movies/"+req.params.id);
				});
			}
	});
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
    else
    {   req.flash("error", "You need to login first");
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