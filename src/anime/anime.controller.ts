import { Request, Response, NextFunction } from "express";
import axios from "axios";
import {
  AnimeResponse,
  EpisodesResponse,
  CharactersResponse,
} from "../types/anime";
import { throwError } from "../anime/anime.error";

require("dotenv").config();

const url = process.env.ANIME_API_URL;

// API test

export const fetchAllData = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await axios.get(`${url}/anime`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

// Fetch anime by ID

export const fetchAnime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const animeId = req.params.id;
    const response = await axios.get(`${url}/anime/${animeId}`);

    if (!response.data) {
      throwError("Anime not found", 404);
    }

    const { title, trailer } = response.data.data;
    const trailer_url = trailer.url;

    res.json({ title, trailer_url });
  } catch (error) {
    next(error);
  }
};

// Get anime by genre

export const animeByGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const genreName = req.params.genreName.toLowerCase();

    if (!genreName) {
      throwError("Genre name is required", 400);
    }

    const response = await axios.get<AnimeResponse>(`${url}/anime`);

    const animes = response.data.data.filter((anime) =>
      anime.genres.some((genre) => genre.name.toLowerCase() === genreName)
    );

    if (!animes || animes.length === 0) {
      throwError(`No anime found for genre: ${genreName}`, 404);
    }

    const result = animes.map((anime: any) => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images,
      year: anime.year,
    }));

    res.json({ result });
  } catch (error) {
    next(error);
  }
};

// Get anime by 1 or more words

export const animeByWords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.params.query;

    if (!query) {
      throwError("Query is required", 400);
    }

    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: query },
    });

    const anime_data = searchResponse.data.data;

    if (!anime_data || anime_data.length === 0) {
      throwError("Anime not found", 404);
    }

    const animes = searchResponse.data.data
      .filter((anime: any) =>
        anime.title.toLowerCase().includes(query.toLowerCase())
      )
      .map((anime: any) => ({
        id: anime.mal_id,
        title: anime.title,
        image: anime.images,
        year: anime.year,
      }));

    if (!animes || animes.length === 0) {
      throwError("Anime not found", 404);
    }

    res.json({ animes: animes });
  } catch (error) {
    next(error);
  }
};

// Get episodes by anime

export const animeEpisodes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const animeName = req.params.anime;

    if (!animeName) {
      throwError("Anime name is required", 400);
    }

    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: animeName },
    });

    const animeData = searchResponse.data.data;

    if (!animeData || animeData.length === 0) {
      throwError("Anime not found", 404);
    }

    const exactMatch = animeData.find(
      (anime) => anime.title.toLowerCase() === animeName.toLowerCase()
    );

    if (!exactMatch) {
      throwError("Anime not found", 404);
    }

    const animeId = exactMatch.mal_id;
    const episodesResponse = await axios.get<EpisodesResponse>(
      `${url}/anime/${animeId}/videos`
    );

    if (
      !episodesResponse.data.data.episodes ||
      episodesResponse.data.data.episodes.length === 0
    ) {
      throwError("Episodes not found", 404);
    }

    const episodes = episodesResponse.data.data.episodes.map(
      (episode: any) => ({
        id: episode.mal_id,
        url: episode.url,
        image: episode.images,
      })
    );

    res.json({ episodes });
  } catch (error) {
    next(error);
  }
};

// Get characters by anime

export const fetchAnimeCharacters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const animeName = req.params.anime;

    if (!animeName) {
      throwError("Anime name is required", 400);
    }

    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: animeName },
    });

    const animeData = searchResponse.data.data;

    if (!animeData || animeData.length === 0) {
      throwError("Anime not found", 404);
    }

    const exactMatch = animeData.find(
      (anime) => anime.title.toLowerCase() === animeName.toLowerCase()
    );

    if (!exactMatch) {
      throwError("Anime not found", 404);
    }

    const animeId = exactMatch.mal_id;

    const response = await axios.get<CharactersResponse>(
      `${url}/anime/${animeId}/characters`
    );

    if (!response.data.data || response.data.data.length === 0) {
      throwError("Characters not found", 404);
    }

    const characters = response.data.data.map((characterData: any) => {
      const character = characterData.character;
      return {
        id: character.mal_id,
        name: character.name,
        image: character.images,
      };
    });

    res.json({ characters });
  } catch (error) {
    next(error);
  }
};
