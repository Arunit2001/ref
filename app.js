require('dotenv').config()

var express    = require("express")
var	app        = express()
var	bodyParser = require("body-parser")
var mongoose   = require("mongoose")
var Photos     = require("./models/photos")
var	Comment    = require("./models/comment")
var User       = require("./models/user")
var	multer     = require("multer")

var storage    = multer.diskStorage({
		filename: function(req, file, cb){
			cb(null, Date.now() + file.originalname)
		}
	});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'iiitians-network', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


mongoose.connect("mongodb://localhost/reflection", { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
	console.log('Connected to DB!')
}).catch(err => {
	console.log('ERROR:', err.message)
});

app.set("view engine", "ejs")
app.use(express.static(__dirname+"/public"))
// app.use("/uploads", express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: true }))

//*******//
// Home  //
app.get("/", function(req, res){
	res.render("home")
})

//***********//
//  Gallery  //
//***********//
app.get("/gallery", function(req, res){
	Photos.find({}, function(err, photos){
		res.render("photos", {gallery:photos})
	})
})

app.get("/gallery/create", function(req, res){
	res.render("new")
})
//Show//
app.get("/gallery/:id", function(req, res){
	Photos.findById(req.params.id).populate("comment").exec(function(err, photos){ 
		if(err){
			console.log(err)
			res.redirect("back")
		}else{
			res.render("show", {gallery:photos})
		}
	})
})
//New//
app.post("/gallery", upload.single('image'), function(req, res){
	cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
 		req.body.galleries.image = result.secure_url
		Photos.create(req.body.galleries, function(err, photos){
			if(err){
				console.log(err)
				res.redirect("back")
			}else{
				res.redirect("/gallery")
			}
		})
	})
})

//************//
//  Comments  //
//************//
app.post("/gallery/:id/comments", function(req, res){
	Photos.findById(req.params.id, function(err, photos){
		if(err){
			console.log(err)
			res.redirect("back")
		}else{
			Comment.create(req.body.comments, function(err, comments){
				if(err){
					console.log(err)
					res.redirect("/")
				}else{
					photos.comment.push(comments)
					photos.save()
					res.redirect("/gallery/"+req.params.id)
				}
			})
		}
	})
})

app.listen(3000, function(){
	console.log("Server listening to Reflection")
})