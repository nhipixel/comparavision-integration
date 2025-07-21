import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xoodnuckjmlmejeyyneg.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseKey) {
  console.warn('⚠️  Missing Supabase anon key - using development mode')
  console.warn('   Set REACT_APP_SUPABASE_ANON_KEY in your environment file for full functionality')
}

// Create Supabase client only if key is available
let supabase = null
if (supabaseKey && !supabaseKey.includes('example')) {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.log("⚠️  Supabase client not initialized - using development mode")
}

// Test connection function
export const testConnection = async () => {
  if (!supabase) {
    console.log('⚠️  Skipping database connection test - using development mode')
    return false
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) throw error
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message)
    return false
  }
}

// Verify connection on init
testConnection()
  .then(isConnected => {
    if (!isConnected && supabase) {
      console.error('Failed to connect to Supabase. Check your configuration.')
    }
  })

// Helper function to sync Auth0 user with Supabase
export const syncUserWithSupabase = async (auth0User) => {
  if (!supabase) {
    console.log('⚠️  Supabase not available - skipping user sync')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        auth0_id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture,
        email_verified: auth0User.email_verified,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error syncing user with Supabase:', error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error('Error syncing user with Supabase:', error)
    return null
  }
}

// Helper function to get user from Supabase by Auth0 ID
export const getUserFromSupabase = async (auth0Id) => {
  if (!supabase) {
    console.log('⚠️  Supabase not available - skipping user fetch')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single()

    if (error) {
      console.error('Error fetching user from Supabase:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user from Supabase:', error)
    return null
  }
}

// Export supabase client for use in other modules
export { supabase }
