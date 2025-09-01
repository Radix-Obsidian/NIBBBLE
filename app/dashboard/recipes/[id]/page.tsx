import { getServerSupabaseClient } from '@/lib/supabase/server'
import { Card } from '@/app/components/ui/card'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps { params: { id: string } }

export default async function RecipeDetailPage({ params }: PageProps) {
  const { supabase: s } = await getServerSupabaseClient()
  const { data: recipe, error } = await s
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error || !recipe) return notFound()

  // Type assertion for recipe
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

  // Parse ingredients and instructions from arrays
  const ingredients = typedRecipe.ingredients || []
  const instructions = typedRecipe.instructions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{typedRecipe.title}</h2>
          <p className="text-gray-600">{typedRecipe.description}</p>
        </div>
        <Link href="/dashboard/recipes" className="rounded-full border-2 border-gray-300 h-9 px-3 text-sm">Back</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 border border-gray-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
          <ul className="space-y-2">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center justify-between text-gray-700">
                  <span>{ingredient}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600">No ingredients added</li>
            )}
          </ul>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Nutritional Values</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Calories', unit: 'Kcal', value: parseTag('calories') },
                { label: 'Protein', unit: 'g', value: parseTag('protein_g') },
                { label: 'Fats', unit: 'g', value: parseTag('fats_g') },
                { label: 'Carbs', unit: 'g', value: parseTag('carbs_g') }
              ].map((n) => (
                <div key={n.label} className="text-center border rounded-xl p-3 bg-white">
                  <div className="text-2xl font-bold text-purple-600">{n.value}</div>
                  <div className="text-xs text-gray-500">{n.label} {n.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div>
          <div className="overflow-hidden rounded-full mx-auto w-72 h-72 bg-gray-100 relative">
            {typedRecipe.image_url ? (
              <Image src={typedRecipe.image_url} alt={typedRecipe.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
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

      <Card className="p-6 border border-gray-200 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
        <ol className="space-y-4 list-decimal list-inside">
          {instructions.length > 0 ? (
            instructions.map((instruction, index) => (
              <li key={index} className="text-gray-700">{instruction}</li>
            ))
          ) : (
            <li className="text-gray-600">No instructions added</li>
          )}
        </ol>
      </Card>
    </div>
  )
}
