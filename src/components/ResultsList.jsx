import OptionCard from './OptionCard'

export default function ResultsList({ result }) {
  if (!result) return null

  const { intent, options, over_budget, no_route, missing_fields } = result

  if (missing_fields && missing_fields.length > 0) {
    return (
      <div className="results-banner clarify">
        I couldn&apos;t fully understand your request. Could you clarify: {missing_fields.join(', ')}?
      </div>
    )
  }

  const intentLine = intent
    ? `Searching flights from ${intent.origin} to ${intent.destination}` +
      (intent.budget_usd ? `, budget $${intent.budget_usd}` : '')
    : null

  return (
    <div className="results">
      {intentLine && <div className="results-intent">{intentLine}</div>}
      {no_route && (
        <div className="results-banner">
          We don&apos;t have any listed flights for this route yet. Try a different origin or destination.
        </div>
      )}
      {over_budget && (
        <div className="results-banner over-budget">
          Nothing found within your budget — here are the closest options.
        </div>
      )}
      {!no_route && options.length === 0 ? (
        <div className="results-banner">No travel options found.</div>
      ) : (
        <div className="options-list">
          {options.map((option) => (
            <OptionCard key={option.id} option={option} />
          ))}
        </div>
      )}
    </div>
  )
}
