# 🔥⚜️ ZYEUTÉ - Architecture Technique ⚜️🔥

> **"Le TikTok du Québec"** - Premier réseau social 100% québécois

---

## 🎯 Vision

Zyeuté est une plateforme sociale hyper-locale construite **par** et **pour** les Québécois, avec:
- Intelligence artificielle qui parle **joual authentique**
- Découverte de contenu **régionale** (quartier par quartier)
- Économie de créateurs **locale** (monnaie virtuelle: les "cennes")
- Souveraineté des données **québécoises**

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
├─────────────────────────────────────────────────────────────────┤
│  📱 PWA (Next.js 15)  │  📱 iOS (Future)  │  📱 Android (Future) │
└───────────────────────┴──────────────────┴──────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE NETWORK (Vercel)                       │
├─────────────────────────────────────────────────────────────────┤
│  🌐 CDN  │  ⚡ Edge Functions  │  🔒 Auth Middleware             │
└──────────┴────────────────────┴─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Ti-Guy     │  │    Flux      │  │   Content    │           │
│  │  (DeepSeek)  │  │  (Images)    │  │   Pipeline   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    Feed      │  │   Creator    │  │  Discovery   │           │
│  │   Engine     │  │   Economy    │  │   Algorithm  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Supabase)                       │
├─────────────────────────────────────────────────────────────────┤
│  🗄️ PostgreSQL  │  🔐 Auth  │  📁 Storage  │  ⚡ Realtime       │
└─────────────────┴───────────┴──────────────┴────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI SERVICES (Open Source)                   │
├─────────────────────────────────────────────────────────────────┤
│  🤖 DeepSeek V3 (Ti-Guy)  │  🎨 Flux.1 Schnell (Images)         │
│  via Together.ai/Direct    │  via Fal.ai/Replicate              │
└────────────────────────────┴────────────────────────────────────┘
```

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Raison |
|------------|---------|--------|
| **Next.js** | 15.x | App Router, RSC, Edge Runtime |
| **React** | 19.x | Concurrent features, Suspense |
| **TypeScript** | 5.x | Type safety, DX |
| **Tailwind CSS** | 4.x | Utility-first, performance |
| **shadcn/ui** | Latest | Composants accessibles |
| **Framer Motion** | 11.x | Animations fluides |

### Backend
| Service | Raison |
|---------|--------|
| **Supabase** | Auth + DB + Storage + Realtime |
| **Vercel** | Edge deployment, analytics |
| **Upstash Redis** | Rate limiting, caching |

### AI (Open Source - 98% Cost Reduction)
| Service | Modèle | Coût |
|---------|--------|------|
| **Ti-Guy** | DeepSeek V3 | $0.27/1M tokens |
| **Images** | Flux.1 Schnell | $0.003/image |
| **Embeddings** | BGE-M3 | Self-hosted |
| **Voice** | Whisper + Coqui | Future |

---

## 📁 Structure du Projet

```
zyeute/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── (auth)/                # Routes authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/
│   │   ├── (main)/                # Routes principales
│   │   │   ├── feed/              # Feed principal
│   │   │   ├── discover/          # Découverte
│   │   │   ├── create/            # Création de contenu
│   │   │   ├── profile/[username]/
│   │   │   ├── messages/          # DMs
│   │   │   └── notifications/
│   │   ├── (creator)/             # Espace créateur
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   └── monetization/
│   │   ├── api/                   # API Routes
│   │   │   ├── ai/
│   │   │   ├── posts/
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   └── page.tsx               # Landing
│   │
│   ├── 📂 components/
│   │   ├── ui/                    # Design system
│   │   ├── feed/                  # Feed components
│   │   ├── post/                  # Post components
│   │   ├── profile/               # Profile components
│   │   ├── ai/                    # Ti-Guy components
│   │   └── layout/                # Layout components
│   │
│   ├── 📂 services/
│   │   ├── tiGuyService.ts        # DeepSeek V3 integration
│   │   ├── imageGenService.ts     # Flux.1 integration
│   │   ├── feedService.ts         # Feed algorithm
│   │   └── creatorService.ts      # Creator economy
│   │
│   ├── 📂 lib/
│   │   ├── supabase/              # Supabase clients
│   │   ├── utils.ts               # Utilities
│   │   └── constants.ts           # App constants
│   │
│   ├── 📂 types/
│   │   ├── database.ts            # DB types (generated)
│   │   ├── api.ts                 # API types
│   │   └── index.ts               # Exports
│   │
│   └── 📂 styles/
│       ├── globals.css            # Global styles
│       └── quebec-theme.css       # Quebec design tokens
│
├── 📂 supabase/
│   ├── migrations/                # SQL migrations
│   ├── functions/                 # Edge functions
│   └── seed.sql                   # Seed data
│
├── 📂 public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── 📂 docs/
│   ├── ARCHITECTURE.md            # This file
│   ├── DATABASE.md                # Schema docs
│   ├── AI_STACK.md                # AI integration
│   └── ROADMAP.md                 # Launch plan
│
└── 📄 Config files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── .env.example
```

---

## 🔐 Authentification

### Flux d'Onboarding (Quebec-First)

```
1. "Bienvenue chez nous!" → Intro screen
2. Sign up (Email/Google/Apple)
3. "Choisis ta région" → Quebec regions picker
4. "Comment tu parles?" → Dialect preference
5. "Suis des créateurs" → Follow suggestions
6. "C'est parti!" → Main feed
```

### Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| `viewer` | Voir, liker, commenter |
| `creator` | + Publier, monétiser |
| `verified` | + Badge ⚜️, priorité |
| `business` | + Analytics avancés |
| `admin` | Full access |

---

## 📊 Métriques Clés

### Performance
- **LCP** < 2.5s
- **FID** < 100ms
- **CLS** < 0.1
- **TTFB** < 200ms (Edge)

### Business
- **DAU/MAU** > 60%
- **Session Duration** > 15 min
- **Posts/User/Week** > 3
- **Share Rate** > 30%

---

## 🚀 Phases de Développement

### Phase 1: MVP (4 semaines)
- [ ] Auth + Onboarding
- [ ] Feed basique
- [ ] Création de posts (image/texte)
- [ ] Profils utilisateurs
- [ ] Ti-Guy captions

### Phase 2: Social (4 semaines)
- [ ] Commentaires + réponses
- [ ] Système de "Feu" (likes)
- [ ] Follow/Following
- [ ] Notifications
- [ ] DMs basiques

### Phase 3: Discovery (4 semaines)
- [ ] Algorithme de feed
- [ ] Recherche
- [ ] Hashtags tendances
- [ ] Feed régional
- [ ] Challenges

### Phase 4: Creator Economy (4 semaines)
- [ ] Système de "Cennes"
- [ ] Virtual gifts
- [ ] Creator dashboard
- [ ] Payouts (Stripe Connect)
- [ ] Subscriptions

---

## 🔒 Sécurité

### Mesures
- Row Level Security (RLS) sur toutes les tables
- Rate limiting via Upstash
- Content moderation (AI + human)
- PIPEDA/GDPR compliance
- Data residency (Canada)

### Content Policy
- Modération automatique (ToxicBert)
- Reports utilisateurs
- Queue de modération humaine
- Ban progressif (warning → temp → perm)

---

## 📈 Scalabilité

### Targets
| Métrique | MVP | 6 mois | 12 mois |
|----------|-----|--------|---------|
| Users | 1K | 100K | 500K |
| Posts/day | 100 | 50K | 250K |
| Requests/sec | 10 | 1K | 5K |

### Stratégies
- Edge caching agressif
- Image optimization (Vercel)
- Database read replicas
- CDN pour media
- Queue pour AI tasks

---

⚜️ **Fait au Québec, pour le Québec** ⚜️
