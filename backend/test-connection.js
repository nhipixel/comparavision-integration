const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: './env' })

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://xoodnuckjmlmejeyyneg.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseKey || supabaseKey.includes('example')) {
  console.warn('⚠️  Missing or invalid Supabase anon key')
  console.warn('   Set REACT_APP_SUPABASE_ANON_KEY in your environment file')
  console.log('⚠️  Skipping database connection test - using development mode')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing connection to:', supabaseUrl)
    const { data, error } = await supabase.from('users').select('count')
    
    if (error) throw error
    console.log('✅ Connection successful!')
    console.log('Data:', data)
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testConnection()
  .then(result => {
    if (!result) process.exit(1)
  })
  .catch(console.error)
