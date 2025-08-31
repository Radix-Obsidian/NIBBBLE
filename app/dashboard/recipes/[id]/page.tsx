import { supabase } from '@/lib/supabase/server'
import { Card } from '@/app/components/ui/card'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps { params: { id: string } }

export default async function RecipeDetailPage({ params }: PageProps) {
  const { supabase: s } = await (await import('@/lib/supabase/server')).getServerSupabaseClient()
  const { data: recipe, error } = await s
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()
  if (error || !recipe) return notFound()

  const { data: ingredients } = await s
    .from('ingredients')
    .select('name, amount, unit, order_index')
    .eq('recipe_id', params.id)
    .order('order_index', { ascending: true })

  const { data: instructions } = await s
    .from('instructions')
    .select('step_number, instruction')
    .eq('recipe_id', params.id)
    .order('step_number', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{recipe.title}</h2>
          <p className="text-gray-600">{recipe.description}</p>
        </div>
        <Link href="/dashboard/recipes" className="rounded-full border-2 border-gray-300 h-9 px-3 text-sm">Back</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 border border-gray-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
          <ul className="space-y-2">
            {(ingredients || []).map((ing) => (
              <li key={`${ing.order_index}-${ing.name}`} className="flex items-center justify-between text-gray-700">
                <span>{ing.name}</span>
                <span className="text-gray-500 text-sm">{ing.amount} {ing.unit}</span>
              </li>
            ))}
            {(!ingredients || ingredients.length === 0) && (
              <li className="text-sm text-gray-600">No ingredients added</li>
            )}
          </ul>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Nutritional Values</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Calories', unit: 'Kcal' },
                { label: 'Protein', unit: 'g' },
                { label: 'Fats', unit: 'g' },
                { label: 'Carbs', unit: 'g' }
              ].map((n) => (
                <div key={n.label} className="text-center border rounded-xl p-3 bg-white">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-gray-500">{n.label} {n.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div>
          <div className="overflow-hidden rounded-full mx-auto w-72 h-72 bg-gray-100 relative">
            {Array.isArray(recipe.images) && recipe.images.length > 0 ? (
              <Image src={recipe.images[0]} alt={recipe.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-6">
            <div className="p-4 rounded-2xl border bg-white">
              <div className="text-sm text-gray-500">Prep</div>
              <div className="text-xl font-semibold text-gray-900">{recipe.prep_time}m</div>
            </div>
            <div className="p-4 rounded-2xl border bg-white">
              <div className="text-sm text-gray-500">Cook</div>
              <div className="text-xl font-semibold text-gray-900">{recipe.cook_time}m</div>
            </div>
            <div className="p-4 rounded-2xl border bg-white">
              <div className="text-sm text-gray-500">Servings</div>
              <div className="text-xl font-semibold text-gray-900">{recipe.servings}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-gray-200 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
        <ol className="space-y-4 list-decimal list-inside">
          {(instructions || []).map((s) => (
            <li key={s.step_number} className="text-gray-700">{s.instruction}</li>
          ))}
          {(!instructions || instructions.length === 0) && (
            <li className="text-gray-600">No instructions added</li>
          )}
        </ol>
      </Card>
    </div>
  )
}
