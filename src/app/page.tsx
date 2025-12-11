import Link from 'next/link';

/**
 * 🏠 ZYEUTÉ LANDING PAGE
 * 
 * The first thing people see - Quebec pride front and center!
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <span className="text-6xl mb-4 block animate-float">⚜️</span>
          <h1 className="font-quebec-serif text-5xl md:text-7xl text-gold-gradient mb-4">
            ZYEUTÉ
          </h1>
          <p className="text-xl md:text-2xl text-gold-400 font-light">
            Le TikTok du Québec
          </p>
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-gray-300 max-w-md mb-12">
          Le premier réseau social <span className="text-gold-500 font-semibold">100% québécois</span>.
          <br />
          Fait icitte, pour nous autres.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/register"
            className="btn-luxury px-8 py-4 text-lg"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 text-lg border-2 border-gold-600 text-gold-400 rounded-lg hover:bg-gold-600/10 transition-colors"
          >
            Se connecter
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex -space-x-2">
            {/* Avatar placeholders */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 border-2 border-espresso-700"
              />
            ))}
          </div>
          <span>
            Rejoins <span className="text-gold-400 font-semibold">1,000+</span> Québécois
          </span>
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-6 py-16 bg-espresso-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-quebec-serif text-2xl text-gold-gradient text-center mb-12">
            Pourquoi Zyeuté?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-leather p-6 text-center">
              <span className="text-4xl mb-4 block">🤖</span>
              <h3 className="font-semibold text-gold-400 mb-2">Ti-Guy, ton chum IA</h3>
              <p className="text-sm text-gray-400">
                Un assistant qui parle joual pis qui comprend ta culture!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-leather p-6 text-center">
              <span className="text-4xl mb-4 block">📍</span>
              <h3 className="font-semibold text-gold-400 mb-2">Contenu hyper-local</h3>
              <p className="text-sm text-gray-400">
                Découvre ce qui se passe dans ton quartier, ta ville, ta région.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-leather p-6 text-center">
              <span className="text-4xl mb-4 block">💰</span>
              <h3 className="font-semibold text-gold-400 mb-2">Gagne des cennes</h3>
              <p className="text-sm text-gray-400">
                Monétise ton contenu avec notre système de gifts québécois!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quebec Pride Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-300 mb-6">
            "Icitte, on parle comme on veut, on célèbre ce qu'on est, 
            pis on supporte nos créateurs locaux."
          </p>
          <div className="flex items-center justify-center gap-2 text-gold-500">
            <span>🍁</span>
            <span className="font-quebec-serif text-sm">FAIT AU QUÉBEC, POUR LE QUÉBEC</span>
            <span>⚜️</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-espresso-600">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚜️</span>
            <span className="font-semibold text-gold-400">Zyeuté</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-gold-400 transition-colors">
              À propos
            </Link>
            <Link href="/privacy" className="hover:text-gold-400 transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-gold-400 transition-colors">
              Conditions
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            © 2025 Zyeuté. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
