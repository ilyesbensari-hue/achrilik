# Achrilik - Configuration Vercel

## Variables d'Environnement Requises

Pour déployer sur Vercel, ajoutez ces variables dans:
**Vercel Dashboard** → **Settings** → **Environment Variables**

### Base de Données (✅ Déjà configuré)
```bash
DATABASE_URL=postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Cloudinary (✅ Déjà configuré)
```bash
CLOUDINARY_CLOUD_NAME=dh7lfs3pg
CLOUDINARY_API_KEY=622788157439394
CLOUDINARY_API_SECRET=Kq-3oiYwgVddAguPjKRaQixI59U
```

### Sentry Error Monitoring (⚠️ À configurer)
1. Créer compte sur https://sentry.io
2. Créer nouveau projet "achrilik-web"
3. Copier le DSN
```bash
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@o[ORG].ingest.sentry.io/[PROJECT]
```

### Google Analytics (⚠️ À configurer)
1. Créer compte Google Analytics
2. Créer propriété GA4 pour "Achrilik"
3. Copier l'ID de mesure
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Posthog Analytics (⚠️ À configurer - Optionnel)
1. Créer compte sur https://posthog.com (gratuit)
2. Copier la clé projet
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Déploiement

### 1. Push le code
```bash
git add .
git commit -m "feat: add optimizations (Sentry, Analytics, Image optimization)"
git push origin main
```

### 2. Vercel auto-deploy
Vercel va automatiquement détecter les changements et déployer.

### 3. Ajouter variables d'environnement
Sur Vercel Dashboard, ajouter toutes les variables ci-dessus.

### 4. Redéployer
Après avoir ajouté les variables, redéployer le projet.
