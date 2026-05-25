export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return false;

  const placeholders = [
    "your_supabase_url_here",
    "your_supabase_anon_key_here",
    "placeholder",
  ];

  const looksPlaceholder = placeholders.some(
    (p) => url.includes(p) || key.includes(p)
  );

  return !looksPlaceholder && url.startsWith("https://") && key.length > 20;
}
