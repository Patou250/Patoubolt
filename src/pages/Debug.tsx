import { useEffect, useState } from 'react'

export default function Debug() {
  const [state, setState] = useState<any>({})

  useEffect(() => {
    (async () => {
      const ping = async (url: string) => {
        try { const r = await fetch(url, { credentials: 'include' }); return { status: r.status, ok: r.ok, body: await r.text() } }
        catch (e: any) { return { status: 0, ok: false, err: e.message } }
      }
      const res = {
        exchange: await ping('/.netlify/functions/spotify-exchange'),
        refresh: await ping('/.netlify/functions/spotify-refresh'),
        authStart: await ping('/.netlify/functions/spotify-auth-start')
      }
      setState(res)
    })()
  }, [])

  return <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">{JSON.stringify(state, null, 2)}</pre>
}