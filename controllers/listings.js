const Listing = require("../models/listing");




module.exports.index = async (req,res) => {
    const allListings =  await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};

module.exports.renderNewForm =  (req ,res) => {
    res.render("listings/new.ejs");

};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
     const listing = await Listing.findById(id).populate({path : "reviews",populate : { path : "author"},}).populate("owner");
     if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
     }
     
    res.render("listings/show.ejs",{listing});

};

module.exports.createListings = async (req, res, next) => {
  try {
    let url = req.file.path;
    let filename = req.file.filename;

    // Create a new listing instance from the data in req.body.listing
    const newListing = new Listing(req.body.listing);

    // Set the owner as the logged-in user
    newListing.owner = req.user._id;

    // Set the image object with the file data
    newListing.image = { url, filename };

    // Save the listing to the database
    let savedListing = await newListing.save();

    // Log the saved listing (for debugging purposes)
    console.log(savedListing);

    // Set the success flash message
    req.flash("success", "New Listing created!");

    // Redirect to /listings page
    res.redirect("/listings");
  } catch (e) {
    next(e); // If an error occurs, pass it to the next middleware (error handler)
  }
};


  module.exports.renderEditform= async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
        
     }
     
    let originalImageUrl =  listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
 
     res.render("listings/edit.ejs",{listing , originalImageUrl});
 
    };

    module.exports.updateListing= async (req, res) => {
      let {id}= req.params;
    let listing= await Listing.findByIdAndUpdate(id, {...req.body.listing});
     
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image={url , filename};
    await listing.save();
     }

     req.flash("success", "Listing Updated!");
      
      res.redirect(`/listings/${id}`);
    };

    module.exports.destroyListing= async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
      }
