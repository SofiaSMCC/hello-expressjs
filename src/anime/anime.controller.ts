import { Request, Response, NextFunction } from "express";
import axios from "axios";
import {
  AnimeResponse,
  EpisodesResponse,
  Episode,
  Anime,
  CharacterData,
  CharactersResponse,
} from "./anime";

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

export const fetchAnime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const animeId = req.params.id;
    const response = await axios.get(`${url}/anime/${animeId}`);
    res.json(response.data);
  } catch (error) {
    next(error);
  }
};

// Get anime by gender

export const animeByGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const genreName = req.params.genreName.toLowerCase();
    const response = await axios.get<AnimeResponse>(`${url}/anime`);

    const animes = response.data.data.filter((anime) =>
      anime.genres.some((genre) => genre.name.toLowerCase() === genreName)
    );

    const result = animes.map((anime) => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      year: anime.year,
    }));

    res.json({ data: result });
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

    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: query },
    });

    if (searchResponse.data.data.length === 0) {
      res.status(404).json({ error: "Anime not found." });
      return;
    }

    const animes = searchResponse.data.data
      .filter((anime: Anime) =>
        anime.title.toLowerCase().includes(query.toLowerCase())
      )
      .map((anime: Anime) => ({
        id: anime.mal_id,
        title: anime.title,
        image: anime.images.jpg.image_url,
        year: anime.year,
      }));

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
    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: animeName },
    });

    if (searchResponse.data.data.length === 0) {
      res.status(404).json({ error: "Anime not found." });
      return;
    }

    const animeId = searchResponse.data.data[0].mal_id;
    const episodesResponse = await axios.get<EpisodesResponse>(
      `${url}/anime/${animeId}/videos`
    );

    const episodes = episodesResponse.data.data.episodes.map(
      (episode: Episode) => ({
        id: episode.mal_id,
        url: episode.url,
        image: episode.images.jpg.image_url,
      })
    );
    // .sort((a, b) => a.id - b.id); // Order episodes by id

    res.json({ episodes: episodes });
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
    const animeName = encodeURIComponent(req.params.anime);

    const searchResponse = await axios.get<AnimeResponse>(`${url}/anime`, {
      params: { q: animeName },
    });

    if (searchResponse.data.data.length === 0) {
      res.status(404).json({ error: "Anime not found." });
      return;
    }

    const animeId = searchResponse.data.data[0].mal_id;

    const response = await axios.get<CharactersResponse>(
      `${url}/anime/${animeId}/characters`
    );

    const characters = response.data.data.map(
      (characterData: CharacterData) => {
        const character = characterData.character;
        return {
          id: character.mal_id,
          name: character.name,
          image: character.images?.jpg?.image_url,
        };
      }
    );

    res.json({ characters });
  } catch (error) {
    next(error);
  }
};
