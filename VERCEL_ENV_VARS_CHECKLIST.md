# ✅ Checklist Configuration Vercel - Variables d'Environnement

## 🎯 Variables à Configurer dans Vercel

### Accès: https://vercel.com/dashboard → Ton Projet → Settings → Environment Variables

---

## 📋 Variables OBLIGATOIRES

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_tQLjF2HXO3Ss@ep-gentle-unit-ahcrhcko-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
**Environnement:** Production, Preview, Development

⚠️ **IMPORTANT:** Pour l'instant, utilise la base DEV. Quand tu créeras la base PROD, tu changeras cette valeur pour Production uniquement.

---

### 2. CLOUDINARY_CLOUD_NAME
```
dh7lfs3pg
```
**Environnement:** Production, Preview, Development

---

### 3. CLOUDINARY_API_KEY
```
622788157439394
```
**Environnement:** Production, Preview, Development

---

### 4. CLOUDINARY_API_SECRET
```
Kq-3oiYwgVddAguPjKRaQixI59U
```
**Environnement:** Production, Preview, Development

---

### 5. SMTP_HOST
```
smtp-relay.brevo.com
```
**Environnement:** Production, Preview, Development

---

### 6. SMTP_PORT
```
587
```
**Environnement:** Production, Preview, Development

---

### 7. SMTP_USER
```
a0a493001@smtp-brevo.com
```
**Environnement:** Production, Preview, Development

---

### 8. SMTP_PASS
```
3QGjpv2BDs68AdnM
```
**Environnement:** Production, Preview, Development

---

### 9. NEXT_PUBLIC_URL
```
https://ton-projet.vercel.app
```
**Environnement:** Production

⚠️ **Remplace** `ton-projet` par le vrai nom de ton projet Vercel

**Pour Preview:**
```
https://preview.vercel.app
```

**Pour Development:**
```
http://localhost:3000
```

---

## 🔍 Comment Vérifier si c'est Configuré

### Option 1: Via l'Interface Vercel
1. Va sur https://vercel.com/dashboard
2. Clique sur ton projet
3. **Settings** → **Environment Variables**
4. Tu devrais voir **9 variables** listées

### Option 2: Via les Logs de Déploiement
1. **Deployments** → Dernier déploiement
2. Clique dessus
3. Regarde les **logs**
4. Si tu vois des erreurs type:
   - `DATABASE_URL is not defined`
   - `CLOUDINARY_CLOUD_NAME is not defined`
   → Les variables ne sont pas configurées

---

## 🚨 Erreurs Communes

### Erreur: "Database connection failed"
**Cause:** `DATABASE_URL` manquante ou incorrecte
**Solution:** Ajoute la variable dans Vercel

### Erreur: "Failed to upload image"
**Cause:** Variables Cloudinary manquantes
**Solution:** Ajoute `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Erreur: "Failed to send email"
**Cause:** Variables SMTP manquantes
**Solution:** Ajoute `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

---

## 📝 Procédure Complète (Si Pas Encore Fait)

### Étape 1: Aller sur Vercel
https://vercel.com/dashboard

### Étape 2: Sélectionner ton Projet
Clique sur `achrilik` (ou le nom de ton projet)

### Étape 3: Aller dans Settings
**Settings** (en haut) → **Environment Variables** (menu gauche)

### Étape 4: Ajouter Chaque Variable
Pour chaque variable ci-dessus:

1. **Clique** "Add New"
2. **Name:** (ex: `DATABASE_URL`)
3. **Value:** (copie la valeur ci-dessus)
4. **Environment:** Coche Production, Preview, Development
5. **Save**

Répète pour les 9 variables.

### Étape 5: Redéployer
1. **Deployments** → Dernier déploiement
2. **...** (3 points) → **Redeploy**
3. Attends 2-3 min

---

## ✅ Vérification Post-Configuration

Une fois les variables ajoutées et redéployé:

1. **Ouvre** ton URL Vercel (ex: https://achrilik.vercel.app)
2. **Teste:**
   - [ ] Site se charge (pas d'erreur 500)
   - [ ] Homepage s'affiche
   - [ ] Catégories visibles
   - [ ] Inscription fonctionne
   - [ ] Upload image produit fonctionne (Cloudinary)
   - [ ] Email de confirmation reçu (SMTP)

---

## 🎯 Résumé

**Variables à configurer:** 9
**Temps estimé:** 5 minutes
**Où:** https://vercel.com/dashboard → Ton Projet → Settings → Environment Variables

**Liste rapide:**
1. `DATABASE_URL`
2. `CLOUDINARY_CLOUD_NAME`
3. `CLOUDINARY_API_KEY`
4. `CLOUDINARY_API_SECRET`
5. `SMTP_HOST`
6. `SMTP_PORT`
7. `SMTP_USER`
8. `SMTP_PASS`
9. `NEXT_PUBLIC_URL`

---

**Dis-moi si tu as besoin d'aide pour configurer !** 🚀
