import React from 'react'

const MovieCard = ({movie:
    {title, vote_average, poster_path, release_date, original_language, overview}, onClick
}) => {
  return (
    <div className='movie-card' onClick={onClick}>
        <div className="movie-card-image-container">
            <img 
            src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}`:'/no-movie.png'} 
            alt={title} />
            
            {/* Overview tooltip on hover */}
            <div className="movie-card-overlay">
                <div className="movie-overview">
                    <h4>{title}</h4>
                    <p>{overview ? (overview.length > 150 ? overview.substring(0, 150) + '...' : overview) : 'No description available.'}</p>
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }}
                    >
                      View Details
                    </button>
                </div>
            </div>
        </div>

        <div className='mt-4'>
            <h3>{title}</h3>

            <div className='content'>
                <div className='rating'>
                    <img src="/star.svg" alt="star Icon" />
                    <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                </div>

                <span>-</span>
                <p className='lang'>{original_language}</p>

                <span>-</span>
                <div className='year'>
                    {release_date ? release_date.split('-')[0] : 'N/A'}
                </div>
            </div>
        </div>
    </div>
  )
}

export default MovieCard