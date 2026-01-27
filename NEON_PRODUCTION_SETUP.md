# 🚀 Guide Pas-à-Pas: Créer Base PRODUCTION sur Neon

## ⏱️ Temps estimé: 2 minutes

---

## Étape 1: Ouvrir Neon Console

1. **Ouvre** https://console.neon.tech dans ton navigateur
2. **Connecte-toi** avec ton compte (celui que tu utilises déjà)

---

## Étape 2: Créer un Nouveau Projet

1. **En haut à gauche**, clique sur le nom de ton projet actuel (probablement "neondb" ou similaire)
2. **Clique** sur **"Create a project"** ou le bouton **"+ New Project"**

---

## Étape 3: Configurer le Projet PRODUCTION

**Remplis le formulaire:**

| Champ | Valeur |
|-------|--------|
| **Project name** | `achrilik-production` |
| **Region** | **US East (Ohio)** (même que ta base actuelle) |
| **Postgres version** | **16** (laisse par défaut) |
| **Compute size** | **0.25 vCPU, 1 GB RAM** (gratuit) |

**Clique** sur **"Create Project"** (bouton vert)

⏱️ Attends 10-15 secondes que Neon crée la base...

---

## Étape 4: Copier la Connection String

Une fois le projet créé, tu verras un écran avec:

```
Connection string
postgresql://achrilik-production_owner:XXXXXXX@ep-XXXXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require
```

1. **Clique** sur l'icône **"Copy"** (📋) à côté de la connection string
2. **Colle-la** dans un fichier texte temporaire (tu en auras besoin)

---

## Étape 5: Initialiser le Schéma Prisma

**Reviens dans ton terminal** et exécute:

```bash
cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop

# Remplace XXX par ta vraie connection string
DATABASE_URL="postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require" npx prisma db push
```

**Tu verras:**
```
✔ Generated Prisma Client
✔ The database is now in sync with your Prisma schema.
```

---

## Étape 6: Créer un Compte Admin sur la Base PROD

```bash
# Remplace XXX par ta vraie connection string
DATABASE_URL="postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require" npx tsx create-admin.ts
```

**Quand demandé:**
- Email: `admin@achrilik.dz` (ou ton email)
- Password: `Admin123!` (ou ton mot de passe)
- Name: `Admin Achrilik`

---

## Étape 7: Configurer Vercel avec la Base PROD

1. **Va sur** https://vercel.com/dashboard
2. **Clique** sur ton projet `achrilik`
3. **Settings** → **Environment Variables**
4. **Trouve** la variable `DATABASE_URL`
5. **Clique** sur les **3 points** (...) → **Edit**
6. **Remplace** la valeur par ta nouvelle connection string PRODUCTION
7. **IMPORTANT**: Décoche "Preview" et "Development", garde SEULEMENT **"Production"** ✅
8. **Save**

---

## Étape 8: Redéployer sur Vercel

**Option A: Via l'interface**
1. **Deployments** → Clique sur le dernier déploiement
2. **...** → **Redeploy**

**Option B: Via Git (plus simple)**
```bash
# Fait un petit changement bidon
echo "# Production ready" >> README.md
git add README.md
git commit -m "chore: configure production database"
git push
```

Vercel va redéployer automatiquement avec la nouvelle base PROD ! 🚀

---

## ✅ Vérification

**Après le déploiement:**

1. **Ouvre** https://achrilik.vercel.app
2. **Vérifie** que le site se charge
3. **Vérifie** qu'il n'y a PAS les 127 catégories de test (la base est vide)
4. **Crée** un compte test
5. **Vérifie** que ça fonctionne

**En local:**
```bash
npm run dev
# → Utilise toujours la base DEV avec les données de test ✅
```

---

## 📊 Résultat Final

| Environnement | Base | Données | URL |
|---------------|------|---------|-----|
| **Local** | `neondb` | 127 catégories, 60 produits (test) | localhost:3000 |
| **Production** | `achrilik-production` | Vide (prête pour clients) | achrilik.vercel.app |

---

## 🎯 Prochaines Étapes

**Après le déploiement, tu devras:**

1. **Créer les vraies catégories** (via l'admin panel en prod)
2. **Créer les vrais vendeurs** (inscription normale)
3. **Créer les vrais produits** (via le seller dashboard)

**OU** si tu veux migrer certaines catégories de DEV vers PROD:
```bash
# Je peux te créer un script de migration si besoin
```

---

**Dis-moi quand tu as copié la connection string PRODUCTION, je t'aiderai pour les commandes !** 🚀
