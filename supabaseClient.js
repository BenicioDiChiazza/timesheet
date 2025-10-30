import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbxqgifzppnlxuzkjxae.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieHFnaWZ6cHBubHh1emtqeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTc4MTIsImV4cCI6MjA3NDczMzgxMn0.Vf7dMpq60gTLeYLC9JJB-l1-LqBS8yHS78HAO-RmQuw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)