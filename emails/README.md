# Emails

Les templates d’emails de CycleSmart sont construits avec les composants React Email (`react-email`). Ils sont rendus côté serveur en HTML/texte avant d’être envoyés via Resend.

## Structure

- `base-template.tsx` : template de base réutilisable (en-tête, titre, contenu, pied de page, CTA optionnel).
- `new-signup.tsx` : template de notification à destination de l’admin lors d’une nouvelle inscription.

## Ajouter un nouvel email

1. Créer un composant dans `emails/<nom>.tsx`.
2. Utiliser `BaseEmail` pour l’enveloppe visuelle.
3. Exporter une fonction (pas de JSX dans les fichiers `.ts`) et utiliser `lib/email.ts`.

Exemple :

```tsx
// emails/order-confirmation.tsx
import { Text } from "react-email";
import { BaseEmail } from "./base-template";

export function OrderConfirmationEmail({ orderId }: { orderId: string }) {
  return (
    <BaseEmail
      previewText={`Commande ${orderId} confirmée`}
      title="Commande confirmée"
    >
      <Text>Ta commande <strong>{orderId}</strong> est confirmée.</Text>
    </BaseEmail>
  );
}
```

```ts
// lib/email.ts
export async function sendOrderConfirmationEmail(to: string, orderId: string) {
  await sendEmail({
    to,
    subject: `Commande ${orderId} confirmée`,
    react: OrderConfirmationEmail({ orderId }),
  });
}
```

## Contraintes email

- Préférer les styles inline et les balises fournies par React Email (`Section`, `Text`, `Button`, etc.).
- Éviter `flexbox`, `grid` ou unités modernes (vw, svh) : beaucoup de clients mail ne les supportent pas.
- Toujours fournir une version texte : `render()` produit le HTML, `toPlainText()` extrait le texte.
