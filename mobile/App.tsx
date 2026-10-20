import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { RegisterPhoneScreen } from "./src/screens/RegisterPhoneScreen";
import { RegisterSmsScreen } from "./src/screens/RegisterSmsScreen";
import { RegisterConsentScreen } from "./src/screens/RegisterConsentScreen";
import { ConsentDocumentScreen } from "./src/screens/ConsentDocumentScreen";
import { RegisterDoctorScreen } from "./src/screens/RegisterDoctorScreen";
import { RegisterDoctorConfirmScreen } from "./src/screens/RegisterDoctorConfirmScreen";
import { RegisterSurveyScreen } from "./src/screens/RegisterSurveyScreen";
import { RegisterSurveyOwnWordsScreen } from "./src/screens/RegisterSurveyOwnWordsScreen";
import {
  RegisterMedsScreen,
  type AllergyAnswer,
  type MedicationItem,
} from "./src/screens/RegisterMedsScreen";
import { RegisterAddMedScreen } from "./src/screens/RegisterAddMedScreen";
import { QrScanScreen } from "./src/screens/QrScanScreen";

type Screen =
  | "welcome"
  | "registerPhone"
  | "registerSms"
  | "registerConsent"
  | "consentDocument"
  | "registerDoctor"
  | "registerDoctorConfirm"
  | "registerSurvey"
  | "registerSurveyOwnWords"
  | "registerMeds"
  | "registerAddMed"
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
  const [surveyBack, setSurveyBack] = useState<Screen>("registerDoctor");
  const [ownWords, setOwnWords] = useState(
    "Последние месяцы постоянно тревожно, долго не могу уснуть, срываюсь на близких."
  );
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [takingNothing, setTakingNothing] = useState(true);
  const [allergy, setAllergy] = useState<AllergyAnswer>("no");

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
            setScreen("registerDoctorConfirm");
          }}
          onSkip={() => {
            setSurveyBack("registerDoctor");
            setScreen("registerSurvey");
          }}
        />
      )}

      {screen === "registerDoctorConfirm" && (
        <RegisterDoctorConfirmScreen
          onBack={() => setScreen("registerDoctor")}
          onAllow={() => {
            setSurveyBack("registerDoctorConfirm");
            setScreen("registerSurvey");
          }}
          onWrongDoctor={() => setScreen("registerDoctor")}
        />
      )}

      {screen === "registerSurvey" && (
        <RegisterSurveyScreen
          onBack={() => setScreen(surveyBack)}
          onContinue={() => setScreen("registerMeds")}
          onOwnWords={() => setScreen("registerSurveyOwnWords")}
        />
      )}

      {screen === "registerSurveyOwnWords" && (
        <RegisterSurveyOwnWordsScreen
          initialText={ownWords}
          onBack={() => setScreen("registerSurvey")}
          onSave={(text) => {
            setOwnWords(text);
            setScreen("registerSurvey");
          }}
          onRecordVoice={() => {
            // TODO: voice input
          }}
        />
      )}

      {screen === "registerMeds" && (
        <RegisterMedsScreen
          medications={medications}
          takingNothing={takingNothing}
          allergy={allergy}
          onTakingNothingChange={(value) => {
            setTakingNothing(value);
            if (value) setMedications([]);
          }}
          onAllergyChange={setAllergy}
          onRemoveMedication={(id) => {
            setMedications((prev) => {
              const next = prev.filter((m) => m.id !== id);
              if (next.length === 0) setTakingNothing(true);
              return next;
            });
          }}
          onBack={() => setScreen("registerSurvey")}
          onAddMedication={() => setScreen("registerAddMed")}
          onContinue={() => {
            // TODO: step 5
          }}
        />
      )}

      {screen === "registerAddMed" && (
        <RegisterAddMedScreen
          onBack={() => setScreen("registerMeds")}
          onAdd={(med) => {
            setMedications((prev) =>
              prev.some((m) => m.id === med.id) ? prev : [...prev, med]
            );
            setTakingNothing(false);
            setScreen("registerMeds");
          }}
          onAddManual={() => {
            // TODO: manual medication form
          }}
        />
      )}

      {screen === "qrScan" && (
        <QrScanScreen
          onClose={() => setScreen("registerDoctor")}
          onManualEntry={() => setScreen("registerDoctor")}
          onScanned={(data) => {
            setInviteCode(extractInviteCode(data));
            setScreen("registerDoctorConfirm");
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
