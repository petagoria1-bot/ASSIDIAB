# DiabAssis

An offline-first Progressive Web App to help parents of children with Type 1 Diabetes manage insulin doses, track meals, and monitor blood glucose levels. It includes a dose calculator, a logbook, and emergency protocols.

## Firebase Setup (CRITICAL)

This project uses Firebase for authentication and data storage (Firestore). For the application to function correctly, you **must** deploy the provided security rules and database indexes to your Firebase project.

**Failing to complete these steps will result in `permission-denied` errors and prevent the app from loading or saving data.**

You will need the [Firebase CLI](https://firebase.google.com/docs/cli) installed and authenticated with your Google account.

### 1. Deploy Firestore Security Rules

The `firestore.rules` file contains essential security rules to protect user data while allowing the application's features to work.

To deploy the rules, run the following command from your project's root directory:
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Firestore Indexes

The application performs several complex queries that require composite indexes in Firestore. The `firestore.indexes.json` file defines these indexes.

To deploy the indexes, run the following command:
```bash
firebase deploy --only firestore:indexes
```
> **Note:** It may take several minutes for Firebase to build the indexes after you deploy them.

### Troubleshooting
If you still see "permission denied" or "missing or insufficient permissions" errors after deploying:
1.  **Wait a few minutes:** Index creation is not instantaneous.
2.  **Check your `firebase.json` file:** Ensure that a `firebase.json` file exists in your root directory and that its content correctly points to the rules and indexes files. It should look like this:
    ```json
    {
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      }
    }
    ```
3.  **Verify Deployment:** Go to your Firebase project in the console. Under "Firestore Database" -> "Rules", you should see the content of `firestore.rules`. Under "Indexes", you should see your indexes being built or in an "Enabled" state.

---

# Diab Time Icons

Pack d'icônes vectorielles "time-of-day" pour applications, au style monoline et épuré.

## Utilisation

Toutes les icônes sont au format SVG 256x256, conçues avec un `stroke="currentColor"`. Elles hériteront de la couleur du texte environnant.

### Intégration HTML (`<img>`)

```html
<img src="path/to/sunrise.svg" alt="Lever du soleil" width="48" height="48" style="color: #10B981;">
```

### Intégration HTML (SVG en ligne)

Copiez-collez le contenu du fichier SVG directement dans votre HTML. Cela permet une personnalisation CSS plus avancée.

```html
<div style="color: #008A68; width: 48px; height: 48px;">
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <!-- Contenu de l'icône -->
    <path d="M32 192 L 224 192" />
    <path d="M80 192 A 48 48 0 0 1 176 192" />
    <line x1="128" y1="144" x2="128" y2="120" />
    <line x1="96.5" y1="163.5" x2="84" y2="151" />
    <line x1="159.5" y1="163.5" x2="172" y2="151" />
  </svg>
</div>
```

### Personnalisation CSS

```css
.icon {
  width: 32px;
  height: 32px;
  color: #EF4444; /* La couleur que vous souhaitez */
}

.icon svg {
  stroke-width: 10; /* Ajuster l'épaisseur du trait si besoin */
}
```

## Licence

Ce pack d'icônes est distribué sous la licence [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).