import { motion } from 'framer-motion'
import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const TYPE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Internship', value: 'internship' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Fellowship', value: 'fellowship' },
  { label: 'Competition', value: 'competition' },
]

const TAG_OPTIONS = ['python', 'ml', 'web', 'design', 'mobile', 'data', 'blockchain', 'open-source']

export default function FilterBar({ filters, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedTags = filters.tags || []

  const tagSummary = useMemo(() => {
    if (!selectedTags.length) {
      return 'Tags'
    }
    if (selectedTags.length <= 2) {
      return selectedTags.join(', ')
    }
    return `${selectedTags.length} selected`
  }, [selectedTags])

  const handleSearchChange = (event) => {
    onChange({ ...filters, search: event.target.value })
  }

  const handleTypeChange = (value) => {
    onChange({ ...filters, type: value })
  }

  const toggleTag = (tag) => {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag]

    onChange({ ...filters, tags: nextTags })
  }

  const removeTag = (tag) => {
    onChange({ ...filters, tags: selectedTags.filter((item) => item !== tag) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="relative flex flex-1 items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by role or company"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-4 text-sm text-white outline-none transition focus:border-accent-blue/60 focus:ring-2 focus:ring-accent-blue/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTypeChange(tab.value)}
              className={
                filters.type === tab.value
                  ? 'rounded-full bg-accent-blue/20 px-4 py-2 text-xs font-semibold text-accent-blue'
                  : 'rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/20"
          >
            <span>{tagSummary}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0b0f1a] p-3 shadow-xl">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Tags</p>
              <div className="space-y-2">
                {TAG_OPTIONS.map((tag) => (
                  <label key={tag} className="flex items-center justify-between text-xs text-slate-200">
                    <span>{tag}</span>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent-blue focus:ring-accent-blue/50"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-white/20"
            >
              <span>{tag}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  )
}
