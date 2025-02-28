import { body } from "express-validator";

export const validateMovie = [
  body("title").notEmpty().withMessage("Title of the movie is obligatory."),
  body("director").notEmpty().withMessage("Director name is obligatory."),
  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(
      `Year should be between 1900 and ${new Date().getFullYear()}.`
    ),
  body("genre").notEmpty().withMessage("Genre of the movie is obligatory."),
];
