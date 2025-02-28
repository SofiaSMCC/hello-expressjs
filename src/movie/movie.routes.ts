import express from "express";
import {
  fetchAllMovies,
  createMovie,
  fetchMovieById,
} from "../movie/movie.controller";
import { validateMovie } from "../movie/movie.validation";
import { authenticateJWT } from "../auth/auth.controller";

const router = express.Router();

router.use(authenticateJWT);

router.get("/", fetchAllMovies);
router.post("/", validateMovie, createMovie);
router.get("/:id", fetchMovieById);

export default router;
