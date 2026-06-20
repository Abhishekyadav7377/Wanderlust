const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
    },

    images:[
        {
            url:String,
            filename:String,
        }
    ],

    price:{
        type:Number,
    },

    location:{
        type:String,
    },

    country:{
        type:String,
    },

    //CATEGORY ADD KIYA
    category:{
        type:String,
        enum:['trending', 'rooms', 'iconic-cities', 'mountains', 'castles', 'camping', 'farms', 'arctic'],
        default:'trending'
    },

    // MAPBOX GEOJSON
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point",
        },

        coordinates:{
            type:[Number],

            default:[
                77.2170,
                28.6139
            ]
        }
    },

    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }

});

listingSchema.post(
    "findOneAndDelete",
    async(listing)=>{

        if(listing){

            await Review.deleteMany({

                _id:{
                    $in:
                    listing.reviews
                }

            });

        }

    }
);

const listing =
mongoose.model(
    "listing",
    listingSchema
);

module.exports =
listing;