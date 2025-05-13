import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

// Better put your these secret keys in .env file
export const supabase = createClient(
	"https://bdjgdsjtxuqrcsvfanws.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamdkc2p0eHVxcmNzdmZhbndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNDExMTIsImV4cCI6MjA2MTYxNzExMn0.gCrgbIqZtt-OMrLhNMb86FIUmD0ppOYje-5y0wybJdA",
	{
		localStorage: AsyncStorage as any,
		detectSessionInUrl: false, // Prevents Supabase from evaluating window.location.href, breaking mobile
	}
)

