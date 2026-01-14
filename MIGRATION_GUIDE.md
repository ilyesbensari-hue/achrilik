# Guide de Migration : SQLite vers PostgreSQL (Pour Vercel)

Pour mettre votre site en ligne sur **Vercel**, vous devez remplacer la base de données locale (SQLite) par une base en ligne (PostgreSQL).

## Étape 1 : Créer la base de données (Gratuit)
1. Allez sur [Neon.tech](https://neon.tech) et créez un compte.
2. Créez un nouveau projet (nommez-le `achrilik`).
3. Copiez la **Connection String** (elle ressemble à `postgres://user:password@...`).

## Étape 2 : Configurer Vercel
1. Allez sur le tableau de bord de votre projet sur Vercel.
2. Allez dans **Settings > Environment Variables**.
3. Ajoutez une nouvelle variable :
   - **Key** : `DATABASE_URL`
   - **Value** : (Collez la Connection String de Neon ici)

## Étape 3 : Mettre à jour le code (JUSTE AVANT de faire le "git push")
Ouvrez le fichier `prisma/schema.prisma` et modifiez ces lignes :

```prisma
datasource db {
  provider = "postgresql" // REMPLACEZ "sqlite" PAR "postgresql"
  url      = env("DATABASE_URL")
}
```

## Étape 4 : Déployer
1. Ouvrez votre terminal.
2. Tapez : `npx prisma db push` (Cela va créer les tables dans votre nouvelle base Neon).
3. Faites votre `git add .`, `git commit -m "Migration prod"`, et `git push`.

Vercel va détecter le changement et redéployer votre site avec la nouvelle base de données !

> **Note** : En local, si vous voulez continuer à travailler, vous devrez soit utiliser la même base Neon (en mettant la `DATABASE_URL` dans votre `.env`), soit revenir à SQLite temporairement. Le plus simple est d'utiliser Neon même en local pour être iso-prod. (Dans ce cas, mettez à jour votre `.env` local avec la même URL Neon).
