import { StyleSheet, Text, View } from "react-native";
import {
  AlertBanner,
  ErrorChrome,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline } from "./parts";

type Props = {
  doctorName?: string;
  onRetry?: () => void;
  onBackToChat?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function MessageSendFailedScreen({
  doctorName = "Смирнова Е. С.",
  onRetry,
  onBackToChat,
  onBack,
  onDemoAll,
}: Props) {
  return (
    <ErrorChrome
      headerTitle={doctorName}
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Повторить отправку" onPress={onRetry} />
          <SecondaryButton label="Вернуться в чат" onPress={onBackToChat} />
        </>
      }
    >
      <Headline noMargin>Сообщение не отправлено</Headline>
      <BodyText>Связь прервалась во время отправки.</BodyText>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          Подскажите, пожалуйста, когда следующий приём?
        </Text>
      </View>
      <Text style={styles.caption}>Не отправлено · врач ещё не получил</Text>

      <View style={styles.alertWrap}>
        <AlertBanner
          title="Текст сохранён в черновике"
          body="Проверьте соединение и отправьте сообщение повторно. Повторная попытка отправит это же сообщение."
        />
      </View>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginTop: 20,
    alignSelf: "stretch",
    backgroundColor: colors.brand,
    borderRadius: 22,
    borderBottomLeftRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  bubbleText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
  },
  caption: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  alertWrap: { marginTop: 16 },
});
