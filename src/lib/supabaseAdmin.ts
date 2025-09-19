// This file is no longer needed as admin operations are now handled by Edge Functions
// All admin operations should use the secure Edge Functions instead

export const supabaseAdmin = null // Removed to prevent accidental usage

console.warn('⚠️ supabaseAdmin is deprecated. Use Edge Functions for admin operations.')