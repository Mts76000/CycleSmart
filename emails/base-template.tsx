import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

interface BaseEmailProps {
  previewText: string;
  title: string;
  children: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
}

export function BaseEmail({ previewText, title, children, actionUrl, actionLabel }: BaseEmailProps) {
  return (
    <Html lang="fr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f5f5f4",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Section
            style={{
              backgroundColor: "#047857",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 800,
                margin: 0,
              }}
            >
              CycleSmart
            </Text>
          </Section>

          <Section style={{ padding: "32px" }}>
            <Text
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#292524",
                margin: "0 0 16px",
              }}
            >
              {title}
            </Text>

            {children}

            {actionUrl && actionLabel && (
              <Section style={{ textAlign: "center", paddingTop: "16px" }}>
                <Button
                  href={actionUrl}
                  style={{
                    backgroundColor: "#047857",
                    color: "#ffffff",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  {actionLabel}
                </Button>
              </Section>
            )}
          </Section>

          <Hr style={{ borderColor: "#e7e5e4", margin: "0 32px" }} />

          <Section style={{ padding: "24px 32px" }}>
            <Text
              style={{
                fontSize: "12px",
                color: "#78716c",
                margin: 0,
                textAlign: "center",
              }}
            >
              CycleSmart — Heures creuses —{" "}
              <Link
                href="https://cycle-smart.mathis-lamotte.fr"
                style={{ color: "#047857" }}
              >
                cycle-smart.mathis-lamotte.fr
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
