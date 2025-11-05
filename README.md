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
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
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
