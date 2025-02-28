import { Request, Response, NextFunction } from "express";
import { getAllMovies, addMovie, getMovieById } from "./movie.service";
import { validationResult } from "express-validator";

export const fetchAllMovies = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const movies = await getAllMovies();
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

export const createMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { title, director, year, genre } = req.body;
    const newMovie = await addMovie({ title, director, year, genre });
    res.status(201).json(newMovie);
  } catch (error) {
    next(error);
  }
};

export const fetchMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const movie = await getMovieById(id);
    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }
    res.status(200).json(movie);
  } catch (error) {
    next(error);
  }
};
