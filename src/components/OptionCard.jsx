import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { saveTrip } from '../api/tripsApi'

export default function OptionCard({ option }) {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }
    if (saved || saving) return

    setSaving(true)
    try {
      await saveTrip(token, option)
      setSaved(true)
    } catch {
      // Saving a trip is a convenience action; a failure here shouldn't block browsing results.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link to={`/flights/${option.id}`} className="option-card">
      <div className="option-card-header">
        <span className="airline">{option.airline}</span>
        <div className="option-card-actions">
          <span className="price">${option.price_usd}</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`option-card-save-btn${saved ? ' saved' : ''}`}
            aria-label={saved ? 'Saved to My Trips' : 'Save to My Trips'}
            title={saved ? 'Saved to My Trips' : 'Save to My Trips'}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>
      <div className="option-card-body">
        <span>{option.origin} → {option.destination}</span>
        <span>Depart {option.depart_date} · Arrive {option.arrival_date}</span>
        <span>{option.stops === 0 ? 'Nonstop' : `${option.stops} stop(s)`} · {option.duration_hours}h</span>
      </div>
    </Link>
  )
}
