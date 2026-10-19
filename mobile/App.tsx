import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { RegisterPhoneScreen } from "./src/screens/RegisterPhoneScreen";
import { RegisterSmsScreen } from "./src/screens/RegisterSmsScreen";
import { RegisterConsentScreen } from "./src/screens/RegisterConsentScreen";
import { ConsentDocumentScreen } from "./src/screens/ConsentDocumentScreen";
import { RegisterDoctorScreen } from "./src/screens/RegisterDoctorScreen";
import { QrScanScreen } from "./src/screens/QrScanScreen";

type Screen =
  | "welcome"
  | "registerPhone"
  | "registerSms"
  | "registerConsent"
  | "consentDocument"
  | "registerDoctor"
  | "qrScan";

function extractInviteCode(raw: string): string {
  const text = raw.trim();
  const match = text.match(/[A-Z]{2,}-\d{3,}/i);
  return (match?.[0] ?? text).toUpperCase();
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [phone, setPhone] = useState("+7 916 123-45-67");
  const [inviteCode, setInviteCode] = useState("RAV-2741");

  return (
    <SafeAreaProvider>
      {screen === "welcome" && (
        <WelcomeScreen
          onStart={() => setScreen("registerPhone")}
          onLogin={() => setScreen("registerPhone")}
        />
      )}

      {screen === "registerPhone" && (
        <RegisterPhoneScreen
          onBack={() => setScreen("welcome")}
          onContinue={(nextPhone) => {
            setPhone(nextPhone);
            setScreen("registerSms");
          }}
        />
      )}

      {screen === "registerSms" && (
        <RegisterSmsScreen
          phone={phone}
          onBack={() => setScreen("registerPhone")}
          onChangePhone={() => setScreen("registerPhone")}
          onConfirm={() => setScreen("registerConsent")}
        />
      )}

      {screen === "registerConsent" && (
        <RegisterConsentScreen
          onBack={() => setScreen("registerSms")}
          onReadDocument={() => setScreen("consentDocument")}
          onContinue={() => setScreen("registerDoctor")}
        />
      )}

      {screen === "consentDocument" && (
        <ConsentDocumentScreen
          onBack={() => setScreen("registerConsent")}
          onDone={() => setScreen("registerConsent")}
        />
      )}

      {screen === "registerDoctor" && (
        <RegisterDoctorScreen
          initialCode={inviteCode}
          onBack={() => setScreen("registerConsent")}
          onScanQr={() => setScreen("qrScan")}
          onFindDoctor={(code) => {
            setInviteCode(code);
            // TODO: step 4
          }}
          onSkip={() => {
            // TODO: step 4 without doctor
          }}
        />
      )}

      {screen === "qrScan" && (
        <QrScanScreen
          onClose={() => setScreen("registerDoctor")}
          onManualEntry={() => setScreen("registerDoctor")}
          onScanned={(data) => {
            setInviteCode(extractInviteCode(data));
            setScreen("registerDoctor");
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
