# 🗄️ Guide: Séparer Base de Données Dev et Production

## ⚠️ PROBLÈME ACTUEL

**Tu utilises la MÊME base de données pour:**
- Développement local (avec données de test)
- Production Vercel (avec vrais clients)

**Risques:**
- ❌ Les clients voient les faux produits de test
- ❌ Tu peux supprimer les vraies commandes par erreur
- ❌ Les données de test polluent la prod
- ❌ Impossible de tester sans casser la prod

---

## ✅ SOLUTION: 2 Bases de Données Neon

### Étape 1: Créer une nouvelle base de données PRODUCTION

1. **Va sur** https://console.neon.tech
2. **Clique** sur "Create Project" ou "New Project"
3. **Nom**: `achrilik-production`
4. **Region**: US East (Ohio) - même que dev
5. **Postgres Version**: 16 (même que dev)
6. **Clique** "Create Project"

### Étape 2: Récupérer la connection string PRODUCTION

1. Dans le nouveau projet `achrilik-production`
2. **Dashboard** → Connection String
3. **Copie** la connection string (format: `postgresql://...`)
4. Elle ressemblera à:
   ```
   postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require
   ```

### Étape 3: Initialiser le schéma PRODUCTION

```bash
# Sauvegarder l'ancienne DATABASE_URL
cp .env .env.backup

# Créer un fichier .env.production
cat > .env.production << 'EOF'
# PRODUCTION DATABASE (Neon)
DATABASE_URL="postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require"

# Cloudinary (même pour dev et prod)
CLOUDINARY_CLOUD_NAME=dh7lfs3pg
CLOUDINARY_API_KEY=622788157439394
CLOUDINARY_API_SECRET=Kq-3oiYwgVddAguPjKRaQixI59U

# SMTP (même pour dev et prod)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a0a493001@smtp-brevo.com
SMTP_PASS=3QGjpv2BDs68AdnM

# URL de production
NEXT_PUBLIC_URL=https://achrilik.vercel.app
EOF

# Générer le schéma Prisma sur la base PROD
DATABASE_URL="postgresql://achrilik-production_owner:XXX@..." npx prisma db push

# Créer un admin sur la base PROD
DATABASE_URL="postgresql://achrilik-production_owner:XXX@..." npx tsx create-admin.ts
```

### Étape 4: Configurer Vercel avec la base PRODUCTION

1. **Va sur** https://vercel.com/dashboard
2. **Sélectionne** ton projet `achrilik`
3. **Settings** → Environment Variables
4. **Trouve** `DATABASE_URL`
5. **Modifie** la valeur pour mettre la connection string PRODUCTION:
   ```
   postgresql://achrilik-production_owner:XXX@ep-XXX.us-east-1.aws.neon.tech/achrilik-production?sslmode=require
   ```
6. **Environnement**: Sélectionne UNIQUEMENT "Production" (pas Preview, pas Development)
7. **Save**

### Étape 5: Garder la base DEV pour le développement local

Ton `.env` local reste avec la base de DEV:
```env
# DEVELOPMENT DATABASE (avec données de test)
DATABASE_URL="postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

## 📊 Résultat Final

| Environnement | Base de Données | Données | URL |
|---------------|-----------------|---------|-----|
| **Local Dev** | `neondb` (actuelle) | Données de test (127 catégories, 60 produits, etc.) | http://localhost:3000 |
| **Production** | `achrilik-production` (nouvelle) | Données réelles clients | https://achrilik.vercel.app |

---

## 🔄 Workflow Quotidien

### Développement Local
```bash
# Utilise automatiquement .env (base DEV)
npm run dev

# Tu peux tester, casser, reseed sans risque
npm run seed
```

### Déploiement Production
```bash
# Commit et push
git add .
git commit -m "nouvelle feature"
git push

# Vercel déploie automatiquement
# → Utilise la base PRODUCTION (configurée dans Vercel)
```

---

## 🛡️ Sécurité des Données

### Base DEV (locale)
- ✅ Données de test
- ✅ Peut être réinitialisée à tout moment
- ✅ Partagée dans le code (pas de secret)

### Base PRODUCTION
- 🔒 Données réelles clients
- 🔒 JAMAIS réinitialisée
- 🔒 Connection string UNIQUEMENT dans Vercel (pas dans le code)
- 🔒 Backups automatiques Neon

---

## ⚡ Migration des Données (Optionnel)

Si tu veux migrer certaines données de DEV vers PROD:

```bash
# Exporter les catégories de DEV
DATABASE_URL="postgresql://neondb_owner:..." npx prisma db seed

# Ou créer un script de migration custom
# scripts/migrate-categories-to-prod.ts
```

---

## ✅ Checklist

- [ ] Créer projet Neon `achrilik-production`
- [ ] Récupérer connection string PROD
- [ ] Initialiser schéma Prisma sur base PROD
- [ ] Créer admin sur base PROD
- [ ] Configurer `DATABASE_URL` dans Vercel (Production only)
- [ ] Tester déploiement
- [ ] Vérifier que la base PROD est vide (pas de données de test)
- [ ] Garder `.env` local avec base DEV

---

**Veux-tu que je t'aide à créer la base PRODUCTION maintenant ?**

Je peux te guider étape par étape ou créer un script automatique.
