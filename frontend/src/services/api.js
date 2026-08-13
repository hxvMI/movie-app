const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const request = async (path, params = {}) => {
    if (!API_KEY) {
        throw new Error("TMDB API key is missing. Add VITE_TMDB_API_KEY to your .env file.");
    }

    const query = new URLSearchParams({ api_key: API_KEY, ...params });
    const response = await fetch(`${BASE_URL}${path}?${query}`);

    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }

    return response.json();
};


//async() is used whenever we need to wait on a response from something before we can perform an action
//await() is used whenever we do an async() operation that also needs to be waited for
export const getPopularMovies = async (page = 1) => {
  const data = await request("/movie/popular", { page });
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

export const getTopRatedMovies = async (page = 1) => {
  const data = await request("/movie/top_rated", { page });
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

export const getUpcomingMovies = async (page = 1) => {
  const data = await request("/movie/upcoming", { page });
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

export const getNowPlayingMovies = async (page = 1) => {
  const data = await request("/movie/now_playing", { page });
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

export const searchMovies = async (query, page = 1) => {
  const data = await request("/search/movie", { query, page });
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
};

export const getMovieDetails = async (movieId) => {
  return request(`/movie/${movieId}`, {
    append_to_response: "videos,credits,recommendations",
  });
// appending to the response combines these endpoints ontop of the basic ones we already get from the default
// Videos: /movie/{movieId}/videos
// Cast: /movie/{movieId}/credits
// Recommendations: /movie/{movieId}/recommendations

};

export const getMovieGenres = async () => {
  const data = await request("/genre/movie/list", {
    language: "en-US",
  });
  return data.genres;
};


export const discoverMovies = async ({
  genreIds = [],
  releaseYear = "",
  minimumRating = 0,
  sortBy = "popularity.desc",
  page = 1,
}) => {
    const params = {
    language: "en-US",
    include_adult: false,
    page,
    sort_by: sortBy,
  };
  
  //If genreArray length greater than 0 join them on genres with a |
  if(genreIds.length > 0) {
    // Pipe means Action OR Comedy, which is generally expected
    // when selecting multiple checkbox options.

    // genreIds is an array containing the IDs of the selected genres:
    // TMDB expects multiple genre IDs to be sent as one string. 
    // The array’s .join("|") method combines the values, placing | between them:
    // input [28, 35, 878] result "28|35|878"
    // para.with_genres adds the new property to params since it isn't there initally
    params.with_genres = genreIds.join("|");
  }

  if (releaseYear) params.primary_release_year = releaseYear;

  if(Number(minimumRating) > 0) params["vote_average.gte"] = minimumRating;

  // Prevent a movie with one perfect vote from dominating
  // rating-based sorting.
  if(sortBy === "vote_average.desc") params["vote_count.gte"] = 200;
  

  //Now we request the data and toss in the param's we defined at the top
  //NOTE: request() auto passes objects into URLSearchParams, producing a request similar to 
  ///discover/movie?with_genres=28%7C35%7C878 so we don't have to do it ourselves manually
  const data = await request("/discover/movie", params);
  return {
    movies: data.results,
    currentPage: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
  
};

export const getTrendingMovies = async () => {
  const data = await request("/trending/movie/week");
  return data.results;
};

export const getPersonDetails = async (personId) => {
  return request(`/person/${personId}`, {
    language: "en-US",
    append_to_response: "movie_credits",
  });
};
