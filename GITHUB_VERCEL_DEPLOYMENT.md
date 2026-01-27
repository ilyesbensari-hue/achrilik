# 🚀 Déploiement via GitHub (MÉTHODE RECOMMANDÉE)

## Pourquoi c'est mieux ?

✅ **Auto-déploiement** : Chaque commit → déploiement automatique  
✅ **Historique** : Tu peux revenir en arrière facilement  
✅ **Preview** : Vercel crée une URL de preview pour chaque PR  
✅ **Pas de CLI** : Pas besoin d'installer Vercel CLI  

---

## Étape 1: Commit tes changements

```bash
cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop

# Voir les fichiers modifiés
git status

# Ajouter tous les changements
git add .

# Commit avec message descriptif
git commit -m "feat: amélioration homepage, checkout, emails et profil

- Ajout 6 sections catégories (Homme, Femme, Enfants, Maroquinerie, Accessoires, Électronique)
- Icône Accessoires changée (🎧)
- Bannière rouge focus Oran avec phrases d'accroche
- Message confirmation checkout
- Emails fiables pour serverless
- Affichage produits dans Mes Commandes"

# Push vers GitHub
git push origin main
```

---

## Étape 2: Connecter Vercel à GitHub (1ère fois seulement)

1. Va sur **https://vercel.com/new**
2. Clique sur **"Import Git Repository"**
3. **Autorise Vercel** à accéder à ton GitHub
4. **Sélectionne** le repo `dz-shop`
5. **Configure** (Vercel détecte Next.js automatiquement):
   - Framework: Next.js ✅
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Ajoute les variables d'environnement** (IMPORTANT):

```env
DATABASE_URL=postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

CLOUDINARY_CLOUD_NAME=dh7lfs3pg
CLOUDINARY_API_KEY=622788157439394
CLOUDINARY_API_SECRET=Kq-3oiYwgVddAguPjKRaQixI59U

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a0a493001@smtp-brevo.com
SMTP_PASS=3QGjpv2BDs68AdnM

NEXT_PUBLIC_URL=https://ton-projet.vercel.app
```

7. Clique sur **"Deploy"**

---

## Étape 3: Attendre le déploiement (2-3 min)

Vercel va :
1. ✅ Cloner ton repo
2. ✅ Installer les dépendances (`npm install`)
3. ✅ Générer Prisma (`prisma generate`)
4. ✅ Builder l'app (`npm run build`)
5. ✅ Déployer sur CDN global

Tu verras une barre de progression en temps réel.

---

## 🎉 C'est tout !

**Après la première configuration**, chaque fois que tu fais :

```bash
git add .
git commit -m "ton message"
git push
```

→ **Vercel redéploie automatiquement** en 2-3 min ! 🚀

---

## 📊 Avantages de cette méthode

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| **GitHub + Vercel** | ✅ Auto-déploiement<br>✅ Historique Git<br>✅ Preview URLs<br>✅ Rollback facile | ⏱️ Setup initial (1 fois) |
| **Vercel CLI** | ⚡ Rapide | ❌ Pas d'historique<br>❌ Permissions sudo |
| **Interface Vercel** | 🖱️ Simple | ❌ Manuel à chaque fois |

---

## 🔄 Workflow Quotidien

```bash
# 1. Faire tes modifications
code .

# 2. Tester localement
npm run dev

# 3. Commit et push
git add .
git commit -m "fix: correction bug checkout"
git push

# 4. Attendre 2-3 min
# → Vercel déploie automatiquement
# → Tu reçois une notification email

# 5. Vérifier sur l'URL de prod
# https://achrilik.vercel.app
```

---

## 🐛 Troubleshooting

### Le build échoue sur Vercel
```bash
# Tester le build localement d'abord
npm run build

# Si ça échoue, corriger les erreurs
# Puis commit et push
```

### Variables d'environnement manquantes
1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet
3. Settings → Environment Variables
4. Ajoute les variables manquantes
5. Redéploie : Deployments → ... → Redeploy

### Branch différente
```bash
# Si tu veux déployer une autre branch
git checkout develop
git push origin develop

# Vercel crée une preview URL automatiquement
```

---

## ✅ Checklist

- [ ] Repo GitHub existe et est à jour
- [ ] Vercel connecté à GitHub
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] URL de production fonctionne
- [ ] Emails de confirmation reçus

---

**C'est la méthode professionnelle utilisée par toutes les équipes !** 🎯
