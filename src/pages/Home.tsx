import { Link } from 'react-router-dom'
import { ShieldCheck, Users, SunMedium } from 'lucide-react'
import PublicLayout from '../layouts/PublicLayout'
import { GridPatterns } from '../components/ui/ResponsiveGrid'
import LazyImage from '../components/ui/LazyImage'

export default function Home() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="text-center">
        <LazyImage 
          src="/patou-logo.svg" 
          alt="Patou" 
          className="mx-auto h-20 md:h-24"
          loading="eager"
          size="small"
        />
        <h1 className="mt-6 text-3xl md:text-5xl font-extrabold text-gray-900">
          Musique sécurisée pour toute la famille
        </h1>
        <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Lecteur enfant + outils parent. Contenus filtrés, playlists adaptées, curation simple.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/parent/signup"
            className="weweb-btn-primary"
          >
            Créer un compte gratuit
          </Link>
          <Link
            to="/child"
            className="weweb-btn-secondary"
          >
            Espace enfant
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-12 md:mt-16">
        <GridPatterns.Features>
          <div className="patou-card-feature patou-animate-slide-up">
            <Feature color="protect" Icon={ShieldCheck} title="Protéger"
              text="Filtres d'âge, outils parent, contenus vérifiés — sérénité totale." />
          </div>
          <div className="patou-card-feature patou-animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Feature color="share" Icon={Users} title="Partager"
              text="Playlists familiales, favoris communs, découvertes ensemble." />
          </div>
          <div className="patou-card-feature patou-animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Feature color="awaken" Icon={SunMedium} title="Éveiller"
              text="Découvertes adaptées, curiosité musicale, énergie positive." />
          </div>
        </GridPatterns.Features>
      </section>

      {/* CTA */}
      <section className="mt-14 md:mt-20">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-protect text-white p-8 md:p-10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Prêt à commencer l'aventure ?</h2>
              <p className="mt-2 text-white/90">Créez votre compte parent et ajoutez vos enfants en 2 minutes.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/parent/signup" className="rounded-lg bg-white px-5 py-3 font-semibold text-primary hover:bg-white/90 transition-all duration-300">
                Créer mon compte
              </Link>
              <Link to="/parent/login" className="rounded-lg bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20 transition-all duration-300">
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

function Feature({
  color, title, text, Icon,
}: { color: 'protect' | 'share' | 'awaken'; title: string; text: string; Icon: any }) {
  const map = {
    protect: 'bg-protect/10 text-protect',
    share: 'bg-share/10 text-share',
    awaken: 'bg-awaken/30 text-gray-900',
  } as const
  return (
    <>
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${map[color]} patou-icon`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-gray-600">{text}</p>
    </>
  )
}