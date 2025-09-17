import { useState } from 'react'
import { moderateTrack } from '../services/moderationService'

export default function TestModeration() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testTrack = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const moderationResult = await moderateTrack({
        spotify_track_id: "3n3Ppam7vgaVa1iaRUc9Lp",
        source: "import"
      })
      
      setResult(moderationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test de Modération</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Track: 3n3Ppam7vgaVa1iaRUc9Lp</h2>
          
          <button
            onClick={testTrack}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Modération en cours...' : 'Tester la modération'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Résultat de la modération</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Décision</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  result.decision === 'allow' ? 'bg-green-100 text-green-800' :
                  result.decision === 'block' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.decision}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Règles déclenchées</h4>
                <div className="space-y-1">
                  {result.rules_fired.map((rule: string, index: number) => (
                    <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm mr-2">
                      {rule}
                    </span>
                  ))}
                </div>
              </div>

              {result.track_info && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-2">Informations de la piste</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Titre:</strong> {result.track_info.name}</p>
                    <p><strong>Artiste:</strong> {result.track_info.artist}</p>
                    <p><strong>Explicite:</strong> {result.track_info.explicit ? 'Oui' : 'Non'}</p>
                    <p><strong>Popularité:</strong> {result.track_info.popularity}/100</p>
                    <p><strong>Durée:</strong> {Math.floor(result.track_info.duration_ms / 60000)}:{String(Math.floor((result.track_info.duration_ms % 60000) / 1000)).padStart(2, '0')}</p>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-2">Scores de modération</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(result.scores).map(([category, score]) => (
                      <div key={category} className="text-sm">
                        <div className="font-medium">{category}</div>
                        <div className={`${Number(score) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                          {(Number(score) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <details className="mt-6">
              <summary className="cursor-pointer font-semibold text-gray-900">Données brutes (JSON)</summary>
              <pre className="mt-2 bg-gray-100 rounded-lg p-4 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}