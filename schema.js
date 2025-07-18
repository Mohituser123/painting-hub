const Joi = require("joi");

module.exports.paintingSchema = Joi.object({
    painting: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        artist: Joi.string().required(),
        genre: Joi.string().required(),
        medium: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});



/* we have left node-modules , .env,package-lock.json,package.json*/