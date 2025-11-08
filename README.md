# DiabAssis

An offline-first Progressive Web App to help parents of children with Type 1 Diabetes manage insulin doses, track meals, and monitor blood glucose levels. It includes a dose calculator, a logbook, and emergency protocols.

---

> [!CAUTION]
> **ACTION REQUISE CRITIQUE : CONFIGURATION DE FIREBASE**
> 
> **NE PAS IGNORER CETTE ÉTAPE.** L'application **NE FONCTIONNERA PAS** sans une configuration correcte de Firebase. Des erreurs critiques de permission (`permission-denied`) bloqueront toutes les fonctionnalités si les étapes ci-dessous ne sont pas suivies.
>
> Vous devez impérativement déployer les règles de sécurité et les index de base de données fournis dans votre projet Firebase.
>
> 1.  **Déployer les règles de sécurité :**
>     ```bash
>     firebase deploy --only firestore:rules
>     ```
> 2.  **Déployer les index :**
>     ```bash
>     firebase deploy --only firestore:indexes
>     ```
>
> **La création des index peut prendre plusieurs minutes.** Si des erreurs persistent, patientez et rafraîchissez la page.

---

## Dépannage
Si vous rencontrez toujours des erreurs de "permission denied" après le déploiement :
1.  **Patientez quelques minutes :** La création des index n'est pas instantanée.
2.  **Vérifiez votre fichier `firebase.json`:** Assurez-vous qu'un fichier `firebase.json` existe à la racine de votre projet et que son contenu pointe correctement vers les fichiers de règles et d'index. Il doit ressembler à ceci :
    ```json
    {
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      }
    }
    ```
3.  **Vérifiez le déploiement dans la console Firebase :** Allez dans votre projet sur la console Firebase. Sous "Firestore Database" -> "Règles", vous devriez voir le contenu de `firestore.rules`. Sous "Index", vous devriez voir vos index en cours de création ou avec le statut "Activé".

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