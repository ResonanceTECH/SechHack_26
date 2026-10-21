import { StyleSheet, Text, View } from "react-native";
import {
  AlertBanner,
  ErrorChrome,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, DocumentIcon, Headline } from "./parts";

type Props = {
  onRetry?: () => void;
  onBackToChat?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function PhotoUploadFailedScreen({
  onRetry,
  onBackToChat,
  onBack,
  onDemoAll,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Вложение к сообщению"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Повторить загрузку" onPress={onRetry} />
          <SecondaryButton label="Вернуться в чат" onPress={onBackToChat} />
        </>
      }
    >
      <Headline noMargin>Фото не загрузилось</Headline>
      <BodyText>Загрузка прервалась. Файл остался в черновике сообщения.</BodyText>

      <View style={styles.fileCard}>
        <DocumentIcon color={colors.brand} size={30} />
        <View style={styles.fileText}>
          <Text style={styles.fileName} numberOfLines={1}>
            Фото_01.jpg
          </Text>
          <Text style={styles.fileMeta}>2,4 МБ · JPG</Text>
        </View>
      </View>
      <Text style={styles.caption}>Загрузка прервалась</Text>

      <View style={styles.alertWrap}>
        <AlertBanner
          title="Врач ещё не получил фото"
          body="Проверьте интернет и повторите загрузку. Повторно выбирать файл не нужно."
        />
      </View>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  fileCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  fileText: { flex: 1 },
  fileName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  fileMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  caption: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  alertWrap: { marginTop: 16 },
});
