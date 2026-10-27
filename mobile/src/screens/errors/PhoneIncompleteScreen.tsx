import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AlertBanner,
  ErrorChrome,
  PrimaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { formatRuPhone } from "../../utils/phone";
import { BodyText, Headline } from "./parts";

type Props = {
  initialPhone?: string;
  onFix?: (phone: string) => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function PhoneIncompleteScreen({
  initialPhone = "+7 (916) 12-__-__",
  onFix,
  onBack,
  onDemoAll,
}: Props) {
  const [phone, setPhone] = useState(initialPhone);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ErrorChrome
        headerTitle="Номер телефона"
        onBack={onBack}
        onDemoAll={onDemoAll}
        footer={
          <PrimaryButton label="Исправить номер" onPress={() => onFix?.(phone)} />
        }
      >
        <Headline noMargin>Проверьте номер</Headline>
        <BodyText>
          В номере не хватает цифр. После кода +7 нужно ввести 10 цифр.
        </BodyText>

        <Text style={styles.label}>Номер телефона</Text>
        <TextInput
          value={phone}
          onChangeText={(v) => setPhone(formatRuPhone(v))}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="+7"
          placeholderTextColor={colors.footer}
          accessibilityLabel="Номер телефона"
          style={styles.input}
        />

        <View style={styles.alertWrap}>
          <AlertBanner
            title="Введите номер полностью"
            body="Код подтверждения ещё не отправлен. Исправьте номер, чтобы получить SMS."
          />
        </View>
      </ErrorChrome>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgApp },
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.muted,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "500",
    color: colors.ink,
  },
  alertWrap: { marginTop: 16 },
});
