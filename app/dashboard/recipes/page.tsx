'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { Button } from '@/app/components/ui/button'
export default function MyRecipesPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Error fetching user recipes', error)
          setRecipes([])
        } else {
          const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            creator: { name: 'You', avatar: '', initials: 'YO' },
            isTrending: (r.likes_count || 0) > 100,
            isLiked: false
          }))
          setRecipes(mapped)
        }
      } catch (e) {
        logger.error('My recipes load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
        <Button onClick={() => setCreating(true)}>New Recipe</Button>
      </div>

      {creating && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreating(false)} />
          <div className="absolute inset-x-0 top-10 mx-auto max-w-3xl z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
              <RecipeCreator
                onSave={async (form) => {
                  if (!user) return
                  try {
                    setLoading(true)
                    const { data: inserted, error } = await supabase
                      .from('recipes')
                      .insert({
                        title: form.title,
                        description: form.description,
                        prep_time: form.prepTime,
                        cook_time: form.cookTime,
                        total_time: form.prepTime + form.cookTime,
                        servings: form.servings,
                        difficulty: form.difficulty,
                        cuisine: form.cuisine,
                        meal_type: form.mealType,
                        dietary_tags: form.dietaryTags,
                        tags: form.tags,
                        images: [],
                        video_url: form.videoUrl || null,
                        is_published: true,
                        creator_id: user.id
                      })
                      .select('id')
                      .single()

                    if (error) throw error
                    const recipeId = inserted!.id

                    if (form.ingredients.length) {
                      await supabase.from('ingredients').insert(
                        form.ingredients.map((ing, i) => ({
                          recipe_id: recipeId,
                          name: ing.name,
                          amount: ing.amount,
                          unit: ing.unit,
                          notes: null,
                          order_index: i
                        }))
                      )
                    }

                    if (form.instructions.length) {
                      await supabase.from('instructions').insert(
                        form.instructions.map((instruction, i) => ({
                          recipe_id: recipeId,
                          step_number: i + 1,
                          instruction,
                          image_url: null,
                          video_url: null
                        }))
                      )
                    }

                    setCreating(false)
                    // Reload list
                    const { data, error: rErr } = await supabase
                      .from('recipes')
                      .select('id, title, description, cook_time, difficulty, rating, likes_count')
                      .eq('creator_id', user.id)
                      .order('created_at', { ascending: false })
                    if (rErr) throw rErr
                    const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
                      id: r.id,
                      title: r.title,
                      description: r.description,
                      cookTime: r.cook_time,
                      difficulty: r.difficulty,
                      rating: r.rating || 0,
                      creator: { name: 'You', avatar: '', initials: 'YO' },
                      isTrending: (r.likes_count || 0) > 100,
                      isLiked: false
                    }))
                    setRecipes(mapped)
                  } catch (e) {
                    logger.error('Create recipe error', e)
                  } finally {
                    setLoading(false)
                  }
                }}
                onCancel={() => setCreating(false)}
              />
            </div>
          </div>
        </div>
      )}

      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onLike={(id) => logger.info('Like', { id })} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
