import { useEffect, useMemo, useRef } from 'react'

const MAX_CHARS = 500

export default function NotesEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null)
  const length = value.length

  const countColor = useMemo(() => {
    if (length >= 480) {
      return 'text-red-300'
    }
    if (length >= 400) {
      return 'text-amber-300'
    }
    return 'text-white/40'
  }, [length])

  useEffect(() => {
    if (!textareaRef.current) {
      return
    }

    // Auto-resize the textarea up to roughly 8 rows.
    textareaRef.current.style.height = 'auto'
    const maxHeight = 8 * 24
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
  }, [value])

  const handleChange = (event) => {
    const nextValue = event.target.value.slice(0, MAX_CHARS)
    onChange(nextValue)
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40"
      />
      <div className={`text-right text-xs ${countColor}`}>{length}/{MAX_CHARS}</div>
    </div>
  )
}
