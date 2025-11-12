// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://alayipoqgverqdvjmskj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYXlpcG9xZ3ZlcnFkdmptc2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzA1MzcsImV4cCI6MjA3NTAwNjUzN30.cYXGpktq6kt0WCFAQuSodD7-u4_VKA09R4kFFE7f5OE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
