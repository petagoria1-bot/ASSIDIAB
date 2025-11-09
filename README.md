# Diab'Assis T1

An offline-first Progressive Web App to help parents of children with Type 1 Diabetes manage insulin doses, track meals, and monitor blood glucose levels. It includes a dose calculator, a logbook, and emergency protocols.

---

> [!CAUTION]
> **ACTION REQUISE CRITIQUE : CONFIGURATION ET DÉPLOIEMENT DE FIREBASE**
> 
> **NE PAS IGNORER CETTE ÉTAPE.** L'application **NE FONCTIONNERA PAS** sans une configuration correcte de Firebase. Des erreurs critiques de permission (`permission-denied`) bloqueront toutes les fonctionnalités si les étapes ci-dessous ne sont pas suivies.
>
> ### 1. Installation des dépendances pour les Cloud Functions
> Avant de déployer, vous devez installer les dépendances nécessaires pour les fonctions backend. Naviguez dans le dossier `functions` et exécutez :
> ```bash
> cd functions
> npm install
> cd ..
> ```
>
> ### 2. Déploiement complet sur Firebase
> Vous devez impérativement déployer les règles de sécurité, les index de base de données, et les cloud functions sur votre projet Firebase. Exécutez la commande suivante à la racine de votre projet :
>
> ```bash
> firebase deploy
> ```
>
> Cette commande va :
> - Déployer les règles de sécurité de **Firestore** (depuis `firestore.rules`).
> - Déployer les index de **Firestore** (depuis `firestore.indexes.json`).
> - Déployer les règles de sécurité de **Cloud Storage** (depuis `storage.rules`).
> - Compiler et déployer les **Cloud Functions** (depuis le dossier `functions`).
>
> **La création des index peut prendre plusieurs minutes.** Si des erreurs de permission persistent après le déploiement, patientez quelques instants et rafraîchissez la page.

---

## Dépannage
Si vous rencontrez toujours des erreurs de "permission denied" après le déploiement :
1.  **Patientez (encore) :** La propagation des règles et la création des index ne sont pas toujours instantanées.
2.  **Vérifiez votre fichier `firebase.json`:** Assurez-vous qu'il pointe correctement vers les fichiers de règles, d'index et le dossier des fonctions.
3.  **Consultez la console Firebase :** 
    - Allez dans votre projet sur la console Firebase. 
    - Sous "Firestore Database" -> "Règles", vous devriez voir le contenu de `firestore.rules`. 
    - Sous "Index", vous devriez voir vos index avec le statut "Activé".
    - Sous "Functions", vous devriez voir les fonctions (`onAuthUserCreate`, `createInvitation`, etc.) listées.

---

## Scripts de Maintenance

Des scripts utiles se trouvent dans le dossier `/scripts` pour vous aider pendant le développement.

### Purger les utilisateurs d'authentification
Pour supprimer **tous** les utilisateurs de Firebase Authentication (utile pour repartir de zéro).
```bash
# Assurez-vous d'avoir un fichier de clé de service
node scripts/delete-auth-users.js /chemin/vers/votre/serviceAccountKey.json
```

### Remplir la base de données (Seeding)
Pour injecter des données de test (un patient, un médecin, des entrées de journal).
```bash
# Assurez-vous d'avoir un fichier de clé de service
node scripts/seed.js /chemin/vers/votre/serviceAccountKey.json
```

---

## Architecture Backend

- **Authentication**: Gère l'identité des utilisateurs. La fonction `onAuthUserCreate` crée automatiquement un profil de base dans Firestore pour chaque nouvel inscrit.
- **Firestore**: Base de données NoSQL pour toutes les données de l'application, sécurisée par des règles granulaires.
- **Cloud Functions**: Logique backend pour les actions sensibles (création d'invitations, réponse) et les tâches automatisées.
- **Cloud Storage**: Stockage de fichiers sécurisé pour les futurs rapports PDF et autres téléversements.