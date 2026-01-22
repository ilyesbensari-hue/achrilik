# 📧 Configuration SMTP - Action Requise

## ⚠️ Emails Actuellement Désactivés

Les emails ne peuvent pas être envoyés car la configuration SMTP est manquante.

## ✅ Solutions Professionnelles Recommandées

> [!TIP]
> **Pour une application en production, utilisez un service email professionnel.**
> C'est gratuit, plus fiable, et vous aurez des analytics!

### Option 1: Brevo (ex-Sendinblue) ⭐ RECOMMANDÉ

**Pourquoi Brevo:**
- ✅ **300 emails/jour GRATUITS**
- ✅ Interface en français
- ✅ Très simple à configurer
- ✅ Analytics inclus
- ✅ Templates d'emails

**Configuration en 5 minutes:**

1. **Inscription:** https://www.brevo.com/fr/ (Gratuit)
2. **Allez dans:** Settings → SMTP & API
3. **Créez une clé SMTP** (un bouton)
4. **Copiez les informations affichées**

Ajoutez dans votre `.env`:
```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre-email@brevo.com
SMTP_PASS=votre-smtp-key-brevo
NEXT_PUBLIC_URL=https://www.achrilik.com
```

### Option 2: SendGrid (Alternative)

**Pourquoi SendGrid:**
- ✅ **100 emails/jour gratuits**
- ✅ Très populaire (utilisé par Uber, Airbnb)
- ✅ Excellente délivrabilité
- ✅ API moderne

**Configuration:**

1. **Inscription:** https://sendgrid.com/free/
2. **Créez une API Key:** Settings → API Keys → Create API Key
3. **Copiez la clé** (elle commence par "SG.")

Ajoutez dans votre `.env`:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.votre-api-key-ici
NEXT_PUBLIC_URL=https://www.achrilik.com
```

### Option 3: Resend (Moderne)

**Pourquoi Resend:**
- ✅ **100 emails/jour gratuits**
- ✅ Interface très moderne
- ✅ API simple
- ✅ Parfait pour développeurs

**Configuration:**

1. **Inscription:** https://resend.com/signup
2. **Créez une API Key**
3. **Configurez votre domaine** (optionnel mais recommandé)

Ajoutez dans votre `.env`:
```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_votre-api-key
NEXT_PUBLIC_URL=https://www.achrilik.com
```

---

## 🚀 Après Configuration

Une fois SMTP configuré, les emails suivants seront automatiquement envoyés:

1. ✉️ **Bienvenue** - À chaque inscription
2. ✉️ **Confirmation de commande** - Au client après achat
3. ✉️ **Notification vendeur** - Au vendeur après vente
4. ✉️ **Mot de passe oublié** - Pour réinitialisation

### 🚀 Déploiement Vercel

N'oubliez pas d'ajouter les mêmes variables dans:
Vercel Dashboard → Settings → Environment Variables

---

**Temps estimé:** 10 minutes  
**Importance:** CRITIQUE  
**Difficulté:** Facile
