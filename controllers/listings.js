const Listing = require("../models/listing");

module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;

    const listing = await Listing
        .findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author"
            }
        })
        .populate("owner");

    if(!listing){
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {listing});
};

module.exports.searchListings = async(req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === "") {
            return res.redirect("/listings");
        }

        // Search by country (case-insensitive)
        const searchResults = await Listing.find({
            country: { $regex: query, $options: "i" }
        });

        res.render("listings/index.ejs", { 
            allListings: searchResults,
            searchQuery: query
        });
    } catch (err) {
        req.flash("error", "Search error occurred!");
        res.redirect("/listings");
    }
};

module.exports.createlisting = async(req,res) => {
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;

    //  CATEGORY ADD KIYA
    newlisting.category = req.body.listing.category || 'trending';

    // Convert latitude/longitude to GeoJSON geometry
    const lat = parseFloat(req.body.listing.latitude);
    const lng = parseFloat(req.body.listing.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
        newlisting.geometry = {
            type: "Point",
            coordinates: [lng, lat]  // GeoJSON = [longitude, latitude]
        };
    }
    
    // IMAGES
    if(req.files && req.files.length > 0){
        newlisting.images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }

    await newlisting.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newlisting._id}`);
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;

    const listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", {listing});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    
    listing.category = req.body.listing.category || listing.category;
    
    const lat = parseFloat(req.body.listing.latitude);
    const lng = parseFloat(req.body.listing.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
        listing.geometry = {
            type: "Point",
            coordinates: [lng, lat]  
        };
    }

    // IMAGES
    if(req.files && req.files.length > 0){
        listing.images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res) => {
    let {id} = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};