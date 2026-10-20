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
import { RegisterQuestionnaireIntroScreen } from "./src/screens/RegisterQuestionnaireIntroScreen";
import { RegisterQuestionnaireQuestionScreen } from "./src/screens/RegisterQuestionnaireQuestionScreen";
import { RegisterQuestionnaireResultsScreen } from "./src/screens/RegisterQuestionnaireResultsScreen";
import { RegisterReadyScreen } from "./src/screens/RegisterReadyScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import {
  CheckInMoodScreen,
  type MoodId,
} from "./src/screens/CheckInMoodScreen";
import {
  CheckInAnxietyScreen,
  type AnxietyId,
} from "./src/screens/CheckInAnxietyScreen";
import { CheckInSleepScreen } from "./src/screens/CheckInSleepScreen";
import { CheckInSavedScreen } from "./src/screens/CheckInSavedScreen";
import { AppointmentScreen } from "./src/screens/AppointmentScreen";
import {
  scoreQuestionnaires,
  type InstrumentResult,
} from "./src/data/questionnaires";
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
  | "registerQuestionnaire"
  | "registerQuestionnaireRun"
  | "registerQuestionnaireResults"
  | "registerReady"
  | "home"
  | "notifications"
  | "checkInMood"
  | "checkInAnxiety"
  | "checkInSleep"
  | "checkInSaved"
  | "appointment"
  | "qrScan";

const DEMO_RESULTS = scoreQuestionnaires({
  "phq9-1": 2,
  "phq9-2": 2,
  "phq9-3": 2,
  "phq9-4": 2,
  "phq9-5": 2,
  "phq9-6": 2,
  "phq9-7": 2,
  "phq9-8": 2,
  "phq9-9": 1,
  "gad7-1": 2,
  "gad7-2": 2,
  "gad7-3": 2,
  "gad7-4": 2,
  "gad7-5": 2,
  "gad7-6": 1,
  "gad7-7": 1,
});

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
  const [results, setResults] = useState<{
    phq9: InstrumentResult;
    gad7: InstrumentResult;
  }>(DEMO_RESULTS);
  const [checkInMood, setCheckInMood] = useState<MoodId>(2);
  const [checkInAnxiety, setCheckInAnxiety] = useState<AnxietyId>(4);
  const [sleepFrom, setSleepFrom] = useState<"home" | "anxiety">("home");

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
          onContinue={() => setScreen("registerQuestionnaire")}
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

      {screen === "registerQuestionnaire" && (
        <RegisterQuestionnaireIntroScreen
          onBack={() => setScreen("registerMeds")}
          onStart={() => setScreen("registerQuestionnaireRun")}
          onSkip={() => setScreen("registerReady")}
        />
      )}

      {screen === "registerQuestionnaireRun" && (
        <RegisterQuestionnaireQuestionScreen
          onBack={() => setScreen("registerQuestionnaire")}
          onClose={() => setScreen("registerQuestionnaire")}
          onComplete={(answers) => {
            setResults(scoreQuestionnaires(answers));
            setScreen("registerQuestionnaireResults");
          }}
        />
      )}

      {screen === "registerQuestionnaireResults" && (
        <RegisterQuestionnaireResultsScreen
          phq9={results.phq9}
          gad7={results.gad7}
          onContinue={() => setScreen("registerReady")}
        />
      )}

      {screen === "registerReady" && (
        <RegisterReadyScreen onGoHome={() => setScreen("home")} />
      )}

      {screen === "home" && (
        <HomeScreen
          onNotifications={() => setScreen("notifications")}
          onQuestionnaire={() => setScreen("registerQuestionnaire")}
          onConfirmVisit={() => setScreen("appointment")}
          onRescheduleVisit={() => setScreen("appointment")}
          onAddAction={(action) => {
            if (action === "wellbeing") setScreen("checkInMood");
            if (action === "sleep") {
              setSleepFrom("home");
              setScreen("checkInSleep");
            }
          }}
          onMood={() => setScreen("checkInMood")}
        />
      )}

      {screen === "appointment" && (
        <AppointmentScreen
          onBack={() => setScreen("home")}
          onDone={() => setScreen("home")}
          onReschedule={() => {
            // TODO: reschedule flow
          }}
        />
      )}

      {screen === "notifications" && (
        <NotificationsScreen onBack={() => setScreen("home")} />
      )}

      {screen === "checkInMood" && (
        <CheckInMoodScreen
          initialMood={checkInMood}
          onClose={() => setScreen("home")}
          onContinue={(mood) => {
            setCheckInMood(mood);
            setScreen("checkInAnxiety");
          }}
        />
      )}

      {screen === "checkInAnxiety" && (
        <CheckInAnxietyScreen
          initialAnxiety={checkInAnxiety}
          onBack={() => setScreen("checkInMood")}
          onClose={() => setScreen("home")}
          onContinue={(anxiety) => {
            setCheckInAnxiety(anxiety);
            setSleepFrom("anxiety");
            setScreen("checkInSleep");
          }}
        />
      )}

      {screen === "checkInSleep" && (
        <CheckInSleepScreen
          step={sleepFrom === "anxiety" ? 3 : 1}
          total={sleepFrom === "anxiety" ? 3 : 1}
          onBack={() =>
            setScreen(sleepFrom === "anxiety" ? "checkInAnxiety" : "home")
          }
          onClose={() => setScreen("home")}
          onSave={() => setScreen("checkInSaved")}
        />
      )}

      {screen === "checkInSaved" && (
        <CheckInSavedScreen
          onGoHome={() => setScreen("home")}
          onTellDoctor={() => {
            // TODO: chat with doctor
          }}
          onBreathing={() => {
            // TODO: breathing exercise
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
