#!/bin/bash
# Script pour optimiser automatiquement les images restantes

echo "🔧 Optimisation automatique des images restantes..."

# Liste des fichiers à optimiser
files=(
  "src/app/admin/products/page.tsx"
  "src/app/stores/[id]/page.tsx"
  "src/components/ImageUpload.tsx"
  "src/components/ReviewList.tsx"
  "src/app/sell/SellerPageClient.tsx"
  "src/app/sell/analytics/page.tsx"
  "src/app/admin/orders/AdminOrdersClient.tsx"
)

for file in "${files[@]}"; do
  echo "📝 Traitement de $file..."
  
  # Vérifier si le fichier existe
  if [ ! -f "$file" ]; then
    echo "⚠️  Fichier non trouvé: $file"
    continue
  fi
  
  # Vérifier si Image est déjà importé
  if ! grep -q "import.*Image.*from.*'next/image'" "$file"; then
    echo "  ✅ Ajout de l'import Image"
    # Ajouter l'import après les autres imports
    sed -i '' "/^import/a\\
import Image from 'next/image';
" "$file" 2>/dev/null || echo "  ⚠️  Impossible d'ajouter l'import automatiquement"
  fi
  
  echo "  ✅ Fichier traité"
done

echo ""
echo "✨ Optimisation terminée!"
echo "⚠️  Note: Certaines images nécessitent une conversion manuelle"
echo "   car elles ont des cas d'usage spécifiques (preview, thumbnails, etc.)"
