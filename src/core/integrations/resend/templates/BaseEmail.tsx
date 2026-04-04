import { Html, Head, Body, Container, Text } from "@react-email/components";

type BaseEmailProps = {
  previewText: string;
  children: React.ReactNode;
};

export function BaseEmail({ previewText, children }: BaseEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        {/* Preheader */}
        <Text style={preheader}>{previewText}</Text>

        <Container style={container}>{children}</Container>
      </Body>
    </Html>
  );
}

const body = {
  margin: 0,
  padding: 0,
  backgroundColor: "#f5f7f6",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: "#333333",
};

const container = {
  backgroundColor: "#ffffff",
  width: "700px",
  padding: "24px",
};

const preheader = {
  display: "none",
  overflow: "hidden",
  lineHeight: "1px",
  opacity: 0,
  maxHeight: 0,
  maxWidth: 0,
};
