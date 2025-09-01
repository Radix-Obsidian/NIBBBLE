import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function TestDBPage() {
  const supabase = await createServerSupabaseClient()
  
  // Test recipes table
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id, title, cuisine, created_at')
    .limit(10)
  
  // Test profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .limit(5)
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>
      
      <div className="space-y-8">
        {/* Recipes Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recipes Table</h2>
          {recipesError ? (
            <div className="text-red-600">
              <p>Error: {recipesError.message}</p>
              <pre className="mt-2 text-sm">{JSON.stringify(recipesError, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-2">✅ Connection successful</p>
              <p className="text-gray-600 mb-4">Found {recipes?.length || 0} recipes</p>
              {recipes && recipes.length > 0 ? (
                <div className="space-y-2">
                  {recipes.map((recipe: any) => (
                    <div key={recipe.id} className="p-3 bg-gray-50 rounded">
                      <p><strong>ID:</strong> {recipe.id}</p>
                      <p><strong>Title:</strong> {recipe.title}</p>
                      <p><strong>Cuisine:</strong> {recipe.cuisine}</p>
                      <p><strong>Created:</strong> {new Date(recipe.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recipes found in database</p>
              )}
            </div>
          )}
        </div>
        
        {/* Profiles Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profiles Table</h2>
          {profilesError ? (
            <div className="text-red-600">
              <p>Error: {profilesError.message}</p>
              <pre className="mt-2 text-sm">{JSON.stringify(profilesError, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-2">✅ Connection successful</p>
              <p className="text-gray-600 mb-4">Found {profiles?.length || 0} profiles</p>
              {profiles && profiles.length > 0 ? (
                <div className="space-y-2">
                  {profiles.map((profile: any) => (
                    <div key={profile.id} className="p-3 bg-gray-50 rounded">
                      <p><strong>ID:</strong> {profile.id}</p>
                      <p><strong>Username:</strong> {profile.username}</p>
                      <p><strong>Display Name:</strong> {profile.display_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No profiles found in database</p>
              )}
            </div>
          )}
        </div>
        
        {/* Environment Variables Check */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>SPOONACULAR_API_KEY:</strong> {process.env.SPOONACULAR_API_KEY ? '✅ Set' : '❌ Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
