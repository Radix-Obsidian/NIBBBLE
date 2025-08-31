'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { CreateRecipeForm } from '@/types'

export interface RecipeCreatorProps {
  onSave: (recipe: CreateRecipeForm) => void
  onCancel: () => void
  initialData?: Partial<CreateRecipeForm>
}

export function RecipeCreator({ onSave, onCancel, initialData = {} }: RecipeCreatorProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CreateRecipeForm>({
    title: initialData.title || '',
    description: initialData.description || '',
    ingredients: initialData.ingredients || [],
    instructions: initialData.instructions || [''],
    prepTime: initialData.prepTime || 0,
    cookTime: initialData.cookTime || 0,
    servings: initialData.servings || 1,
    difficulty: (initialData.difficulty as any) || 'Easy',
    cuisine: initialData.cuisine || '',
    mealType: (initialData.mealType as any) || 'Dinner',
    dietaryTags: initialData.dietaryTags || [],
    tags: initialData.tags || [],
    images: initialData.images || [],
    coverImageUrl: initialData.coverImageUrl || '',
    nutritionCalories: initialData.nutritionCalories || undefined,
    nutritionProtein: initialData.nutritionProtein || undefined,
    nutritionFats: initialData.nutritionFats || undefined,
    nutritionCarbs: initialData.nutritionCarbs || undefined,
    videoUrl: initialData.videoUrl
  })

  const next = () => setStep((s) => Math.min(5, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const addIngredient = () => {
    setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: 0, unit: '' }] })
  }

  const updateIngredient = (i: number, key: 'name' | 'amount' | 'unit', value: any) => {
    const copy = [...form.ingredients]
    ;(copy[i] as any)[key] = value
    setForm({ ...form, ingredients: copy })
  }

  const addInstruction = () => setForm({ ...form, instructions: [...form.instructions, ''] })
  const updateInstruction = (i: number, v: string) => {
    const copy = [...form.instructions]
    copy[i] = v
    setForm({ ...form, instructions: copy })
  }

  const handleImages = (files: FileList | null) => {
    if (!files) return
    setForm({ ...form, images: Array.from(files) })
  }

  const steps = ['Basics', 'Details & Media', 'Ingredients', 'Instructions', 'Nutrition & Preview']
  const progress = ((step - 1) / (steps.length - 1)) * 100

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">Create Recipe</h3>
          <div className="space-x-2">
            {step > 1 && <Button variant="outline" onClick={prev}>Back</Button>}
            {step < 5 && <Button onClick={next}>Next</Button>}
            {step === 5 && (
              <Button onClick={() => onSave(form)} disabled={!form.title || !form.cuisine || form.instructions.length === 0}>Save</Button>
            )}
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          {steps.map((label, i) => (
            <div key={label} className={`flex-1 ${i !== steps.length - 1 ? 'mr-2' : ''}`}>
              <div className={`rounded-full px-3 py-1 border ${i + 1 <= step ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-gray-200'}`}>{i + 1}. {label}</div>
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-200 rounded mt-2">
          <div className="h-1 bg-orange-500 rounded" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Recipe title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
            <Input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="e.g., Italian" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your recipe"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
              <Input type="number" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
              <Input type="number" value={form.cookTime} onChange={(e) => setForm({ ...form, cookTime: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <Input type="number" value={form.servings} onChange={(e) => setForm({ ...form, servings: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
              <select
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.mealType}
                onChange={(e) => setForm({ ...form, mealType: e.target.value as any })}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
                <option>Dessert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <Input value={form.coverImageUrl || ''} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
              <p className="text-xs text-gray-500 mt-1">Paste an image URL for the recipe cover.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleImages(e.target.files)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Tags</label>
              <input
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
                placeholder="Type a tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !form.dietaryTags.includes(val)) {
                      setForm({ ...form, dietaryTags: [...form.dietaryTags, val] })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {form.dietaryTags.map((t, i) => (
                  <span key={i} className='inline-flex items-center bg-orange-50 text-orange-700 rounded-full px-3 py-1 text-sm'>
                    {t}
                    <button className='ml-2' onClick={() => setForm({ ...form, dietaryTags: form.dietaryTags.filter((_, idx) => idx !== i) })}>×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2"
                placeholder="Type a tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !form.tags.includes(val)) {
                      setForm({ ...form, tags: [...form.tags, val] })
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((t, i) => (
                  <span key={i} className='inline-flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm'>
                    {t}
                    <button className='ml-2' onClick={() => setForm({ ...form, tags: form.tags.filter((_, idx) => idx !== i) })}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Ingredients</h4>
            <Button size="sm" onClick={addIngredient}>Add Ingredient</Button>
          </div>
          <div className="space-y-3">
            {form.ingredients.map((ing, i) => (
              <div className="grid grid-cols-5 gap-2" key={i}>
                <Input className="col-span-2" placeholder="Name" value={(ing as any).name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} />
                <Input type="number" placeholder="Amount" value={(ing as any).amount || 0} onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))} />
                <Input placeholder="Unit" value={(ing as any).unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Instructions</h4>
            <Button size="sm" onClick={addInstruction}>Add Step</Button>
          </div>
          <div className="space-y-3">
            {form.instructions.map((inst, i) => (
              <textarea
                key={i}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                value={inst}
                onChange={(e) => updateInstruction(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Nutrition</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                  <Input type="number" value={form.nutritionCalories || 0} onChange={(e) => setForm({ ...form, nutritionCalories: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <Input type="number" value={form.nutritionProtein || 0} onChange={(e) => setForm({ ...form, nutritionProtein: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fats (g)</label>
                  <Input type="number" value={form.nutritionFats || 0} onChange={(e) => setForm({ ...form, nutritionFats: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                  <Input type="number" value={form.nutritionCarbs || 0} onChange={(e) => setForm({ ...form, nutritionCarbs: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Preview</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border rounded-2xl">
                <div>
                  <h5 className="text-lg font-semibold text-gray-900">{form.title || 'Recipe Title'}</h5>
                  <p className="text-sm text-gray-600 line-clamp-4">{form.description || 'Add a short description of your recipe.'}</p>
                  <div className="mt-3">
                    <h6 className="font-medium text-gray-900 mb-1">Ingredients</h6>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 max-h-40 overflow-auto pr-2">
                      {form.ingredients.map((ing, i) => (
                        <li key={i}>{(ing as any).name} {(ing as any).amount ? `- ${(ing as any).amount} ${(ing as any).unit}` : ''}</li>
                      ))}
                      {form.ingredients.length === 0 && <li>Add ingredients to see them here</li>}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {form.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.coverImageUrl} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">🍽️</span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-3 w-full mt-4">
                    {[{label:'Calories',v:form.nutritionCalories||0,unit:'Kcal'},{label:'Protein',v:form.nutritionProtein||0,unit:'g'},{label:'Fats',v:form.nutritionFats||0,unit:'g'},{label:'Carbs',v:form.nutritionCarbs||0,unit:'g'}].map((n)=> (
                      <div key={n.label} className="text-center border rounded-xl p-3 bg-white">
                        <div className="text-xl font-bold text-purple-600">{n.v}</div>
                        <div className="text-xs text-gray-500">{n.label} {n.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
