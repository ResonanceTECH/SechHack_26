import { Linking } from "react-native";
import type { ErrorDemoId } from "./ErrorsCatalogScreen";
import { OfflineScreen } from "./OfflineScreen";
import { ServiceErrorScreen } from "./ServiceErrorScreen";
import { CheckInSaveFailedScreen } from "./CheckInSaveFailedScreen";
import { CheckInRetrySuccessScreen } from "./CheckInRetrySuccessScreen";
import { PhoneIncompleteScreen } from "./PhoneIncompleteScreen";
import { SmsWrongCodeScreen } from "./SmsWrongCodeScreen";
import { SmsExpiredScreen } from "./SmsExpiredScreen";
import { RateLimitScreen } from "./RateLimitScreen";
import { InviteInvalidScreen } from "./InviteInvalidScreen";
import { SessionExpiredScreen } from "./SessionExpiredScreen";
import { ReloginPhoneScreen } from "./ReloginPhoneScreen";
import { ReloginSmsScreen } from "./ReloginSmsScreen";
import { MessageSendFailedScreen } from "./MessageSendFailedScreen";
import { PhotoUploadFailedScreen } from "./PhotoUploadFailedScreen";
import { MicUnavailableScreen } from "./MicUnavailableScreen";
import { CameraUnavailableScreen } from "./CameraUnavailableScreen";
import { CameraSettingsHintScreen } from "./CameraSettingsHintScreen";
import { QuestionnaireNoAnswerScreen } from "./QuestionnaireNoAnswerScreen";
import { GenericErrorScreen } from "./GenericErrorScreen";

export type ErrorFlowActions = {
  phone: string;
  onBack: () => void;
  onDemoAll: () => void;
  onHome: () => void;
  onDiary: () => void;
  onChat: () => void;
  onSafetyPlan: () => void;
  onCheckIn: () => void;
  onRegisterPhone: () => void;
  onRegisterDoctor: () => void;
  onReloginPhone: () => void;
  onReloginSms: (phone: string) => void;
  onReloginDone: () => void;
  onCameraSettings: () => void;
  onCameraGranted: () => void;
  onRetryNetwork: () => void;
  onCheckInRetrySuccess: () => void;
  onQuestionnaireReturn: () => void;
};

type Props = {
  id: ErrorDemoId;
  actions: ErrorFlowActions;
};

export function ErrorFlowScreen({ id, actions }: Props) {
  const a = actions;
  const demo = { onBack: a.onBack, onDemoAll: a.onDemoAll };

  switch (id) {
    case "offline":
      return (
        <OfflineScreen
          {...demo}
          onRetry={a.onRetryNetwork}
          onOfflineCheckIn={a.onCheckIn}
        />
      );
    case "service":
      return (
        <ServiceErrorScreen
          {...demo}
          onRetry={a.onHome}
          onSafetyPlan={a.onSafetyPlan}
        />
      );
    case "checkInSaveFailed":
      return (
        <CheckInSaveFailedScreen
          {...demo}
          onClose={a.onHome}
          onRetrySave={a.onCheckInRetrySuccess}
          onReview={a.onBack}
        />
      );
    case "checkInRetrySuccess":
      return (
        <CheckInRetrySuccessScreen
          {...demo}
          onHome={a.onHome}
          onDiary={a.onDiary}
        />
      );
    case "phoneIncomplete":
      return (
        <PhoneIncompleteScreen
          {...demo}
          onFix={() => a.onRegisterPhone()}
        />
      );
    case "smsWrong":
      return (
        <SmsWrongCodeScreen
          {...demo}
          phone={a.phone}
          onChangePhone={a.onRegisterPhone}
          onRetry={a.onBack}
        />
      );
    case "smsExpired":
      return (
        <SmsExpiredScreen
          {...demo}
          phone={a.phone}
          onChangePhone={a.onRegisterPhone}
          onResend={a.onBack}
        />
      );
    case "rateLimit":
      return (
        <RateLimitScreen
          {...demo}
          onChangePhone={a.onRegisterPhone}
          onDemoUnlocked={a.onBack}
        />
      );
    case "inviteInvalid":
      return (
        <InviteInvalidScreen {...demo} onEnterCode={a.onRegisterDoctor} />
      );
    case "sessionExpired":
      return (
        <SessionExpiredScreen {...demo} onLogin={a.onReloginPhone} />
      );
    case "reloginPhone":
      return (
        <ReloginPhoneScreen
          {...demo}
          onGetCode={(p) => a.onReloginSms(p)}
          onBack={a.onBack}
        />
      );
    case "reloginSms":
      return (
        <ReloginSmsScreen
          {...demo}
          phone={a.phone}
          onChangePhone={a.onReloginPhone}
          onConfirm={() => a.onReloginDone()}
        />
      );
    case "messageFailed":
      return (
        <MessageSendFailedScreen
          {...demo}
          onRetry={a.onChat}
          onBackToChat={a.onChat}
        />
      );
    case "photoFailed":
      return (
        <PhotoUploadFailedScreen
          {...demo}
          onRetry={a.onChat}
          onBackToChat={a.onChat}
        />
      );
    case "micUnavailable":
      return (
        <MicUnavailableScreen
          {...demo}
          onHowToAllow={() => {
            void Linking.openSettings();
          }}
          onWriteText={a.onChat}
        />
      );
    case "cameraUnavailable":
      return (
        <CameraUnavailableScreen
          {...demo}
          onHowToAllow={a.onCameraSettings}
          onManualCode={a.onRegisterDoctor}
        />
      );
    case "cameraSettings":
      return (
        <CameraSettingsHintScreen
          {...demo}
          onGranted={a.onCameraGranted}
          onCancel={a.onBack}
        />
      );
    case "questionnaireNoAnswer":
      return (
        <QuestionnaireNoAnswerScreen
          {...demo}
          onReturn={a.onQuestionnaireReturn}
          onContinueLater={a.onHome}
        />
      );
    case "generic":
    default:
      return (
        <GenericErrorScreen
          {...demo}
          onRetry={a.onBack}
          onHome={a.onHome}
        />
      );
  }
}
