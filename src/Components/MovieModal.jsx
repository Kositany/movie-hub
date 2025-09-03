import React, { useState, useEffect, useCallback } from 'react'

const MovieModal = ({ movie, isOpen, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null)
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = 'https://api.themoviedb.org/3'
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY

  const fetchMovieDetails = useCallback(async () => {
    if (!movie) return
    
    const API_OPTIONS = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    }
    
    setLoading(true)
    try {
      // Fetch movie details
      const detailsResponse = await fetch(
        `${API_BASE_URL}/movie/${movie.id}`,
        API_OPTIONS
      )
      const detailsData = await detailsResponse.json()

      // Fetch movie credits (cast)
      const creditsResponse = await fetch(
        `${API_BASE_URL}/movie/${movie.id}/credits`,
        API_OPTIONS
      )
      const creditsData = await creditsResponse.json()

      setMovieDetails(detailsData)
      setCredits(creditsData)
    } catch (error) {
      console.error('Error fetching movie details:', error)
    } finally {
      setLoading(false)
    }
  }, [movie, API_KEY])

  useEffect(() => {
    if (isOpen && movie) {
      fetchMovieDetails()
    }
  }, [isOpen, movie, fetchMovieDetails])

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading movie details...</p>
          </div>
        ) : movieDetails ? (
          <div className="modal-body">
            <div className="modal-header">
              <img
                src={
                  movieDetails.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                    : '/no-movie.png'
                }
                alt={movieDetails.title}
                className="modal-poster"
              />
              <div className="modal-info">
                <h1>{movieDetails.title}</h1>
                {movieDetails.tagline && (
                  <p className="tagline">"{movieDetails.tagline}"</p>
                )}
                
                <div className="movie-stats">
                  <div className="stat">
                    <img src="/star.svg" alt="Rating" />
                    <span>{movieDetails.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="stat">
                    <span>Runtime: {formatRuntime(movieDetails.runtime)}</span>
                  </div>
                  <div className="stat">
                    <span>Year: {movieDetails.release_date?.split('-')[0] || 'N/A'}</span>
                  </div>
                </div>

                <div className="genres">
                  {movieDetails.genres?.map((genre) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-sections">
              <section className="overview-section">
                <h2>Overview</h2>
                <p>{movieDetails.overview || 'No overview available.'}</p>
              </section>

              {credits?.cast && credits.cast.length > 0 && (
                <section className="cast-section">
                  <h2>Cast</h2>
                  <div className="cast-grid">
                    {credits.cast.slice(0, 6).map((actor) => (
                      <div key={actor.id} className="cast-member">
                        <img
                          src={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                              : '/no-movie.png'
                          }
                          alt={actor.name}
                        />
                        <div className="cast-info">
                          <p className="actor-name">{actor.name}</p>
                          <p className="character-name">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="details-section">
                <h2>Details</h2>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Budget:</strong>
                    <span>{formatCurrency(movieDetails.budget)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Revenue:</strong>
                    <span>{formatCurrency(movieDetails.revenue)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span>{movieDetails.status}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Original Language:</strong>
                    <span>{movieDetails.original_language?.toUpperCase()}</span>
                  </div>
                  {movieDetails.production_companies?.length > 0 && (
                    <div className="detail-item">
                      <strong>Production:</strong>
                      <span>
                        {movieDetails.production_companies
                          .slice(0, 2)
                          .map(company => company.name)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default MovieModal
