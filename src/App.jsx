import { useEffect, useState, useCallback } from 'react'
import Search from './Components/Search.jsx'
import Spinner from './Components/Spinner.jsx'
import MovieCard from './Components/MovieCard.jsx'
import MovieModal from './Components/MovieModal.jsx'
import Filter from './Components/Filter.jsx'
import { useDebounce } from 'react-use'
import { useInfiniteScroll } from './hooks/useInfiniteScroll.js'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    genres: [],
    rating: '',
    year: ''
  });

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const buildApiUrl = useCallback((query = '', page = 1) => {
    let url = `${API_BASE_URL}`
    const params = new URLSearchParams()
    
    if (query) {
      url += '/search/movie'
      params.append('query', encodeURIComponent(query))
    } else {
      url += '/discover/movie'
      params.append('sort_by', 'popularity.desc')
    }
    
    params.append('page', page.toString())
    
    // Add filters if no search query
    if (!query) {
      if (filters.genres.length > 0) {
        params.append('with_genres', filters.genres.join(','))
      }
      if (filters.rating) {
        params.append('vote_average.gte', filters.rating)
      }
      if (filters.year) {
        params.append('year', filters.year)
      }
    }
    
    return `${url}?${params.toString()}`
  }, [filters])

  const fetchMovies = useCallback(async (query = '', page = 1, isAppending = false) => {
    if (!isAppending) {
      setIsLoading(true);
    }
    setErrorMessage('');

    try {
      const endpoint = buildApiUrl(query, page)
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        if (!isAppending) {
          setMovieList([]);
        }
        return;
      }

      const results = data.results || [];
      
      if (isAppending) {
        setMovieList(prev => [...prev, ...results]);
      } else {
        setMovieList(results);
      }

      setCurrentPage(page);
      setTotalPages(data.total_pages || 0);
      setHasMorePages(page < (data.total_pages || 0));

      if(query && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      if (!isAppending) {
        setIsLoading(false);
      }
    }
  }, [buildApiUrl])

  const fetchMoreMovies = useCallback(async () => {
    if (hasMorePages && currentPage < totalPages) {
      await fetchMovies(debouncedSearchTerm, currentPage + 1, true);
    }
  }, [currentPage, totalPages, hasMorePages, debouncedSearchTerm, fetchMovies]);

  const [isFetching] = useInfiniteScroll(fetchMoreMovies);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setMovieList([]);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      genres: [],
      rating: '',
      year: ''
    });
    setCurrentPage(1);
    setMovieList([]);
  }, []);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, 1, false);
  }, [debouncedSearchTerm, filters, fetchMovies]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <div className="movies-header">
            <h2>All Movies</h2>
            <Filter 
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {isLoading && movieList.length === 0 ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </ul>
              
              {/* Infinite scroll loading indicator */}
              {isFetching && movieList.length > 0 && (
                <div className="loading-more">
                  <Spinner />
                  <p>Loading more movies...</p>
                </div>
              )}
              
              {!hasMorePages && movieList.length > 0 && (
                <div className="end-of-results">
                  <p>You've reached the end! 🎬</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Movie Modal */}
        <MovieModal 
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </main>
  )
}

export default App
