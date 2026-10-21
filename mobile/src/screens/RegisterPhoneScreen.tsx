import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { AlertBanner } from "../components/errors/ErrorChrome";
import { colors } from "../theme/colors";
import { formatRuPhone, isRuPhoneComplete } from "../utils/phone";

type Props = {
  onBack?: () => void;
  onContinue?: (phone: string) => void;
  /** Incomplete number submitted — open recovery screen or show inline */
  onIncomplete?: (phone: string) => void;
  showInlineError?: boolean;
};

export function RegisterPhoneScreen({
  onBack,
  onContinue,
  onIncomplete,
  showInlineError = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("+7 916 123-45-67");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(showInlineError);
  const canSubmit = isRuPhoneComplete(phone);

  const submit = () => {
    if (!canSubmit) {
      setError(true);
      onIncomplete?.(phone);
      return;
    }
    setError(false);
    onContinue?.(phone);
  };

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <View>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Назад"
                onPress={onBack}
                style={({ pressed }) => [
                  styles.backBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path
                    d="M15 5 L8 12 L15 19"
                    stroke={colors.ink}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </Pressable>
              <Text style={styles.headerTitle}>Регистрация</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.progressWrap}>
              <StepProgress step={1} total={5} label="Аккаунт" />
            </View>

            <Text style={styles.title}>
              {error ? "Проверьте номер" : "Ваш номер телефона"}
            </Text>
            <Text style={styles.subtitle}>
              {error
                ? "В номере не хватает цифр. После кода +7 нужно ввести 10 цифр."
                : "Пришлём код в SMS — пароль не нужен."}
            </Text>

            <Text style={styles.label}>
              {error ? "Номер телефона" : "Телефон"}
            </Text>
            <TextInput
              value={phone}
              onChangeText={(v) => {
                setPhone(formatRuPhone(v));
                if (error) setError(false);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              placeholder="+7"
              placeholderTextColor={colors.footer}
              style={[
                styles.input,
                focused && !error && styles.inputFocused,
                error && styles.inputError,
              ]}
            />

            {error ? (
              <View style={styles.alertWrap}>
                <AlertBanner
                  title="Введите номер полностью"
                  body="Код подтверждения ещё не отправлен. Исправьте номер, чтобы получить SMS."
                />
              </View>
            ) : (
              <View style={styles.privacy}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path
                    d="M6 10 V8 a6 6 0 0 1 12 0 v2"
                    stroke={colors.footer}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <Path
                    d="M5 10 h14 v10 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 Z"
                    stroke={colors.footer}
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                <Text style={styles.privacyText}>
                  Номер увидят только ваш врач и клиника.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={submit}
              style={({ pressed }) => [
                styles.btnPrimary,
                !canSubmit && !error && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.btnPrimaryText}>
                {error ? "Исправить номер" : "Получить код"}
              </Text>
            </Pressable>
            {!error ? (
              <Text style={styles.legal}>
                Нажимая, вы принимаете условия использования
              </Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  headerSpacer: {
    width: 40,
  },
  progressWrap: {
    marginTop: 20,
  },
  title: {
    marginTop: 28,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  label: {
    marginTop: 28,
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
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "500",
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.brand,
  },
  inputError: {
    borderColor: colors.error,
  },
  alertWrap: {
    marginTop: 12,
  },
  privacy: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.footer,
  },
  footer: {
    gap: 12,
  },
  btnPrimary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  legal: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
