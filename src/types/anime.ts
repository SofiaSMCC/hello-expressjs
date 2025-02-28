export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  year: number;
  genres: { name: string }[];
}

export interface AnimeResponse {
  data: Anime[];
}

export interface Episode {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

export interface EpisodesResponse {
  data: {
    episodes: Episode[];
  };
}

export interface AnimeCharacter {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

export interface CharacterData {
  character: AnimeCharacter;
}

export interface CharactersResponse {
  data: CharacterData[];
}
