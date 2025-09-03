import { useState, useEffect, useCallback } from 'react'

export const useInfiniteScroll = (callback) => {
  const [isFetching, setIsFetching] = useState(false)

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000 && !isFetching) {
      setIsFetching(true)
    }
  }, [isFetching])

  const fetchMoreData = useCallback(async () => {
    await callback()
    setIsFetching(false)
  }, [callback])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (!isFetching) return
    fetchMoreData()
  }, [isFetching, fetchMoreData])

  return [isFetching, setIsFetching]
}
