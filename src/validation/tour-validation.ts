import Joi from "joi";

const createTourSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "any.required": "Name is Required",
    "string.empty": "Name cannot be empty",
    "string.base": "Name must be a text value",
  }),
  price: Joi.number().required().min(0).messages({
    "any.required": "Price is Required",
    "number.empty": "Price cannot be empty",
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
  }),
  summary: Joi.string().required().trim().messages({
    "any.required": "Summary is Required",
    "string.empty": "Summary cannot be empty",
    "string.base": "Summary must be a text value",
  }),
  description: Joi.string().required().trim().messages({
    "any.required": "Description is Required",
    "string.empty": "Description cannot be empty",
    "string.base": "Description must be a text value",
  }),
  cover_image: Joi.string().required().uri().messages({
    "any.required": "Cover image is Required",
    "string.empty": "Cover image cannot be empty",
    "string.uri": "Cover image must be a valid URL",
  }),
  images: Joi.array().items(Joi.string().uri()).messages({
    "array.base": "Images must be an array",
    "string.uri": "Each image must be a valid URL",
  }),
});

export default createTourSchema;
