const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js"); 
const listingsController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router.route("/")
    .get(wrapAsync(listingsController.index))
    .post(
        isLoggedIn,
        upload.array('listing[images]', 4),  
        validateListing,
        wrapAsync(listingsController.createlisting)
    );

// SEARCH ROUTE ADD KIYA
router.get("/search", wrapAsync(listingsController.searchListings));

router.get("/new", isLoggedIn, listingsController.renderNewForm); 

router.route("/:id")
    .get(wrapAsync(listingsController.showListing))
    .put(
        isLoggedIn, 
        isOwner,
        upload.array('listing[images]', 4),  
        validateListing, 
        wrapAsync(listingsController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingsController.deleteListing)
    );

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

module.exports = router;