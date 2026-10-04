import { useState } from 'react'

export default function ChatInput({ onSearch, loading }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || loading) return
    onSearch(value.trim())
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. I want travel from India to Chicago within budget of $500"
        rows={3}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}
