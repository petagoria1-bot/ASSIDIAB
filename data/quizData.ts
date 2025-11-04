export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
}

export const quizData: QuizQuestion[] = [
    {
        question: "Lequel de ces symptômes est typique d'une hypoglycémie ?",
        options: ["Soif intense", "Étourdissements et faiblesse", "Envie fréquente d'uriner"],
        correctAnswerIndex: 1,
        explanation: "L'hypoglycémie (manque de sucre) provoque des tremblements, des sueurs, une faiblesse et des étourdissements. La soif et l'envie d'uriner sont des signes d'hyperglycémie."
    },
    {
        question: "Pour corriger une hypoglycémie, on donne généralement 15g de sucre. Cela équivaut à :",
        options: ["Un grand verre de soda", "3 morceaux de sucre", "Une pomme entière"],
        correctAnswerIndex: 1,
        explanation: "3 morceaux de sucre (5g chacun) ou une petite brique de jus de fruits représentent environ 15g de glucides à action rapide, idéal pour remonter la glycémie."
    },
    {
        question: "À quelle fréquence est-il recommandé de changer un cathéter de pompe à insuline ?",
        options: ["Tous les jours", "Tous les 2 à 3 jours", "Toutes les semaines"],
        correctAnswerIndex: 1,
        explanation: "Changer le site d'infusion tous les 2 à 3 jours est crucial pour assurer une bonne absorption de l'insuline et prévenir les infections ou les lipodystrophies."
    },
    {
        question: "Quel type d'aliment a l'impact le plus LENT sur la glycémie ?",
        options: ["Bonbons", "Pain blanc", "Lentilles"],
        correctAnswerIndex: 2,
        explanation: "Les lentilles, riches en fibres et en protéines, sont des glucides complexes. Leur digestion est plus lente, ce qui entraîne une augmentation progressive de la glycémie."
    },
    {
        question: "Que signifie 'l'acétone' (ou corps cétoniques) dans le sang ou les urines ?",
        options: ["Un excès de sucre dans le corps", "Un manque important d'insuline", "Une bonne hydratation"],
        correctAnswerIndex: 1,
        explanation: "La présence de cétones indique que le corps manque d'insuline et commence à brûler les graisses pour obtenir de l'énergie. C'est un signe d'alerte qui nécessite une action rapide."
    },
    {
        question: "Après une injection de correction pour hyperglycémie, combien de temps faut-il attendre avant de re-contrôler/re-corriger ?",
        options: ["30 minutes", "1 heure", "Au moins 2-3 heures"],
        correctAnswerIndex: 2,
        explanation: "L'insuline rapide met du temps à agir pleinement. Il faut attendre au moins le délai défini dans le PAI (souvent 2-3h) pour éviter le 'stacking' d'insuline et le risque d'hypoglycémie."
    },
    {
        question: "Quel est le principal avantage de compter les glucides 'nets' (totaux - fibres) ?",
        options: ["C'est plus facile à calculer", "C'est plus précis car les fibres impactent peu la glycémie", "Cela permet de manger plus"],
        correctAnswerIndex: 1,
        explanation: "Les fibres ne sont pas digérées de la même manière que les autres glucides et n'élèvent que très peu la glycémie. Le calcul en nets est donc souvent plus juste."
    }
];
