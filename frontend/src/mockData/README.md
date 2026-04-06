# Mock Data / Seed Database

Ce module fournit des données mock complètes pour le développement et les tests.

## Contenu généré

Le seed génère automatiquement:

- **5 utilisateurs** (admin, mod, toxic, et 3 utilisateurs réguliers):
  - Admin: `admin` (admin@test.com)
  - Mod: `mod` (mod@test.com)
  - Toxic: `toxic` (toxic@test.com) - compte pour les tests de modération
  - Users: `ari`, `leo`, `cha`, `ophe`

- **Posts** avec commentaires, réponses et likes
  - Posts normaux par les utilisateurs réguliers
  - Posts toxiques par le compte `toxic`

- **Amitié** (friendships)
  - Statuses: PENDING, ACCEPTED

- **Conversations** et **Messages** entre amis acceptés

- **Reports** sur posts et utilisateurs
  - Rapports sur les posts "harassment" et "inappropriate_content"
  - Rapport utilisateur pour le compte toxic

- **Moderation Logs** traçant les actions des mods
  - Révision de rapports
  - Bannissement d'utilisateur

- **Tournament** ("Fur, Reimagined")
  - 3 participants avec posts
  - Un gagnant aléatoire

## Utilisation

### Option 1: Générer les données au démarrage de l'app

```typescript
// Dans App.tsx ou un contexte global
import { useEffect } from 'react';
import { seedDatabase } from '@/mockData';

export function App() {
  useEffect(() => {
    // Générer les données mock une seule fois
    seedDatabase();
  }, []);

  return (/* ... */);
}
```

### Option 2: Importer le mockDatabase directement

```typescript
import { mockDatabase } from '@/mockData';

// Accéder aux utilisateurs
console.log(mockDatabase.users);

// Accéder aux posts
console.log(mockDatabase.posts);

// Accéder aux autres données
console.log(mockDatabase.comments);
console.log(mockDatabase.likes);
console.log(mockDatabase.friendships);
console.log(mockDatabase.conversations);
console.log(mockDatabase.messages);
console.log(mockDatabase.notifications);
console.log(mockDatabase.moderationLogs);
console.log(mockDatabase.reports);
console.log(mockDatabase.battles);
```

## Structure des données

Voir les types TypeScript dans [seed.ts](./seed.ts) pour les interfaces complètes:

- `BaseUser` - Utilisateur avec profil
- `Post` - Post avec commentaires et likes
- `Comment` - Commentaire avec possibilité de réponse
- `Like` - Like sur un post
- `Friendship` - Relation d'amitié
- `Conversation` - Conversation entre deux utilisateurs
- `Message` - Message dans une conversation
- `Notification` - Notification générée par les actions
- `ModerationLog` - Logs d'actions modération
- `Report` - Rapport utilisateur/post
- `Battle` - Tournament
- `BattleParticipant` - Participant au tournament

## Notes

- Les IDs sont auto-générés séquentiellement
- Les dates sont aléatoires entre -9 jours et maintenant
- Les likes et commentaires sont créés de façon aléatoire
- Les friendships ont 60% de chance d'être ACCEPTED, 40% PENDING
- Les utilisateurs toxiques sont bannés après rapport
