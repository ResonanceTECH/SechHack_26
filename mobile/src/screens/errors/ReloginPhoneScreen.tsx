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
  ErrorChrome,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { formatRuPhone } from "../../utils/phone";
import { BodyText, Headline } from "./parts";

type Props = {
  initialPhone?: string;
  onGetCode?: (phone: string) => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function ReloginPhoneScreen({
  initialPhone = "+7 (916) 123-45-67",
  onGetCode,
  onBack,
  onDemoAll,
}: Props) {
  const [phone, setPhone] = useState(initialPhone);
  const [focused, setFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ErrorChrome
        headerTitle="Вход"
        onBack={onBack}
        onDemoAll={onDemoAll}
        footer={
          <>
            <PrimaryButton label="Получить код" onPress={() => onGetCode?.(phone)} />
            <SecondaryButton label="Вернуться назад" onPress={onBack} />
          </>
        }
      >
        <Headline noMargin>Вернуться в аккаунт</Headline>
        <BodyText>
          Введите номер, с которым вы зарегистрированы. Отправим код для
          подтверждения входа.
        </BodyText>

        <Text style={styles.label}>Номер телефона</Text>
        <TextInput
          value={phone}
          onChangeText={(v) => setPhone(formatRuPhone(v))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="+7"
          placeholderTextColor={colors.footer}
          accessibilityLabel="Номер телефона"
          style={[styles.input, focused && styles.inputFocused]}
        />

        <View style={styles.infoWrap}>
          <InfoCard
            title="Это повторный вход"
            body="Создавать новый аккаунт и заново давать согласия не требуется."
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
    fontWeight: "600",
    color: colors.muted,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(27, 36, 64, 0.08)",
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "500",
    color: colors.ink,
  },
  inputFocused: { borderColor: colors.brand },
  infoWrap: { marginTop: 16 },
});
