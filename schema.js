const Joi = require('joi');
const listing = require('./models/listing');
const Review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        
        category: Joi.string().valid('trending', 'rooms', 'iconic-cities', 'mountains', 'castles', 'camping', 'farms', 'arctic').required(),
        
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
});