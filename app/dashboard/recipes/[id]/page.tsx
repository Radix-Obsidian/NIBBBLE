import { getServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/app/components/ui/card'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PlaceholderImage } from '@/app/components/ui/placeholder-image'
import { Clock, Star, Flame, Beef, Wheat, BadgeCheck } from 'lucide-react'

interface PageProps { params: { id: string }, searchParams?: { from?: string } }

export default async function RecipeDetailPage({ params, searchParams }: PageProps) {
  const { supabase: s } = await getServerSupabaseClient()
  const { data: recipe, error } = await s
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error || !recipe) return notFound()

  const typedRecipe = recipe as {
    id: string
    title: string
    description: string | null
    ingredients: string[] | null
    instructions: string[] | null
    cook_time: number
    prep_time: number
    difficulty: string
    cuisine: string | null
    tags: string[] | null
    image_url: string | null
    video_url: string | null
    creator_id: string
    rating: number | null
    likes_count: number
    views_count: number
    is_public: boolean
    created_at: string
    updated_at: string
  }

  const parseTag = (key: string) => {
    const tags: string[] = Array.isArray(typedRecipe.tags) ? typedRecipe.tags : []
    const found = tags.find((t) => t.startsWith(`${key}:`))
    if (!found) return 0
    const v = Number(found.split(':')[1])
    return Number.isFinite(v) ? v : 0
  }

  const ingredients = typedRecipe.ingredients || []
  const instructions = typedRecipe.instructions || []

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(typedRecipe.rating || 0))

  const nutrition = [
    { label: 'Calories', value: parseTag('calories'), unit: 'kcal', icon: Flame, color: 'from-orange-200 to-orange-100' },
    { label: 'Protein', value: parseTag('protein_g'), unit: 'g', icon: Beef, color: 'from-emerald-200 to-emerald-100' },
    { label: 'Carbs', value: parseTag('carbs_g'), unit: 'g', icon: Wheat, color: 'from-blue-200 to-blue-100' },
    { label: 'Fats', value: parseTag('fats_g'), unit: 'g', icon: BadgeCheck, color: 'from-purple-200 to-purple-100' },
  ]

  const percent = (val: number) => Math.max(0, Math.min(100, val))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.5),transparent_55%)]" />
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 p-6 sm:p-8 lg:p-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{typedRecipe.title}</h1>
              <Link href={searchParams?.from === 'discover' ? '/dashboard/discover' : '/dashboard/recipes'} className="rounded-full border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Back</Link>
            </div>
            {typedRecipe.description && (
              <p className="mt-3 text-gray-600 leading-relaxed">{typedRecipe.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                {stars.map((on, i) => (
                  <Star key={i} className={`w-4 h-4 ${on ? 'fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="ml-1 text-gray-600">{(typedRecipe.rating || 0).toFixed(1)}</span>
              </div>
              <span className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2 text-gray-700"><Clock className="w-4 h-4" />{typedRecipe.prep_time + typedRecipe.cook_time} mins total</div>
              <span className="h-4 w-px bg-gray-300" />
              <div className="text-gray-700">{typedRecipe.difficulty}</div>
              {typedRecipe.cuisine && (<><span className="h-4 w-px bg-gray-300" /><div className="text-gray-700">{typedRecipe.cuisine}</div></>)}
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {nutrition.map((n) => (
                <div key={n.label} className={`rounded-2xl border bg-gradient-to-br ${n.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-gray-700">{n.label}</div>
                    <n.icon className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{n.value}<span className="ml-1 text-sm text-gray-600">{n.unit}</span></div>
                  <div className="mt-2 h-2 rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percent(n.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-200/50 to-amber-100 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-full h-full w-full border bg-white">
                {typedRecipe.image_url ? (
                  <Image src={typedRecipe.image_url} alt={typedRecipe.title} fill className="object-cover" />
                ) : (
                  <PlaceholderImage title={typedRecipe.title} cuisine={typedRecipe.cuisine || undefined} className="h-full w-full rounded-full" />
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl border bg-white">
                <div className="text-sm text-gray-500">Prep</div>
                <div className="text-xl font-semibold text-gray-900">{typedRecipe.prep_time}m</div>
              </div>
              <div className="p-4 rounded-2xl border bg-white">
                <div className="text-sm text-gray-500">Cook</div>
                <div className="text-xl font-semibold text-gray-900">{typedRecipe.cook_time}m</div>
              </div>
              <div className="p-4 rounded-2xl border bg-white">
                <div className="text-sm text-gray-500">Difficulty</div>
                <div className="text-xl font-semibold text-gray-900">{typedRecipe.difficulty}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr,1.1fr] gap-8">
        <Card className="p-6 border rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
          {ingredients.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-800">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-orange-400" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">No ingredients added</div>
          )}
        </Card>

        <Card className="p-6 border rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
          {instructions.length > 0 ? (
            <ol className="space-y-4">
              {instructions.map((instruction, index) => (
                <li key={index} className="relative pl-8">
                  <span className="absolute left-0 top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-sm text-gray-600">No instructions added</div>
          )}
        </Card>
      </div>
    </div>
  )
}
