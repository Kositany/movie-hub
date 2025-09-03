import React, { useState, useEffect } from 'react'

const Filter = ({ onFilterChange, onClearFilters }) => {
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedRating, setSelectedRating] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const API_BASE_URL = 'https://api.themoviedb.org/3'
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)
  const ratings = [
    { value: '9', label: '9+ Excellent' },
    { value: '8', label: '8+ Very Good' },
    { value: '7', label: '7+ Good' },
    { value: '6', label: '6+ Decent' },
    { value: '5', label: '5+ Average' },
  ]

  useEffect(() => {
    const API_OPTIONS = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    }

    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS)
        const data = await response.json()
        setGenres(data.genres || [])
      } catch (error) {
        console.error('Error fetching genres:', error)
      }
    }
    
    fetchGenres()
  }, [API_KEY])

  useEffect(() => {
    const filters = {
      genres: selectedGenres,
      rating: selectedRating,
      year: selectedYear
    }
    onFilterChange(filters)
  }, [selectedGenres, selectedRating, selectedYear, onFilterChange])

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleClearAll = () => {
    setSelectedGenres([])
    setSelectedRating('')
    setSelectedYear('')
    onClearFilters()
  }

  const hasActiveFilters = selectedGenres.length > 0 || selectedRating || selectedYear

  return (
    <div className="filter-container">
      <button 
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🔽 Filters</span>
        {hasActiveFilters && <span className="filter-badge">{
          selectedGenres.length + (selectedRating ? 1 : 0) + (selectedYear ? 1 : 0)
        }</span>}
      </button>

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Movies</h3>
            {hasActiveFilters && (
              <button onClick={handleClearAll} className="clear-filters">
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            <h4>Genres</h4>
            <div className="genre-grid">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`genre-tag ${selectedGenres.includes(genre.id) ? 'selected' : ''}`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Minimum Rating</h4>
            <select 
              value={selectedRating} 
              onChange={(e) => setSelectedRating(e.target.value)}
              className="filter-select"
            >
              <option value="">Any Rating</option>
              {ratings.map(rating => (
                <option key={rating.value} value={rating.value}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h4>Release Year</h4>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              <option value="">Any Year</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filter
