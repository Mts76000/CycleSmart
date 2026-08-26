import { Section, Text } from "react-email";
import { BaseEmail } from "./base-template";

interface NewSignupEmailProps {
  userEmail: string;
  userName?: string;
  signedUpAt: string;
  projectName: string;
}

export function NewSignupEmail({
  userEmail,
  userName,
  signedUpAt,
  projectName,
}: NewSignupEmailProps) {
  return (
    <BaseEmail
      previewText={`Nouvelle inscription sur ${projectName}`}
      title="Nouvelle inscription"
      actionUrl="https://cycle-smart.mathis-lamotte.fr"
      actionLabel="Voir le site"
    >
      <Section>
        <Text style={{ color: "#44403c", fontSize: "16px", lineHeight: "1.5" }}>
          Un nouvel utilisateur vient de s&apos;inscrire sur <strong>{projectName}</strong>.
        </Text>
        <Text style={{ color: "#44403c", fontSize: "16px", lineHeight: "1.5" }}>
          <strong>Email :</strong> {userEmail}
        </Text>
        {userName ? (
          <Text style={{ color: "#44403c", fontSize: "16px", lineHeight: "1.5" }}>
            <strong>Nom :</strong> {userName}
          </Text>
        ) : null}
        <Text style={{ color: "#44403c", fontSize: "16px", lineHeight: "1.5" }}>
          <strong>Date d&apos;inscription :</strong> {signedUpAt}
        </Text>
      </Section>
    </BaseEmail>
  );
}
