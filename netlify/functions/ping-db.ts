export async function handler() {
  try {
    // Ici pareil, flag statique; tu brancheras un vrai test Supabase plus tard
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: true })
    }
  } catch (err) {
    return { 
      statusCode: 500, 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ok: false, error: err.message }) 
    }
  }
}