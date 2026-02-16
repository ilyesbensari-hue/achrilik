# 🚀 Guide de Déploiement Achrilik

## ⚠️ Règle Importante
**TOUJOURS appliquer les migrations DB après un push qui contient une migration Prisma !**

---

## 📋 Checklist Rapide

### Déploiement Normal (sans DB)
```bash
git push origin main
# Attendre build Vercel → Tester le site
```

### Déploiement avec Migration DB
```bash
# 1. Push le code
git push origin main

# 2. ⚠️ IMPORTANT - Appliquer migration sur production
npm run deploy:migrations

# 3. Attendre build Vercel → Tester le site
```

---

## 🛠️ Scripts Disponibles

| Commande | Usage |
|----------|-------|
| `npm run deploy:migrations` | Applique migrations DB sur production |
| `npm run deploy:check` | Vérifie l'état des migrations |
| `npm run build` | Build local (test avant push) |

---

## 🆘 En Cas de Problème

### Site crash après déploiement ?

1. **Vérifier logs Vercel** : https://vercel.com/achriliks-projects
2. **Si erreur "column does not exist"** :
   ```bash
   npm run deploy:migrations
   ```
3. **Si migration échoue (P3005)** :
   ```bash
   npx prisma migrate resolve --applied NOM_MIGRATION
   ```

### Rollback d'urgence
```bash
# Via Vercel : Dashboard → Deployments → "Promote to Production" sur version stable
vercel rollback
```

---

## 📚 Guide Complet

Voir [`deployment_guide.md`](file:///Users/ilyes/.gemini/antigravity/brain/7e963e1a-e008-4ba4-980b-a6a369d3ebf3/deployment_guide.md) dans les artifacts pour documentation détaillée.

---

**Dernière mise à jour** : 16 Février 2026
