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
    videoUrl: initialData.videoUrl
  })

  const next = () => setStep((s) => Math.min(4, s + 1))
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Create Recipe</h3>
        <div className="space-x-2">
          {step > 1 && <Button variant="outline" onClick={prev}>Back</Button>}
          {step < 4 && <Button onClick={next}>Next</Button>}
          {step === 4 && (
            <Button onClick={() => onSave(form)}>Save</Button>
          )}
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => handleImages(e.target.files)} />
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
    </Card>
  )
}
