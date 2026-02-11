# 🔐 Configuration Upstash Rate Limiting - Guide Complet

## 🎯 Objectif

Configurer **Upstash Redis** pour activer le **rate limiting** sur 4 routes critiques et protéger l'application contre les attaques par brute force, spam, et DOS.

---

## 📋 Étapes de Configuration

### Étape 1: Créer Compte Upstash (2 min)

1. **Aller sur** : https://upstash.com
2. **S'inscrire** avec GitHub/Google ou email
3. **Vérifier l'email**

---

### Étape 2: Créer Database Redis (3 min)

1. **Dans le dashboard Upstash**, cliquer sur **"Create Database"**
2. **Configurer** :
   - **Name** : `achrilik-ratelimit`
   - **Region** : `us-east-1` (ou le plus proche de votre serveur)
   - **Type** : **Global** (pour le free tier)
3. **Cliquer "Create"**

![Upstash Dashboard](https://docs.upstash.com/img/redis/create_database.png)

---

### Étape 3: Obtenir Credentials (1 min)

1. **Cliquer sur la database** créée
2. **Copier les credentials** :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Exemple** :
```
UPSTASH_REDIS_REST_URL=https://us1-merry-fox-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXlkX0VhejQxN2NmZjlmMjQ3N...
```

---

### Étape 4: Ajouter au fichier .env (1 min)

**Ouvrir** `/Users/ilyes/.gemini/antigravity/scratch/dz-shop/.env` et **ajouter** :

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://us1-merry-fox-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXlkX0VhejQxN2NmZjlmMjQ3N...
```

**⚠️ IMPORTANT** : Remplacer par vos vraies credentials !

---

### Étape 5: Configurer sur Vercel (Production) (2 min)

1. **Aller sur** : https://vercel.com/dashboard
2. **Sélectionner le projet** `dz-shop`
3. **Settings** → **Environment Variables**
4. **Ajouter les 2 variables** :
   
   | **Key** | **Value** | **Environment** |
   |---------|-----------|-----------------|
   | `UPSTASH_REDIS_REST_URL` | `https://...` | Production, Preview, Development |
   | `UPSTASH_REDIS_REST_TOKEN` | `AXlk...` | Production, Preview, Development |

5. **Cliquer "Save"**

---

## ✅ Vérification

### Test Local

```bash
# Démarrer le serveur
npm run dev

# Tester rate limit login (5 req/min max)
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Résultat attendu** :
- Requêtes 1-5 : `401` (credential error)
- Requêtes 6-7 : **`429`** (rate limited) ✅

---

### Test Production

Après déploiement sur Vercel :

```bash
for i in {1..7}; do
  curl -X POST https://achrilik.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Message affiché** après 5 tentatives :
```json
{
  "error": "Trop de tentatives de connexion. Réessayez dans 1 minute."
}
```

---

## 📊 Routes Protégées

| Route | Limite | Window | Protection |
|-------|--------|--------|------------|
| `/api/auth/login` | 5 req | 1 min | Brute force |
| `/api/auth/register-v2` | 3 req | 1 min | Spam accounts |
| `/api/contact` | 10 req | 1 min | Contact spam |
| `/api/orders` (POST) | 10 req | 1 min | Order flooding |

---

## 🔍 Monitoring

### Dashboard Upstash

1. **Aller sur** : https://console.upstash.com
2. **Sélectionner la database**
3. **Voir** :
   - Nombre de requêtes
   - Blocked requests
   - Performance metrics

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow
```

**Rechercher** : `429` pour voir les rate limit hits

---

## 💰 Pricing (Free Tier)

**Upstash Free Plan** :
- ✅ **10,000 commands/day**
- ✅ **Global replication**
- ✅ **No credit card required**

Pour l'usage actuel :
- ~500 req/day = **bien en dessous de la limite**
- **0€/mois** 🎉

---

## 🐛 Troubleshooting

### Error: "Cannot connect to Redis"

**Cause** : Credentials invalides ou réseau

**Solution** :
```bash
# Vérifier les credentials
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Tester manuellement
curl -X GET $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
# Attendu: {"result":"PONG"}
```

---

### Rate Limit ne fonctionne pas

**Vérifier** :
1. Credentials bien configurés dans `.env`
2. Server redémarré après ajout des env vars
3. IP correctement détectée (check `getClientIp()` dans `/lib/ratelimit.ts`)

---

## ✅ Checklist Finale

- [ ] Compte Upstash créé
- [ ] Database Redis créée
- [ ] Credentials copiés
- [ ] `.env` mis à jour localement
- [ ] Vercel env vars configurés
- [ ] Test local réussi (429 après 5 req)
- [ ] Déployé en production
- [ ] Test production réussi
- [ ] Monitoring activé

---

## 🚀 Prochaines Étapes

Une fois Upstash configuré :
1. ✅ Deploy sur Vercel
2. ✅ Tester rate limiting
3. ✅ Monitorer dashboard Upstash
4. ✅ L'application est **production-ready** ! 🎉
