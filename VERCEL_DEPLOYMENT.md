# 🚀 Guide Déploiement Vercel - Achrilik

## Étape 1: Installation Vercel CLI

```bash
npm install -g vercel
```

## Étape 2: Login

```bash
vercel login
```

Cela ouvrira ton navigateur pour te connecter.

## Étape 3: Déploiement

### Première fois (configuration):
```bash
cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop
vercel
```

Réponses aux questions:
- **Set up and deploy?** → `Y`
- **Which scope?** → Choisis ton compte
- **Link to existing project?** → `N` (sauf si tu as déjà créé le projet)
- **What's your project's name?** → `achrilik` (ou autre)
- **In which directory is your code located?** → `./` (Enter)
- **Want to override the settings?** → `N` (Enter)

### Déploiement production:
```bash
vercel --prod
```

## Étape 4: Variables d'Environnement

**IMPORTANT**: Ajoute les variables via le dashboard Vercel:

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet `achrilik`
3. Settings → Environment Variables
4. Ajoute ces variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

CLOUDINARY_CLOUD_NAME=dh7lfs3pg
CLOUDINARY_API_KEY=622788157439394
CLOUDINARY_API_SECRET=Kq-3oiYwgVddAguPjKRaQixI59U

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a0a493001@smtp-brevo.com
SMTP_PASS=3QGjpv2BDs68AdnM

NEXT_PUBLIC_URL=https://achrilik.vercel.app
```

**Environnement**: Sélectionne `Production`, `Preview`, et `Development` pour chaque variable.

## Étape 5: Redéployer après ajout des variables

```bash
vercel --prod
```

## Étape 6: Vérification

1. Ouvre l'URL fournie (ex: `https://achrilik.vercel.app`)
2. Teste:
   - ✅ Homepage se charge
   - ✅ Catégories fonctionnent
   - ✅ Inscription/Connexion
   - ✅ Ajout panier
   - ✅ Checkout
   - ✅ Email de confirmation reçu

## 🔧 Troubleshooting

### Erreur: "Command failed"
```bash
# Vérifier que le build passe localement
npm run build

# Si ça échoue, corriger les erreurs avant de déployer
```

### Erreur: "Database connection failed"
- Vérifie que `DATABASE_URL` est bien configurée dans Vercel
- Vérifie que Neon autorise les connexions depuis Vercel

### Emails ne partent pas
- Vérifie les variables SMTP dans Vercel
- Vérifie les logs: `vercel logs`

## 📊 Commandes Utiles

```bash
# Voir les logs en temps réel
vercel logs --follow

# Lister les déploiements
vercel list

# Supprimer un déploiement
vercel remove [deployment-url]

# Voir les variables d'environnement
vercel env ls
```

## ✅ Checklist Post-Déploiement

- [ ] Site accessible sur l'URL Vercel
- [ ] Homepage affiche les 6 catégories
- [ ] Bannière rouge visible avec phrases d'accroche
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Ajout au panier fonctionne
- [ ] Checkout fonctionne
- [ ] Message de confirmation s'affiche
- [ ] Commande visible dans "Mes Commandes"
- [ ] Produits visibles dans la commande
- [ ] Email de confirmation reçu (acheteur)
- [ ] Email de notification reçu (vendeur)

---

**Ton app sera en ligne en ~3 minutes !** 🚀
