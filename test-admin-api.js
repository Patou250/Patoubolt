// Test de l'Edge Function admin-songs
fetch('https://umqzlqrgpxbdrnrmvjpe.functions.supabase.co/admin-songs?status=allowed&page=1&pageSize=5', {
  headers: { 
    'Authorization': 'Bearer patou_admin_2025_secure_token_xyz789',
    'x-admin-token': 'patou_admin_2025_secure_token_xyz789'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  return r.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.items) {
    console.log(`Found ${data.items.length} items out of ${data.total} total`);
  }
})
.catch(err => {
  console.error('Error:', err);
});