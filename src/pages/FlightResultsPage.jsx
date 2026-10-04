import { Link, useLocation } from 'react-router-dom'
import ResultsList from '../components/ResultsList'

export default function FlightResultsPage() {
  const location = useLocation()
  const result = location.state

  if (!result) {
    return (
      <div className="app">
        <h1>Flight Results</h1>
        <div className="results-banner">
          No search results to show. <Link to="/">Try the chat search</Link> or{' '}
          <Link to="/search">use Search Flights</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Flight Results</h1>
      <ResultsList result={result} />
    </div>
  )
}
