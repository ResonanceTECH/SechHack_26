import { useEffect, useState } from "react";
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
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { colors } from "../theme/colors";

type Props = {
  initialCode?: string;
  onBack?: () => void;
  onScanQr?: () => void;
  onFindDoctor?: (code: string) => void;
  onSkip?: () => void;
};

function QrIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="8" height="8" rx="1.5" fill={colors.brand} />
      <Rect x="5.5" y="5.5" width="3" height="3" fill={colors.white} />
      <Rect x="13" y="3" width="8" height="8" rx="1.5" fill={colors.brand} />
      <Rect x="15.5" y="5.5" width="3" height="3" fill={colors.white} />
      <Rect x="3" y="13" width="8" height="8" rx="1.5" fill={colors.brand} />
      <Rect x="5.5" y="15.5" width="3" height="3" fill={colors.white} />
      <Rect x="13" y="13" width="3.5" height="3.5" fill={colors.brand} />
      <Rect x="17.5" y="13" width="3.5" height="3.5" fill={colors.brand} />
      <Rect x="13" y="17.5" width="3.5" height="3.5" fill={colors.brand} />
      <Rect x="17.5" y="17.5" width="3.5" height="3.5" fill={colors.brand} />
    </Svg>
  );
}

export function RegisterDoctorScreen({
  initialCode = "RAV-2741",
  onBack,
  onScanQr,
  onFindDoctor,
  onSkip,
}: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(initialCode);
  const [focused, setFocused] = useState(false);
  const canFind = code.trim().length >= 3;

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

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
              <StepProgress step={3} total={5} label="Врач" />
            </View>

            <Text style={styles.title}>Подключитесь к своему врачу</Text>
            <Text style={styles.subtitle}>
              Код или QR вам дадут на приёме или пришлют в приглашении.
            </Text>

            <Pressable
              onPress={onScanQr}
              style={({ pressed }) => [
                styles.qrBtn,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.qrIconWrap}>
                <QrIcon />
              </View>
              <View style={styles.qrTextWrap}>
                <Text style={styles.qrTitle}>Сканировать QR-код</Text>
                <Text style={styles.qrSub}>Откроется камера</Text>
              </View>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M9 5 L16 12 L9 19"
                  stroke={colors.white}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>или</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.label}>Код приглашения</Text>
            <TextInput
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="RAV-0000"
              placeholderTextColor={colors.footer}
              style={[styles.input, focused && styles.inputFocused]}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              disabled={!canFind}
              onPress={() => onFindDoctor?.(code.trim())}
              style={({ pressed }) => [
                styles.btnPrimary,
                !canFind && styles.btnDisabled,
                pressed && canFind && styles.pressed,
              ]}
            >
              <Text style={styles.btnPrimaryText}>Найти врача</Text>
            </Pressable>

            <Pressable
              onPress={onSkip}
              style={({ pressed }) => [
                styles.skipWrap,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.skipText}>Подключу позже</Text>
            </Pressable>
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
  headerSpacer: { width: 40 },
  progressWrap: { marginTop: 20 },
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
  qrBtn: {
    marginTop: 24,
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qrIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  qrTextWrap: {
    flex: 1,
  },
  qrTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  qrSub: {
    marginTop: 2,
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
  },
  orRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27,36,64,0.16)",
  },
  orText: {
    fontSize: 14,
    color: colors.footer,
  },
  label: {
    marginTop: 18,
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
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: 0.5,
  },
  inputFocused: {
    borderColor: colors.brand,
  },
  footer: {
    gap: 14,
  },
  btnPrimary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.45 },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  skipWrap: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
