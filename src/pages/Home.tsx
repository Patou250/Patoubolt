import { Link } from 'react-router-dom'
import { ShieldCheck, Users, SunMedium } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 md:px-8 pt-14 md:pt-20 pb-10">
          <div className="text-center">
            <img
              src="/patou-logo.svg"
              alt="Patou"
              className="mx-auto h-16 md:h-20"
            />
            <h1 className="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Musique sécurisée pour toute la famille
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Lecteur enfant + outils parent. Contenus filtrés, playlists adaptées, curation simple.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/parent/signup"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:brightness-95"
              >
                Créer un compte gratuit
              </Link>
              <Link
                to="/child"
                className="inline-flex items-center justify-center rounded-lg bg-protect px-6 py-3 text-white font-semibold hover:brightness-95"
              >
                Espace enfant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-10 md:py-14 bg-white">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              color="protect"
              Icon={ShieldCheck}
              title="Protéger"
              text="Sécurité et confiance : filtres d'âge, outils parent, contenus vérifiés."
            />
            <Feature
              color="share"
              Icon={Users}
              title="Partager"
              text="Playlists familiales, favoris communs, découverte musicale ensemble."
            />
            <Feature
              color="awaken"
              Icon={SunMedium}
              title="Éveiller"
              text="Découvertes adaptées, curiosité musicale, énergie positive."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-protect text-white p-8 md:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  Prêt à commencer l'aventure musicale ?
                </h2>
                <p className="mt-2 text-white/90">
                  Créez votre compte parent et ajoutez vos enfants en 2 minutes.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/parent/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 font-semibold text-primary hover:bg-white/90"
                >
                  Créer mon compte
                </Link>
                <Link
                  to="/parent/login"
                  className="inline-flex items-center justify-center rounded-lg bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/20"
                >
                  J'ai déjà un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({
  color,
  title,
  text,
  Icon,
}: {
  color: 'protect' | 'share' | 'awaken'
  title: string
  text: string
  Icon: any
}) {
  const colorMap = {
    protect: 'bg-protect/10 text-protect',
    share: 'bg-share/10 text-share',
    awaken: 'bg-awaken/30 text-gray-900',
  }
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-gray-600">{text}</p>
    </div>
  )
}