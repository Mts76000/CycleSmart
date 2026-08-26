export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "Quelles sont les heures creuses et pourquoi en parle-t-on autant ?",
    answer:
      "Les heures creuses sont les plages horaires où le prix du kWh est réduit avec un tarif heures creuses / heures pleines. En général, elles se situent la nuit et parfois en milieu de journée. Profiter de ces plages pour lancer son lave-linge, sa machine à laver la vaisselle ou son sèche-linge permet d'économiser sur sa facture d'électricité.",
  },
  {
    question: "Comment fonctionne le calculateur d'heures creuses de CycleSmart ?",
    answer:
      "Indique la durée de cycle de ton appareil, ajoute tes plages d'heures creuses (par exemple 00h30 - 07h30 et 14h00 - 16h30), puis sélectionne le mode de calcul. CycleSmart te donne immédiatement le prochain moment idéal pour lancer ta machine, en évitant les heures pleines.",
  },
  {
    question: "Le calculateur marche-t-il avec EDF, Engie, TotalEnergies ou tout compteur Linky ?",
    answer:
      "Oui. CycleSmart se base sur les plages horaires que tu saisies, pas sur ton fournisseur. Que tu sois chez EDF, Engie, TotalEnergies ou un autre opérateur avec option heures creuses, il suffit de connaître tes plages pour obtenir une recommandation fiable.",
  },
  {
    question: "Quels appareils puisse-je programmer avec CycleSmart ?",
    answer:
      "Tous les appareils reportables : lave-linge, lave-vaisselle, sèche-linge, départ différé d'un four, d'un robot de cuisine, etc. Tu peux enregistrer différents programmes avec leur durée, leur pas de décalage et leur mode de départ pour un usage au quotidien.",
  },
  {
    question: "CycleSmart est-il gratuit et sans publicité ?",
    answer:
      "Oui, CycleSmart est 100 % gratuit, sans publicité et sans création de compte obligatoire. Tes réglages restent enregistrés en local sur ton appareil. Si tu crées un compte, ils sont synchronisés pour les retrouver partout.",
  },
];
