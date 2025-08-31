import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { RecipeFilters, SearchParams } from '@/types'

export interface SearchInterfaceProps {
  onSearch: (params: SearchParams) => void
  filters: RecipeFilters
  onFilterChange: (filters: RecipeFilters) => void
}

export function SearchInterface({ onSearch, filters, onFilterChange }: SearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SearchParams['sortBy']>('newest')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ query, filters, sortBy, page: 1, limit: 12 })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <form onSubmit={submit} className="flex items-center space-x-2">
        <Input icon={<Search className="w-5 h-5" />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipes..." />
        <select
          className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="relevance">Relevance</option>
          <option value="rating">Rating</option>
          <option value="time">Time</option>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Cuisine (comma separated)"
          value={(filters.cuisine || []).join(', ')}
          onChange={(e) => onFilterChange({ ...filters, cuisine: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        />
        <input
          className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Difficulty (e.g., Easy,Medium)"
          value={(filters.difficulty || []).join(', ')}
          onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        />
        <input
          className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Dietary Tags"
          value={(filters.dietaryTags || []).join(', ')}
          onChange={(e) => onFilterChange({ ...filters, dietaryTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        />
        <input
          className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          type="number"
          placeholder="Max Time (min)"
          value={filters.maxTime || ''}
          onChange={(e) => onFilterChange({ ...filters, maxTime: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </div>
  )
}
