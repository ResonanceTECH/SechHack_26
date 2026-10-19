import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OtpInput } from "../components/OtpInput";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { colors } from "../theme/colors";
import { maskRuPhone } from "../utils/phone";

type Props = {
  phone: string;
  onBack?: () => void;
  onChangePhone?: () => void;
  onConfirm?: (code: string) => void;
};

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RegisterSmsScreen({
  phone,
  onBack,
  onChangePhone,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(42);
  const canSubmit = code.length === 4;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

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

            <Text style={styles.title}>Введите код из SMS</Text>
            <Text style={styles.subtitle}>
              Отправили на {maskRuPhone(phone)}
            </Text>

            <View style={styles.otpWrap}>
              <OtpInput value={code} onChange={setCode} />
            </View>

            <View style={styles.metaRow}>
              {secondsLeft > 0 ? (
                <Text style={styles.timer}>
                  Отправить ещё раз через {formatTimer(secondsLeft)}
                </Text>
              ) : (
                <Pressable
                  onPress={() => setSecondsLeft(42)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.link}>Отправить ещё раз</Text>
                </Pressable>
              )}
              <Pressable
                onPress={onChangePhone}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.link}>Изменить номер</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            disabled={!canSubmit}
            onPress={() => onConfirm?.(code)}
            style={({ pressed }) => [
              styles.btnPrimary,
              !canSubmit && styles.btnDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Подтвердить</Text>
          </Pressable>
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
  otpWrap: {
    marginTop: 28,
  },
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
  pressed: {
    opacity: 0.88,
  },
});
