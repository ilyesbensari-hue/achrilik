# 🧪 Guide de Test Manuel - Achrilik Responsive

**Date:** 2026-02-03
**URL:** http://localhost:3000
**Durée estimée:** 15 minutes

---

## ⚡ Quick Start

### 1. Ouvrir le Site
```bash
# Si le serveur n'est pas déjà lancé:
cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop
npm run dev

# Ouvrir http://localhost:3000 dans Chrome
```

### 2. Activer Responsive Mode
- **Chrome:** `Cmd + Shift + M` (Mac) ou `Ctrl + Shift + M` (Windows)
- Ou: DevTools → Toggle Device Toolbar (icône mobile/tablet)

---

## 📱 Test 1: Mobile (iPhone SE - 375×667)

### Configuration
1. Chrome DevTools → Responsive Mode
2. Sélectionner "iPhone SE" dans le dropdown
3. Vérifier dimensions: **375 × 667**
4. Rafraîchir la page: `Cmd + R`
5. Hard refresh si layout bizarre: `Cmd + Shift + R`

### ✅ Checklist Mobile

| # | Critère | Attendu | ✓ |
|---|---------|---------|---|
| 1 | Layout mobile natif affiché | PAS de layout desktop | [ ] |
| 2 | Hero Banner height | ~400px | [ ] |
| 3 | Category circles | Scroll horizontal, 64×64px | [ ] |
| 4 | Products | Carousel horizontal | [ ] |
| 5 | BottomNav | Visible en bas (sticky) | [ ] |
| 6 | Navbar | Simplifié (Logo + Search + Cart) | [ ] |
| 7 | Scroll horizontal | AUCUN | [ ] |
| 8 | Touch targets | Tous ≥44×44px | [ ] |

### 🔍 Comment Vérifier

**Hero Banner Height:**
1. Right-click sur le hero banner → Inspect
2. Dans l'onglet "Computed" → filter "height"
3. Devrait afficher ~400px

**Scroll Horizontal:**
1. Essayer de scroller horizontalement
2. Ne devrait PAS pouvoir scroller (sauf category circles)

**Screenshot:** Prendre une capture d'écran de la page complète

---

## 📱 Test 2: Tablet (iPad - 768×1024)

### Configuration
1. DevTools → Sélectionner "iPad"
2. Vérifier dimensions: **768 × 1024**
3. Rafraîchir: `Cmd + R`

### ✅ Checklist Tablet

| # | Critère | Attendu | ✓ |
|---|---------|---------|---|
| 1 | Hero Banner height | ~500px | [ ] |
| 2 | Category circles | Grid 6 colonnes, 80×80px | [ ] |
| 3 | Products | Grid 3 colonnes | [ ] |
| 4 | BottomNav | MASQUÉ | [ ] |
| 5 | Navbar | Complet avec dropdowns | [ ] |
| 6 | Section titles | ~24px font | [ ] |

### 🔍 Comment Vérifier

**Grid Colonnes:**
1. Compter visuellement les produits par ligne
2. Devrait voir 3 produits côte à côte

**BottomNav Masqué:**
1. Scroller en bas de page
2. Ne devrait PAS voir la bottom nav fixe

**Screenshot:** Capture de la homepage

---

## 💻 Test 3: Desktop (1920×1080)

### Configuration
1. DevTools → Responsive → Dropdown → "Responsive"
2. Entrer manuellement: **1920 × 1080**
3. Rafraîchir: `Cmd + R`

### ✅ Checklist Desktop

| # | Critère | Attendu | ✓ |
|---|---------|---------|---|
| 1 | Hero Banner height | ~600px | [ ] |
| 2 | Category circles | Grid 9 colonnes, 96×96px | [ ] |
| 3 | Products | Grid 5 colonnes | [ ] |
| 4 | Section titles | ~30-36px font | [ ] |
| 5 | Spacing | Généreux (gap ~24-32px) | [ ] |
| 6 | BottomNav | MASQUÉ | [ ] |
| 7 | Navbar complet | Logo + Catégories + Search + User + Wishlist + Cart | [ ] |
| 8 | Categories dropdown | Fonctionne au hover | [ ] |
| 9 | User dropdown | Fonctionne au hover (si connecté) | [ ] |

### 🔍 Comment Vérifier

**Hero Height:**
1. Inspect → Computed → height
2. Devrait être ~600px

**Grid 5 Colonnes:**
1. Compter les produits par ligne
2. Devrait voir 5 produits

**Dropdowns:**
1. Hover sur "Catégories" → menu devrait apparaître
2. Si connecté: hover sur user avatar → menu devrait apparaître

**Screenshot:** Capture fullscreen de la homepage

---

## 🖥️ Test 4: Large Desktop (2560×1440)

### Configuration
1. DevTools → Responsive
2. Entrer: **2560 × 1440**
3. Rafraîchir: `Cmd + R`

### ✅ Checklist Large Desktop

| # | Critère | Attendu | ✓ |
|---|---------|---------|---|
| 1 | Hero Banner | 600px, centré | [ ] |
| 2 | Products | Grid **6 COLONNES** ✨ | [ ] |
| 3 | Content width | Max 1280px (centré) | [ ] |
| 4 | No stretch | Pas de stretch excessif | [ ] |
| 5 | Spacing | Maximum (32-40px) | [ ] |

### 🔍 Comment Vérifier

**6 Colonnes (CRITIQUE):**
1. Compter les produits dans une section
2. Devrait voir **6 produits par ligne**
3. C'est le test principal de la feature 2xl

**Content Centré:**
1. Le contenu devrait être centré
2. Espaces égaux à gauche et droite

**Screenshot:** Capture montrant 6 produits par ligne

---

## 🐛 Bugs à Reporter

Si tu trouves un problème, note:
1. **Viewport exact** (ex: 375×667)
2. **Description du bug** (ex: "Layout desktop affiché")
3. **Screenshot** si possible
4. **Console errors** (F12 → Console)

### Bugs Critiques à Vérifier

| Bug | Viewport | Description | Status |
|-----|----------|-------------|--------|
| Desktop sur mobile | 375×667 | Layout desktop au lieu de mobile | Devrait être CORRIGÉ ✅ |
| Scroll horizontal | 375×667 | Peut scroller horizontalement | Devrait être CORRIGÉ ✅ |
| BottomNav desktop | 1920×1080 | BottomNav visible sur desktop | Devrait être CORRIGÉ ✅ |

---

## 📸 Screenshots à Capturer

Pour chaque viewport, prendre une screenshot:

1. **Mobile (375×667)**
   - Nom: `mobile-375x667.png`
   - Montrer: Hero + Categories + 1 section produits + BottomNav

2. **Tablet (768×1024)**
   - Nom: `tablet-768x1024.png`
   - Montrer: Hero + Categories grid + Products grid 3col

3. **Desktop (1920×1080)**
   - Nom: `desktop-1920x1080.png`
   - Montrer: Full page avec navbar + hero + products 5col

4. **Large (2560×1440)**
   - Nom: `large-2560x1440.png`
   - Montrer: Products **6 colonnes** (IMPORTANT)

---

## ✅ Validation Finale

### Tous les tests passent?
- [ ] Mobile natif (pas desktop forcé)
- [ ] Hero heights responsive (400 → 500 → 600px)
- [ ] Products grid responsive (1 → 3 → 5 → 6 col)
- [ ] BottomNav mobile only
- [ ] Aucun scroll horizontal mobile
- [ ] Dropdowns fonctionnels desktop

### Score Attendu: 6/6 ✅

Si tous les critères passent → **PRÊT POUR DÉPLOIEMENT** 🚀

---

## 🚀 Après Validation

### Deploiement
```bash
# 1. Commit
git add .
git commit -m "fix(mobile): add viewport meta + desktop optimizations"

# 2. Push
git push origin main

# 3. Vercel auto-deploy (ou manual)
vercel --prod
```

### Monitoring
- [ ] Vérifier Vercel deployment successful
- [ ] Tester sur production URL
- [ ] Monitorer analytics (conversions, bounce rate)

---

## 💡 Tips

### Hard Refresh
Si le layout semble bizarre:
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

### Clear Cache
Si problèmes persistent:
1. Chrome Settings → Privacy → Clear browsing data
2. Check "Cached images and files"
3. Clear data
4. Refresh

### Console Errors
Toujours check console (F12) pour errors JavaScript

---

**Bon test! 🧪**

Si tout passe → Deployment ready 🚀  
Si bugs trouvés → Reporter dans conversation 💬
