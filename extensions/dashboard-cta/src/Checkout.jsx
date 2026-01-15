import {
  reactExtension,
  Button,
  Banner,
  BlockStack,
  Text,
  Heading,
  Link,
  useApi,
  Divider,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.thank-you.block.render", () => <App />);

function App() {
  const api = useApi();
  const SUPPORT_EMAIL = "support@leparfum.ai";
  const BASE_URL =
    "https://staging.scentwork.leparfum.ai/pre-scentwork/dashboard";

  let childJourneyId = null;

  // Acceso a los atributos de ORDEN (donde se encuentran 'journey' y 'dashboard_id')
  const attributesArray = api.attributes?.current;

  // --- Lógica de Extracción del ID (Usando el atributo SIMPLE y confiable) ---
  if (Array.isArray(attributesArray)) {
    // 1. Buscar la clave 'dashboard_id'
    const dashboardAttribute = attributesArray.find(
      (a) => a.key === "dashboard_id"
    );

    if (dashboardAttribute && dashboardAttribute.value) {
      // 2. Usar el valor directamente, ya que es un string simple y limpio.
      childJourneyId = dashboardAttribute.value;
    } else {
      // --- Lógica de FALLBACK: Intentar el JSON complejo (por si 'dashboard_id' no está) ---
      const journeyAttribute = attributesArray.find((a) => a.key === "journey");
      if (journeyAttribute && journeyAttribute.value) {
        try {
          const journeyData = JSON.parse(journeyAttribute.value);
          if (journeyData && journeyData.conversation_id) {
            childJourneyId = journeyData.conversation_id;
          }
        } catch (e) {
          // Fallo de JSON, childJourneyId sigue siendo null.
        }
      }
    }
  }

  if (childJourneyId) {
    // CASO 1: ÉXITO - ID ENCONTRADO, MOSTRAR BOTÓN DE REDIRECCIÓN
    
    // Check if this is a gift order
    let isGiftOrder = false;
    if (Array.isArray(attributesArray)) {
      const journeyAttribute = attributesArray.find((a) => a.key === "journey");
      if (journeyAttribute && journeyAttribute.value) {
        try {
          const journeyData = JSON.parse(journeyAttribute.value);
          isGiftOrder = journeyData.orderType === 'gift';
        } catch (e) {
          // JSON parse failed, not a gift order
        }
      }
    }

    // Set target URL and button text based on order type
    const targetUrl = isGiftOrder
      ? `https://gift.leparfum.ai/share?journey_id=${encodeURIComponent(childJourneyId)}`
      : `${BASE_URL}?child_journey_id=${encodeURIComponent(childJourneyId)}`;
    
    const buttonText = isGiftOrder 
      ? "Share your gift" 
      : "Back to your dashboard";

    return (
      <BlockStack
        padding={["loose", "none", "loose", "none"]}
        spacing="base"
        inlineAlignment="stretch"
      >
        <Heading level="1">Next Step:</Heading>
        <Button
          to={targetUrl}
          id="back-to-dashboard-btn"
          appearance="critical"
          kind="primary"
        >
          {buttonText}
        </Button>
        <Divider />
        <Text padding={["none", "none", "loose", "none"]} visibility="hidden">
          &nbsp;
        </Text>
      </BlockStack>
    );
  } else {
    // CASO 2: FALLBACK - ID NO ENCONTRADO, MOSTRAR MENSAJE DE SOPORTE
    return (
      <Banner status="success" title="Thank You">
        <BlockStack>
          <Text>
            Thank you for completing your purchase. Please check your text
            messages for a link to your dashboard. Any issues please contact{" "}
            <Link to={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>.
          </Text>
        </BlockStack>
        <Text padding={["none", "none", "loose", "none"]} visibility="hidden">
          &nbsp;
        </Text>
      </Banner>
    );
  }
}
