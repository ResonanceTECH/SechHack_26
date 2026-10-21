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
import { FollowUpQuestionnaireIntroScreen } from "./src/screens/FollowUpQuestionnaireIntroScreen";
import { QuestionnaireClarificationScreen } from "./src/screens/QuestionnaireClarificationScreen";
import { FollowUpQuestionnaireResultsScreen } from "./src/screens/FollowUpQuestionnaireResultsScreen";
import {
  SymptomSelectScreen,
  type SymptomId,
} from "./src/screens/SymptomSelectScreen";
import { SymptomDetailScreen } from "./src/screens/SymptomDetailScreen";
import { EmergencyHelpScreen } from "./src/screens/EmergencyHelpScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { DiaryScreen } from "./src/screens/DiaryScreen";
import { QuestionnairesScreen } from "./src/screens/QuestionnairesScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { DoctorAccessScreen } from "./src/screens/DoctorAccessScreen";
import { NotificationSettingsScreen } from "./src/screens/NotificationSettingsScreen";
import { MyDataScreen } from "./src/screens/MyDataScreen";
import { SafetyPlanScreen } from "./src/screens/SafetyPlanScreen";
import {
  OutgoingCallScreen,
  type OutgoingCallTarget,
} from "./src/screens/OutgoingCallScreen";
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
import { RescheduleAppointmentScreen } from "./src/screens/RescheduleAppointmentScreen";
import { RescheduleRequestSentScreen } from "./src/screens/RescheduleRequestSentScreen";
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
  | "followUpQuestionnaire"
  | "followUpQuestionnaireRun"
  | "followUpClarification"
  | "followUpResults"
  | "symptomSelect"
  | "symptomDetail"
  | "emergencyHelp"
  | "chat"
  | "diary"
  | "questionnaires"
  | "profile"
  | "doctorAccess"
  | "notificationSettings"
  | "myData"
  | "safetyPlan"
  | "outgoingCall"
  | "home"
  | "notifications"
  | "checkInMood"
  | "checkInAnxiety"
  | "checkInSleep"
  | "checkInSaved"
  | "appointment"
  | "rescheduleAppointment"
  | "rescheduleSent"
  | "qrScan";

const RESCHEDULE_DAY_LABELS: Record<string, string> = {
  "26": "Пн, 26 октября",
  "27": "Вт, 27 октября",
  "28": "Ср, 28 октября",
  "29": "Чт, 29 октября",
  "30": "Пт, 30 октября",
};

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
  const [rescheduleBack, setRescheduleBack] = useState<Screen>("home");
  const [rescheduleSlot, setRescheduleSlot] = useState("Вт, 27 октября · 11:30");
  const [followUpAlert, setFollowUpAlert] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomId[]>([]);
  const [emergencyBack, setEmergencyBack] = useState<Screen>("home");
  const [symptomBack, setSymptomBack] = useState<Screen>("home");
  const [consentBack, setConsentBack] = useState<Screen>("registerConsent");
  const [callBack, setCallBack] = useState<Screen>("safetyPlan");
  const [callTarget, setCallTarget] = useState<OutgoingCallTarget>({
    initials: "ЕС",
    name: "Смирнова Е. С.",
    status: "Врач-психиатр · вызов...",
  });

  const symptomDetailTitle = (() => {
    const hasRash = selectedSymptoms.includes("rash");
    const hasItch = selectedSymptoms.includes("itch");
    if (hasRash && hasItch) return "Сыпь и зуд";
    if (hasRash) return "Сыпь";
    if (hasItch) return "Зуд";
    if (selectedSymptoms.length === 1) {
      const map: Partial<Record<SymptomId, string>> = {
        drowsiness: "Сонливость",
        dizziness: "Головокружение",
        weakness: "Слабость",
        nausea: "Тошнота",
        headache: "Головная боль",
        restless: "Не могу усидеть",
        insomnia: "Бессонница",
        anxietyUp: "Тревога сильнее",
        swelling: "Отёк лица или губ",
        breathing: "Трудно дышать",
      };
      return map[selectedSymptoms[0]] ?? "Симптом";
    }
    return "Симптомы";
  })();

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
          onReadDocument={() => {
            setConsentBack("registerConsent");
            setScreen("consentDocument");
          }}
          onContinue={() => setScreen("registerDoctor")}
        />
      )}

      {screen === "consentDocument" && (
        <ConsentDocumentScreen
          onBack={() => setScreen(consentBack)}
          onDone={() => setScreen(consentBack)}
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

      {screen === "followUpQuestionnaire" && (
        <FollowUpQuestionnaireIntroScreen
          onBack={() => setScreen("home")}
          onClose={() => setScreen("home")}
          onStart={() => setScreen("followUpQuestionnaireRun")}
          onRemindLater={() => setScreen("home")}
        />
      )}

      {screen === "followUpQuestionnaireRun" && (
        <RegisterQuestionnaireQuestionScreen
          onBack={() => setScreen("followUpQuestionnaire")}
          onClose={() => setScreen("home")}
          onCrisisHelp={() => {
            // TODO: crisis resources
          }}
          onComplete={(answers) => {
            setResults(scoreQuestionnaires(answers));
            const q9 = answers["phq9-9"];
            if (q9 != null && q9 > 0) {
              setFollowUpAlert(true);
              setScreen("followUpClarification");
              return;
            }
            setFollowUpAlert(false);
            setScreen("followUpResults");
          }}
        />
      )}

      {screen === "followUpClarification" && (
        <QuestionnaireClarificationScreen
          onBack={() => setScreen("followUpQuestionnaireRun")}
          onClose={() => setScreen("home")}
          onComplete={(answers) => {
            setFollowUpAlert(
              answers.method === "yes" ||
                answers.intent === "yes" ||
                answers.protective === "no"
            );
            setScreen("followUpResults");
          }}
        />
      )}

      {screen === "followUpResults" && (
        <FollowUpQuestionnaireResultsScreen
          showDoctorAlert={followUpAlert}
          onGoHome={() => setScreen("home")}
        />
      )}

      {screen === "home" && (
        <HomeScreen
          onProfile={() => setScreen("profile")}
          onSos={() => {
            setEmergencyBack("home");
            setScreen("emergencyHelp");
          }}
          onNotifications={() => setScreen("notifications")}
          onQuestionnaire={() => setScreen("followUpQuestionnaire")}
          onConfirmVisit={() => setScreen("appointment")}
          onRescheduleVisit={() => {
            setRescheduleBack("home");
            setScreen("rescheduleAppointment");
          }}
          onAddAction={(action) => {
            if (action === "wellbeing") setScreen("checkInMood");
            if (action === "sleep") {
              setSleepFrom("home");
              setScreen("checkInSleep");
            }
            if (action === "symptom") {
              setSymptomBack("home");
              setScreen("symptomSelect");
            }
            if (action === "message") setScreen("chat");
          }}
          onTab={(tab) => {
            if (tab === "chat") setScreen("chat");
            if (tab === "diary") setScreen("diary");
            if (tab === "home") setScreen("home");
          }}
          onMood={() => setScreen("checkInMood")}
        />
      )}

      {screen === "profile" && (
        <ProfileScreen
          onBack={() => setScreen("home")}
          onDoctorAccess={() => setScreen("doctorAccess")}
          onNotificationSettings={() => setScreen("notificationSettings")}
          onSafetyPlan={() => setScreen("safetyPlan")}
          onMyData={() => setScreen("myData")}
          onLogout={() => setScreen("welcome")}
        />
      )}

      {screen === "doctorAccess" && (
        <DoctorAccessScreen
          onBack={() => setScreen("profile")}
          onWriteDoctor={() => setScreen("chat")}
        />
      )}

      {screen === "notificationSettings" && (
        <NotificationSettingsScreen onBack={() => setScreen("profile")} />
      )}

      {screen === "myData" && (
        <MyDataScreen
          onBack={() => setScreen("profile")}
          onConsentText={() => {
            setConsentBack("myData");
            setScreen("consentDocument");
          }}
          onDownload={() => {}}
          onDeleteAccount={() => setScreen("welcome")}
        />
      )}

      {screen === "safetyPlan" && (
        <SafetyPlanScreen
          onBack={() => setScreen("profile")}
          onCallDoctor={() => {
            setCallBack("safetyPlan");
            setCallTarget({
              initials: "ЕС",
              name: "Смирнова Е. С.",
              status: "Врач-психиатр · вызов...",
            });
            setScreen("outgoingCall");
          }}
          onCallContact={() => {
            setCallBack("safetyPlan");
            setCallTarget({
              initials: "М",
              name: "Мария",
              status: "Доверенный контакт · вызов...",
            });
            setScreen("outgoingCall");
          }}
          onEmergency={() => {
            setEmergencyBack("safetyPlan");
            setScreen("emergencyHelp");
          }}
        />
      )}

      {screen === "outgoingCall" && (
        <OutgoingCallScreen
          target={callTarget}
          onHangUp={() => setScreen(callBack)}
        />
      )}

      {screen === "diary" && (
        <DiaryScreen
          onTab={(tab) => {
            if (tab === "home") setScreen("home");
            if (tab === "chat") setScreen("chat");
            if (tab === "diary") setScreen("diary");
          }}
          onAddAction={(action) => {
            if (action === "wellbeing") setScreen("checkInMood");
            if (action === "sleep") {
              setSleepFrom("home");
              setScreen("checkInSleep");
            }
            if (action === "symptom") {
              setSymptomBack("diary");
              setScreen("symptomSelect");
            }
            if (action === "message") setScreen("chat");
          }}
          onQuestionnaires={() => setScreen("questionnaires")}
        />
      )}

      {screen === "questionnaires" && (
        <QuestionnairesScreen
          onBack={() => setScreen("diary")}
          onStart={() => setScreen("followUpQuestionnaire")}
        />
      )}

      {screen === "chat" && (
        <ChatScreen
          onBack={() => setScreen("home")}
          onAttach={(action) => {
            if (action === "symptom") {
              setSymptomBack("chat");
              setScreen("symptomSelect");
            }
          }}
        />
      )}

      {screen === "symptomSelect" && (
        <SymptomSelectScreen
          onBack={() => setScreen(symptomBack)}
          onContinue={(selected) => {
            setSelectedSymptoms(selected);
            setScreen("symptomDetail");
          }}
          onOwnWords={() => {
            // TODO: free-text symptom
          }}
          onUrgent={() => {
            setEmergencyBack("symptomSelect");
            setScreen("emergencyHelp");
          }}
        />
      )}

      {screen === "symptomDetail" && (
        <SymptomDetailScreen
          title={symptomDetailTitle}
          onBack={() => setScreen("symptomSelect")}
          onSend={() => setScreen(symptomBack)}
        />
      )}

      {screen === "emergencyHelp" && (
        <EmergencyHelpScreen onClose={() => setScreen(emergencyBack)} />
      )}

      {screen === "appointment" && (
        <AppointmentScreen
          onBack={() => setScreen("home")}
          onDone={() => setScreen("home")}
          onReschedule={() => {
            setRescheduleBack("appointment");
            setScreen("rescheduleAppointment");
          }}
        />
      )}

      {screen === "rescheduleAppointment" && (
        <RescheduleAppointmentScreen
          onBack={() => setScreen(rescheduleBack)}
          onSubmit={({ dateId, time }) => {
            const day = RESCHEDULE_DAY_LABELS[dateId] ?? "Вт, 27 октября";
            setRescheduleSlot(`${day} · ${time}`);
            setScreen("rescheduleSent");
          }}
        />
      )}

      {screen === "rescheduleSent" && (
        <RescheduleRequestSentScreen
          requestedSlot={rescheduleSlot}
          onGoHome={() => setScreen("home")}
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
          onTellDoctor={() => setScreen("chat")}
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
