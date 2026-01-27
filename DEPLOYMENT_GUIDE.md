# Guide de Déploiement - Achrilik

## 🚀 Options de Déploiement

### Option 1: Netlify (RECOMMANDÉ ✅)
**Avantages**:
- Gratuit (100 GB bandwidth/mois)
- `netlify.toml` déjà configuré
- Déploiement en 1 clic
- SSL automatique
- Form handling gratuit

**Steps**:
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod

# Ou via interface web:
# https://app.netlify.com/start
# → Connect GitHub
# → Select repo
# → Deploy
```

**Variables d'environnement Netlify**:
```
DATABASE_URL=postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
CLOUDINARY_CLOUD_NAME=dh7lfs3pg
CLOUDINARY_API_KEY=622788157439394
CLOUDINARY_API_SECRET=Kq-3oiYwgVddAguPjKRaQixI59U
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a0a493001@smtp-brevo.com
SMTP_PASS=3QGjpv2BDs68AdnM
NEXT_PUBLIC_URL=https://achrilik.netlify.app
```

---

### Option 2: Render.com
**Avantages**:
- Gratuit (750h/mois)
- Plus généreux que Netlify
- PostgreSQL gratuit inclus
- Auto-redeploy sur Git push

**Steps**:
1. Aller sur https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment: Node
5. Ajouter variables d'environnement
6. Deploy

---

### Option 3: Railway.app
**Avantages**:
- $5 crédit gratuit/mois
- Meilleure performance
- Logs en temps réel
- Database incluse

**Steps**:
1. https://railway.app
2. New Project → From GitHub
3. Variables d'environnement
4. Deploy automatique

---

### Option 4: Vercel (si nouveau compte)
**Steps**:
```bash
# 1. Nouveau email
# 2. https://vercel.com/signup
# 3. Import project
# 4. Variables d'environnement
# 5. Deploy
```

---

## ⚡ DÉPLOIEMENT RAPIDE NETLIFY

### Via CLI (5 minutes):
```bash
cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop

# Si pas encore installé:
npm install -g netlify-cli

# Login (ouvre browser)
netlify login

# Link au site (ou créer nouveau)
netlify init

# Build
npm run build

# Deploy en production
netlify deploy --prod

# L'URL sera affichée: https://achrilik.netlify.app
```

### Via Interface Web (3 minutes):
1. https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. Choisir Git provider (GitHub/GitLab)
4. Sélectionner repo `dz-shop`
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Variables d'environnement (copier .env)
7. Deploy site

---

## 🔧 Configuration

### netlify.toml (déjà présent ✅)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### next.config.ts
Vérifier que `output` n'est pas défini (standalone pas supporté Netlify).
Si présent, commenter:
```ts
// output: 'standalone', // ❌ Commenter pour Netlify
```

---

## ✅ Checklist Post-Déploiement

### Immédiat (5 min)
- [ ] Ouvrir l'URL de prod
- [ ] Vérifier homepage se charge
- [ ] Tester inscription
- [ ] Tester connexion
- [ ] Vérifier catégories "Bébé"
- [ ] Tester ajout panier

### Premier jour (1h)
- [ ] Créer produit test
- [ ] Passer commande test
- [ ] Vérifier emails envoyés
- [ ] Tester panel admin
- [ ] Vérifier Google Maps
- [ ] Tester responsive mobile

### Monitoring (continu)
- [ ] Netlify Analytics (gratuit)
- [ ] Sentry error tracking
- [ ] Database Neon metrics
- [ ] Brevo email delivery rates

---

## 🐛 Troubleshooting

### Build échoue sur Netlify
**Problème**: Environnement variables manquantes
**Solution**: Ajouter toutes les vars Netlify dashboard

### API routes 404
**Problème**: Redirects not setup
**Solution**: Vérifier `netlify.toml` présent

### Database connection timeout
**Problème**: Neon cold start
**Solution**: Attendre 30 secondes, retry

### Images ne chargent pas
**Problème**: Cloudinary API key invalide
**Solution**: Vérifier vars environnement

---

## 💰 Coûts

### Netlify Free Tier:
- 100 GB bandwidth/mois
- 300 build minutes/mois
- Illimité sites
- **GRATUIT** ✅

### Si dépassement:
- $19/mois Pro plan
- Mais très peu probable début

---

## 🎯 MA RECOMMANDATION

**NETLIFY** car:
1. ✅ Config déjà faite (`net lify.toml`)
2. ✅ Gratuit et généreux
3. ✅ 1-click deploy
4. ✅ SSL auto
5. ✅ CDN global

**Alternative**: Render.com si besoin plus de compute power

---

**Prêt à déployer ?** 🚀
`netlify deploy --prod`
