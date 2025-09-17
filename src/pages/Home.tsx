export default function Home() {
  console.log('🏠 Home component rendered')
  console.log('🌐 Current location:', window.location.href)
  console.log('🌐 Current pathname:', window.location.pathname)
  console.log('🌐 Current origin:', window.location.origin)
  console.log('🔍 Home component fully loaded')

  const handleSpotifyAuth = () => {
    console.log('🎯 handleSpotifyAuth called')
    console.log('🔧 Building URL with origin:', window.location.origin)
    
    const url = `${window.location.origin}/.netlify/functions/spotify-auth-start`
    console.log('🔗 Final URL:', url)
    
    console.log('🚀 Method 1: Attempting window.location.replace...')
    try {
      window.location.replace(url)
      console.log('✅ window.location.replace executed')
    } catch (error) {
      console.error('❌ Error during replace:', error)
      
      console.log('🚀 Method 2: Attempting window.location.href...')
      try {
        window.location.href = url
        console.log('✅ window.location.href executed')
      } catch (error2) {
        console.error('❌ Error during href:', error2)
        
        console.log('🚀 Method 3: Attempting document.location...')
        try {
          document.location = url
          console.log('✅ document.location executed')
        } catch (error3) {
          console.error('❌ All navigation methods failed:', error3)
        }
      }
    }
  }

  console.log('🎨 About to render JSX')
  return (
    <section className="mx-auto max-w-xl text-center">
      {console.log('🎨 Rendering JSX content')}
      <img src="/patou-logo.svg" alt="Patou" className="h-20 w-20 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Musique familiale, en toute simplicité</h1>
      <p className="text-gray-600 mb-8">Bêta minimale — authentification Spotify requise pour le lecteur.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          className="inline-block px-5 py-3 rounded-lg bg-black text-white font-medium"
        >
          {console.log('🎨 Rendering button')}
          Se connecter avec Spotify (Parent)
        </button>
        <a href="/child/login" className="inline-block px-5 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium">
          Espace enfant
        </a>
      </div>
    </section>
  )
}