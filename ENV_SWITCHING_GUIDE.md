# 🔄 Guide: Switch entre Dev et Production

## 🎯 Système de Switch Automatique

J'ai créé un système simple pour switcher entre dev et prod !

---

## 📁 Fichiers Créés

```
.env                  → Fichier actif (utilisé par l'app)
.env.development      → Configuration DEV (base de test)
.env.production       → Configuration PROD (base clients)
switch-env.sh         → Script de switch
```

---

## 🚀 Comment Utiliser

### Switcher vers DEV (base de test)
```bash
./switch-env.sh dev
```

**Résultat:**
- ✅ `.env` pointe vers la base DEV
- ✅ Tu peux faire `npm run dev`
- ✅ Tu peux faire `npm run seed` sans risque
- ✅ Données de test (127 catégories, 60 produits)

### Switcher vers PROD (base clients)
```bash
./switch-env.sh prod
```

**Résultat:**
- ✅ `.env` pointe vers la base PROD
- ⚠️ **ATTENTION**: Tu es connecté à la vraie base !
- 🚨 **NE PAS** faire `npm run seed` !
- 🚨 **PRUDENCE** avec les migrations

---

## 📋 Workflow Recommandé

### Développement Normal (99% du temps)
```bash
# Toujours en DEV
./switch-env.sh dev
npm run dev

# Tu peux tester, casser, reseed
npm run seed
```

### Test en Local avec Base PROD (rare)
```bash
# Switcher temporairement vers PROD
./switch-env.sh prod
npm run dev

# Tester quelque chose sur la vraie base
# ...

# TOUJOURS revenir en DEV après
./switch-env.sh dev
```

### Déploiement Production
```bash
# Pas besoin de switch !
# Vercel utilise automatiquement la base PROD configurée dans ses variables

git add .
git commit -m "nouvelle feature"
git push
```

---

## ⚙️ Configuration Initiale Requise

### Étape 1: Créer la Base PRODUCTION sur Neon

1. **Va sur** https://console.neon.tech
2. **Nouveau projet**: `achrilik-production`
3. **Copie** la connection string

### Étape 2: Mettre la Connection String PROD

```bash
# Édite .env.production
nano .env.production

# Remplace cette ligne:
DATABASE_URL="postgresql://REMPLACE_MOI@..."

# Par ta vraie connection string:
DATABASE_URL="postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require"

# Sauvegarde (Ctrl+O, Enter, Ctrl+X)
```

### Étape 3: Initialiser la Base PROD

```bash
# Switcher vers PROD
./switch-env.sh prod

# Initialiser le schéma Prisma
npx prisma db push

# Créer un admin
npx tsx create-admin.ts

# Revenir en DEV
./switch-env.sh dev
```

### Étape 4: Configurer Vercel

1. **Va sur** https://vercel.com/dashboard
2. **Ton projet** → Settings → Environment Variables
3. **Modifie** `DATABASE_URL`:
   - Value: Ta connection string PROD
   - Environment: **Production ONLY** ✅ (décoche Preview et Development)
4. **Save**
5. **Redéploie** (Deployments → ... → Redeploy)

---

## 🔍 Vérifier l'Environnement Actuel

```bash
# Voir quelle base est active
cat .env | grep DATABASE_URL

# Ou utiliser le script
./switch-env.sh
```

---

## 🛡️ Sécurité

### ✅ Fichiers à Commit sur Git
- ✅ `.env.development` (base de test, pas de secret)
- ✅ `switch-env.sh` (script utile)
- ✅ `.env.production` (TEMPLATE SEULEMENT, sans vraie connection string)

### ❌ Fichiers à NE PAS Commit
- ❌ `.env` (fichier actif, change selon l'environnement)
- ❌ `.env.production` (avec vraie connection string)

**Vérifie ton `.gitignore`:**
```bash
cat .gitignore | grep .env
```

Devrait contenir:
```
.env
.env.local
.env*.local
```

---

## 📊 Tableau Récapitulatif

| Commande | Base Utilisée | Données | Usage |
|----------|---------------|---------|-------|
| `./switch-env.sh dev` | DEV (neondb) | Test | Développement quotidien |
| `./switch-env.sh prod` | PROD (achrilik-production) | Réelles | Debug prod en local |
| `npm run dev` (après switch) | Selon `.env` | Selon base | Serveur local |
| Vercel déploiement | PROD (config Vercel) | Réelles | Production live |

---

## 🎯 Prochaines Étapes

1. **Crée la base PROD sur Neon** (2 min)
2. **Copie la connection string** dans `.env.production`
3. **Initialise la base PROD**: `./switch-env.sh prod && npx prisma db push`
4. **Crée un admin PROD**: `npx tsx create-admin.ts`
5. **Configure Vercel** avec la connection string PROD
6. **Reviens en DEV**: `./switch-env.sh dev`
7. **Déploie**: `git push`

---

**Dis-moi quand tu as créé la base PROD sur Neon et je t'aiderai pour le reste !** 🚀
