import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  AlertBanner,
  ErrorChrome,
  PrimaryButton,
} from "../../components/errors/ErrorChrome";
import { OtpInput } from "../../components/OtpInput";
import { StepProgress } from "../../components/StepProgress";
import { colors } from "../../theme/colors";
import { maskRuPhone } from "../../utils/phone";

export type SmsErrorLayoutProps = {
  phone?: string;
  initialCode: string;
  alertTitle: string;
  alertBody: string;
  primaryLabel: string;
  /** called when primary pressed; layout clears the code first */
  onPrimary?: () => void;
  onChangePhone?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export const DEFAULT_DEMO_PHONE = "+7 916 123-45-67";

/** Shared body for E04 / E05: registration OTP step in an error state. */
export function SmsErrorLayout({
  phone = DEFAULT_DEMO_PHONE,
  initialCode,
  alertTitle,
  alertBody,
  primaryLabel,
  onPrimary,
  onChangePhone,
  onBack,
  onDemoAll,
}: SmsErrorLayoutProps) {
  const [code, setCode] = useState(initialCode);

  return (
    <ErrorChrome
      headerTitle="Регистрация"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <PrimaryButton
          label={primaryLabel}
          onPress={() => {
            setCode("");
            onPrimary?.();
          }}
        />
      }
    >
      <StepProgress step={1} total={5} label="Аккаунт" />

      <Text style={styles.title} accessibilityRole="header">
        Введите код из SMS
      </Text>
      <Text style={styles.subtitle}>Отправили на {maskRuPhone(phone)}</Text>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} error />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.timer}>Отправить ещё раз через 0:42</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onChangePhone}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>Изменить номер</Text>
        </Pressable>
      </View>

      <View style={styles.alertWrap}>
        <AlertBanner title={alertTitle} body={alertBody} />
      </View>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
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
  otpWrap: { marginTop: 24 },
  metaRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  timer: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  link: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.brand,
  },
  alertWrap: { marginTop: 16 },
  pressed: { opacity: 0.88 },
});
