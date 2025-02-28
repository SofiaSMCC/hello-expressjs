import { Movie } from "../types/movie";
import { v4 as uuidv4 } from "uuid";

let movies: Movie[] = [];

export const getAllMovies = async (): Promise<Movie[]> => {
  return movies;
};

export const addMovie = async (newMovie: Omit<Movie, "id">): Promise<Movie> => {
  const id = uuidv4();
  const movie = { id, ...newMovie };
  movies.push(movie);
  return movie;
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  return movies.find((movie) => movie.id === id) || null;
};
