import { useMemo, useState, useEffect } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { LoginChoiceScreen } from "./src/screens/LoginChoiceScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import {
  ErrorsCatalogScreen,
  ErrorFlowScreen,
  type ErrorDemoId,
} from "./src/screens/errors";
import { useNetworkStatus } from "./src/hooks/useNetworkStatus";
import { requestSms, verifySms, verifyInvite, storeConsent, getMe, loginEmail, lookupPhone } from "./src/api/auth";
import { submitScreening } from "./src/api/screenings";
import { updateMyMedications } from "./src/api/patientMeds";
import { ApiError } from "./src/api/client";
import { clearTokens } from "./src/api/storage";
import { getHomeDashboard, buildNameAndInitials } from "./src/api/patient";
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
import {
  RegisterQuestionnaireQuestionScreen,
  type QuestionnaireProgress,
} from "./src/screens/RegisterQuestionnaireQuestionScreen";
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
import { TreatmentScreen } from "./src/screens/TreatmentScreen";
import {
  MedicationScreen,
  type MedicationDoseState,
} from "./src/screens/MedicationScreen";
import { SkipDoseScreen } from "./src/screens/SkipDoseScreen";
import { MedicationInstructionScreen } from "./src/screens/MedicationInstructionScreen";
import { BreathingScreen } from "./src/screens/BreathingScreen";
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
import { CheckInSleepScreen, type SleepCheckIn } from "./src/screens/CheckInSleepScreen";
import { submitDiaryEntry } from "./src/api/diary";
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
  | "login"
  | "loginChoice"
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
  | "treatment"
  | "medication"
  | "skipDose"
  | "medicationInstruction"
  | "breathing"
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
  | "qrScan"
  | "errorsCatalog"
  | ErrorDemoId;

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

const ERROR_DEMO_IDS: ErrorDemoId[] = [
  "generic",
  "offline",
  "service",
  "checkInSaveFailed",
  "checkInRetrySuccess",
  "phoneIncomplete",
  "smsWrong",
  "smsExpired",
  "rateLimit",
  "inviteInvalid",
  "sessionExpired",
  "reloginPhone",
  "reloginSms",
  "messageFailed",
  "photoFailed",
  "micUnavailable",
  "cameraUnavailable",
  "cameraSettings",
  "questionnaireNoAnswer",
];

function isErrorDemoId(s: Screen): s is ErrorDemoId {
  return (ERROR_DEMO_IDS as string[]).includes(s);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [errorBack, setErrorBack] = useState<Screen>("errorsCatalog");
  const [phone, setPhone] = useState("+7 916 123-45-67");
  const [phoneFlow, setPhoneFlow] = useState<"register" | "login">("register");
  const [smsDevCode, setSmsDevCode] = useState<string | undefined>(undefined);
  const [inviteCode, setInviteCode] = useState("RAV27400");
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
  const [patientName, setPatientName] = useState("Анна");
  const [patientInitials, setPatientInitials] = useState("АМ");
  const [consentBack, setConsentBack] = useState<Screen>("registerConsent");
  const [callBack, setCallBack] = useState<Screen>("safetyPlan");
  const [safetyPlanBack, setSafetyPlanBack] = useState<Screen>("profile");
  const [questionnaireProgress, setQuestionnaireProgress] =
    useState<QuestionnaireProgress>({ index: 0, answers: {} });
  const [medPaused, setMedPaused] = useState(false);
  const [medicationBack, setMedicationBack] = useState<Screen>("treatment");
  const [breathingBack, setBreathingBack] = useState<Screen>("treatment");
  const [questionnairesBack, setQuestionnairesBack] =
    useState<Screen>("diary");
  const { online, refresh: refreshNetwork } = useNetworkStatus();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (!cancelled && me?.user) {
          // Fetch patient name/initials from home dashboard
          try {
            const dashboard = await getHomeDashboard();
            const patient = dashboard?.patient_home?.patient;
            if (patient) {
              const { name, initials } = buildNameAndInitials(
                patient.first_name,
                patient.last_name,
              );
              if (!cancelled) {
                setPatientName(name);
                setPatientInitials(initials);
              }
            }
          } catch {
            // keep defaults
          }
          setScreen("home");
        }
      } catch {
        // no valid session -> stay on welcome
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openError = (id: ErrorDemoId, back: Screen = "errorsCatalog") => {
    setErrorBack(back);
    setScreen(id);
  };

  const openErrorsCatalog = (back: Screen = "welcome") => {
    setErrorBack(back);
    setScreen("errorsCatalog");
  };

  const openMedication = (back: Screen = "treatment") => {
    setMedicationBack(back);
    setScreen("medication");
  };

  const openBreathing = (back: Screen = "treatment") => {
    setBreathingBack(back);
    setScreen("breathing");
  };
  const [morningDose, setMorningDose] =
    useState<MedicationDoseState>("pending");
  const [eveningDose, setEveningDose] =
    useState<MedicationDoseState>("pending");
  const [callTarget, setCallTarget] = useState<OutgoingCallTarget>({
    initials: "ЕС",
    name: "Смирнова Е. С.",
    status: "Врач-психиатр · вызов...",
  });

  const goTab = (tab: string) => {
    if (tab === "home") setScreen("home");
    if (tab === "diary") setScreen("diary");
    if (tab === "treatment") setScreen("treatment");
    if (tab === "chat") setScreen("chat");
  };

  const addActionFrom = (from: Screen) => (action: string) => {
    if (action === "wellbeing") setScreen("checkInMood");
    if (action === "sleep") {
      setSleepFrom("home");
      setScreen("checkInSleep");
    }
    if (action === "symptom") {
      setSymptomBack(from);
      setScreen("symptomSelect");
    }
    if (action === "medication") openMedication(from);
    if (action === "message") setScreen("chat");
  };

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

  const errorActions = useMemo(
    () => ({
      phone,
      onBack: () => setScreen(errorBack),
      onDemoAll: () => openErrorsCatalog(errorBack),
      onHome: () => setScreen("home"),
      onDiary: () => setScreen("diary"),
      onChat: () => setScreen("chat"),
      onSafetyPlan: () => {
        setSafetyPlanBack("home");
        setScreen("safetyPlan");
      },
      onCheckIn: () => {
        setSleepFrom("home");
        setScreen("checkInSleep");
      },
      onRegisterPhone: () => setScreen("registerPhone"),
      onRegisterDoctor: () => setScreen("registerDoctor"),
      onReloginPhone: () => openError("reloginPhone", errorBack),
      onReloginSms: (nextPhone: string) => {
        setPhone(nextPhone);
        openError("reloginSms", "reloginPhone");
      },
      onReloginDone: () => setScreen("home"),
      onCameraSettings: () => openError("cameraSettings", errorBack),
      onCameraGranted: () => setScreen("qrScan"),
      onRetryNetwork: async () => {
        const ok = await refreshNetwork();
        if (ok) setScreen("home");
      },
      onCheckInRetrySuccess: () => openError("checkInRetrySuccess", "home"),
      onQuestionnaireReturn: () => setScreen(errorBack),
    }),
    [phone, errorBack, refreshNetwork]
  );

  return (
    <SafeAreaProvider>
      {screen === "welcome" && (
        <WelcomeScreen
          onStart={() => { setPhoneFlow("register"); setScreen("registerPhone"); }}
          onLogin={() => setScreen("loginChoice")}
          onErrorsDemo={() => openErrorsCatalog("welcome")}
        />
      )}

      {screen === "errorsCatalog" && (
        <ErrorsCatalogScreen
          onBack={() => setScreen(errorBack === "errorsCatalog" ? "welcome" : errorBack)}
          onOpen={(id) => openError(id, "errorsCatalog")}
        />
      )}

      {isErrorDemoId(screen) && (
        <ErrorFlowScreen id={screen} actions={errorActions} />
      )}

      {screen === "loginChoice" && (
        <LoginChoiceScreen
          onBack={() => setScreen("welcome")}
          onPhone={() => { setPhoneFlow("login"); setScreen("registerPhone"); }}
          onEmail={() => setScreen("login")}
        />
      )}


      {screen === "login" && (
        <LoginScreen
          onBack={() => setScreen("welcome")}
          onLogin={async (email, password) => {
            await loginEmail(email, password);
            const me = await getMe();
            if (me.user.role !== "patient") {
              throw new Error("Для врачей и психологов используйте веб-кабинет");
            }
            const consentsDone =
              me.consent_personal_data &&
              me.consent_medical_data &&
              me.consent_data_sharing_with_doctor;
            // Fetch patient name/initials from home dashboard
            try {
              const dashboard = await getHomeDashboard();
              const patient = dashboard?.patient_home?.patient;
              if (patient) {
                const { name, initials } = buildNameAndInitials(
                  patient.first_name,
                  patient.last_name,
                );
                setPatientName(name);
                setPatientInitials(initials);
              }
            } catch {
              // keep defaults
            }
            if (me.user.role === "patient" && me.has_patient_profile && consentsDone) {
              setScreen("home");
            } else if (me.user.role === "patient") {
              setScreen("registerConsent");
            } else {
              setScreen("home");
            }
          }}
        />
      )}


      {screen === "registerPhone" && (
        <RegisterPhoneScreen
          title={phoneFlow === "login" ? "Вход" : "Регистрация"}
          onBack={() => setScreen(phoneFlow === "login" ? "loginChoice" : "welcome")}
          onContinue={async (nextPhone) => {
            try {
              const info = await lookupPhone(nextPhone);
              setPhoneFlow(info.exists ? "login" : "register");
              const res = await requestSms(nextPhone);
              setPhone(nextPhone);
              setSmsDevCode(res.dev_code);
              setScreen("registerSms");
            } catch (e: any) {
              Alert.alert("SMS", e?.message ?? "Не удалось отправить код");
            }
          }}
        />
      )}

      {screen === "registerSms" && (
        <RegisterSmsScreen
          title={phoneFlow === "login" ? "Вход" : "Подтверждение"}
          phone={phone}
          initialCode={smsDevCode}
          onBack={() => setScreen("registerPhone")}
          onChangePhone={() => setScreen("registerPhone")}
          onConfirm={async (code) => {
            try {
              await verifySms(phone, code);
              const me = await getMe();
              const consentsDone =
                me.consent_personal_data &&
                me.consent_medical_data &&
                me.consent_data_sharing_with_doctor;
              // Fetch patient name/initials from home dashboard
              try {
                const dashboard = await getHomeDashboard();
                const patient = dashboard?.patient_home?.patient;
                if (patient) {
                  const { name, initials } = buildNameAndInitials(
                    patient.first_name,
                    patient.last_name,
                  );
                  setPatientName(name);
                  setPatientInitials(initials);
                }
              } catch {
                // keep defaults
              }
              if (me.has_patient_profile && !consentsDone) {
                setScreen("registerConsent");
              } else {
                setScreen("home");
              }
            } catch (e) {
              const code = e instanceof ApiError ? e.code : undefined;
              if (code === "sms_code_expired") {
                openError("smsExpired", "registerSms");
              } else if (code === "rate_limited") {
                openError("rateLimit", "registerSms");
              } else {
                openError("smsWrong", "registerSms");
              }
            }
          }}
          onRateLimited={() => openError("rateLimit", "registerSms")}
        />
      )}

      {screen === "registerConsent" && (
        <RegisterConsentScreen
          onBack={() => setScreen("registerSms")}
          onReadDocument={() => {
            setConsentBack("registerConsent");
            setScreen("consentDocument");
          }}
          onContinue={async () => {
            await storeConsent(true, true, false);
            setScreen("registerDoctor");
          }}
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
          onFindDoctor={async (code) => {
            const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
            setInviteCode(normalized);
            try {
              await verifyInvite(normalized);
              setScreen("registerDoctorConfirm");
            } catch {
              openError("inviteInvalid", "registerDoctor");
            }
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
            void updateMyMedications({
              current_medications: takingNothing ? [] : medications.map((m) => m.name),
              allergy_status: allergy,
              taking_no_medications: takingNothing,
            }).catch(() => undefined);
            setScreen("registerQuestionnaire");
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

      {screen === "registerQuestionnaire" && (
        <RegisterQuestionnaireIntroScreen
          onBack={() => setScreen("registerMeds")}
          onStart={() => {
            setQuestionnaireProgress({ index: 0, answers: {} });
            setScreen("registerQuestionnaireRun");
          }}
          onSkip={() => setScreen("registerReady")}
        />
      )}

      {screen === "registerQuestionnaireRun" && (
        <RegisterQuestionnaireQuestionScreen
          initialIndex={questionnaireProgress.index}
          initialAnswers={questionnaireProgress.answers}
          onBack={() => setScreen("registerQuestionnaire")}
          onClose={() => setScreen("registerQuestionnaire")}
          onCrisisHelp={(progress) => {
            setQuestionnaireProgress(progress);
            setSafetyPlanBack("registerQuestionnaireRun");
            setScreen("safetyPlan");
          }}
          onNoAnswer={(progress) => {
            setQuestionnaireProgress(progress);
            openError("questionnaireNoAnswer", "registerQuestionnaireRun");
          }}
          onComplete={(answers) => {
            setQuestionnaireProgress({ index: 0, answers: {} });
            setResults(scoreQuestionnaires(answers));
            const phqAnswers = Object.entries(answers)
              .filter(([id]) => id.startsWith("phq9-"))
              .map(([id, value]) => ({
                question_id: `q${id.split("-")[1]}`,
                value: value ?? 0,
              }));
            const gadAnswers = Object.entries(answers)
              .filter(([id]) => id.startsWith("gad7-"))
              .map(([id, value]) => ({
                question_id: `q${id.split("-")[1]}`,
                value: value ?? 0,
              }));
            void Promise.all([
              submitScreening("phq9", phqAnswers),
              submitScreening("gad7", gadAnswers),
            ]).catch(() => undefined);
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
          onStart={() => {
            setQuestionnaireProgress({ index: 0, answers: {} });
            setScreen("followUpQuestionnaireRun");
          }}
          onRemindLater={() => setScreen("home")}
        />
      )}

      {screen === "followUpQuestionnaireRun" && (
        <RegisterQuestionnaireQuestionScreen
          initialIndex={questionnaireProgress.index}
          initialAnswers={questionnaireProgress.answers}
          onBack={() => setScreen("followUpQuestionnaire")}
          onClose={() => setScreen("home")}
          onCrisisHelp={(progress) => {
            setQuestionnaireProgress(progress);
            setSafetyPlanBack("followUpQuestionnaireRun");
            setScreen("safetyPlan");
          }}
          onNoAnswer={(progress) => {
            setQuestionnaireProgress(progress);
            openError("questionnaireNoAnswer", "followUpQuestionnaireRun");
          }}
          onComplete={(answers) => {
            setQuestionnaireProgress({ index: 0, answers: {} });
            setResults(scoreQuestionnaires(answers));
            const q9 = answers["phq9-9"];
            if (q9 != null && q9 > 0) {
              // keep answers so clarification back can restore q9
              setQuestionnaireProgress({
                index: 8, // phq9-9
                answers,
              });
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
            setQuestionnaireProgress({ index: 0, answers: {} });
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
          name={patientName}
          initials={patientInitials}
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
          onAddAction={addActionFrom("home")}
          onTab={goTab}
          onMood={() => setScreen("checkInMood")}
          onTakeMed={() => openMedication("home")}
        />
      )}

      {screen === "treatment" && (
        <TreatmentScreen
          onTab={goTab}
          onAddAction={addActionFrom("treatment")}
          onMedication={() => openMedication("treatment")}
          onBreathing={() => openBreathing("treatment")}
          onQuestionnaires={() => {
            setQuestionnairesBack("treatment");
            setScreen("questionnaires");
          }}
          onAppointment={() => setScreen("appointment")}
        />
      )}

      {screen === "medication" && (
        <MedicationScreen
          morning={morningDose}
          evening={medPaused ? "paused" : eveningDose}
          paused={medPaused}
          onBack={() => setScreen(medicationBack)}
          onInstruction={() => setScreen("medicationInstruction")}
          onTakeMorning={() => setMorningDose("taken")}
          onSkipMorning={() => setScreen("skipDose")}
          onSideEffect={() => {
            setSymptomBack("medication");
            setScreen("symptomSelect");
          }}
          onWriteDoctor={() => setScreen("chat")}
        />
      )}

      {screen === "skipDose" && (
        <SkipDoseScreen
          onBack={() => setScreen("medication")}
          onSave={() => {
            setMorningDose("skipped");
            setScreen("medication");
          }}
        />
      )}

      {screen === "medicationInstruction" && (
        <MedicationInstructionScreen
          onBack={() => setScreen("medication")}
          onSideEffect={() => {
            setSymptomBack("medicationInstruction");
            setScreen("symptomSelect");
          }}
        />
      )}

      {screen === "breathing" && (
        <BreathingScreen
          onBack={() => setScreen(breathingBack)}
          onDone={() => setScreen(breathingBack)}
        />
      )}

      {screen === "profile" && (
        <ProfileScreen
          onBack={() => setScreen("home")}
          onDoctorAccess={() => setScreen("doctorAccess")}
          onNotificationSettings={() => setScreen("notificationSettings")}
          onSafetyPlan={() => {
            setSafetyPlanBack("profile");
            setScreen("safetyPlan");
          }}
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
          onBack={() => setScreen(safetyPlanBack)}
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
          onTab={goTab}
          onAddAction={addActionFrom("diary")}
          onQuestionnaires={() => {
            setQuestionnairesBack("diary");
            setScreen("questionnaires");
          }}
        />
      )}

      {screen === "questionnaires" && (
        <QuestionnairesScreen
          onBack={() => setScreen(questionnairesBack)}
          onStart={() => {
            setQuestionnaireProgress({ index: 0, answers: {} });
            setScreen("followUpQuestionnaire");
          }}
        />
      )}

      {screen === "chat" && (
        <ChatScreen
          online={online}
          onBack={() => setScreen("home")}
          onMedPaused={() => {
            setMedPaused(true);
            setMorningDose("taken");
            setEveningDose("paused");
            openMedication("chat");
          }}
          onSendFailed={() => openError("messageFailed", "chat")}
          onUploadFailed={() => openError("photoFailed", "chat")}
          onMicDenied={() => openError("micUnavailable", "chat")}
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
          onSave={async (sleep: SleepCheckIn) => {
            const ok = online ? true : await refreshNetwork();
            if (!ok) {
              openError("checkInSaveFailed", "checkInSleep");
              return;
            }
            try {
              await submitDiaryEntry({
                mood: checkInMood,
                anxiety: checkInAnxiety,
                sleepMinutes: sleep.minutes,
                recordedAt: new Date(),
              });
            } catch {
              openError("checkInSaveFailed", "checkInSleep");
              return;
            }
            setScreen("checkInSaved");
          }}
        />
      )}

      {screen === "checkInSaved" && (
        <CheckInSavedScreen
          offline={!online}
          onGoHome={() => setScreen("home")}
          onTellDoctor={() => setScreen("chat")}
          onBreathing={() => openBreathing("checkInSaved")}
        />
      )}

      {screen === "qrScan" && (
        <QrScanScreen
          onClose={() => setScreen("registerDoctor")}
          onManualEntry={() => setScreen("registerDoctor")}
          onCameraDenied={() =>
            openError("cameraUnavailable", "registerDoctor")
          }
          onScanned={async (data) => {
            const normalized = extractInviteCode(data)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "");
            setInviteCode(normalized);
            try {
              await verifyInvite(normalized);
              setScreen("registerDoctorConfirm");
            } catch {
              openError("inviteInvalid", "registerDoctor");
            }
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
