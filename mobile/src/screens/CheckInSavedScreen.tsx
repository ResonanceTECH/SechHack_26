import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  weekCount?: number;
  offline?: boolean;
  onGoHome?: () => void;
  onTellDoctor?: () => void;
  onBreathing?: () => void;
};

const warnTitle = "#9A6B1A";
const warnBody = "#A07830";
const checkGreen = "#2FBF6B";

function CheckCircle() {
  return (
    <View style={styles.checkCircle}>
      <Svg width={36} height={36} viewBox="0 0 24 24">
        <Path
          d="M5.5 12.5 L10 17 L18.5 7.5"
          stroke={checkGreen}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function OfflineIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M4 10 C7.5 6.5 16.5 6.5 20 10"
        stroke={colors.muted}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M7 13.5 C9.5 11 14.5 11 17 13.5"
        stroke={colors.muted}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M10.5 17 C11.3 16.2 12.7 16.2 13.5 17"
        stroke={colors.muted}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M5 5 L19 19"
        stroke={colors.muted}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BreathIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M4 9 C8 6 12 12 16 9 C18.5 7.2 20 7.5 21 8"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M4 13 C8 10 12 16 16 13 C18.5 11.2 20 11.5 21 12"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M4 17 C8 14 12 20 16 17 C18.5 15.2 20 15.5 21 16"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckInSavedScreen({
  weekCount = 5,
  offline = true,
  onGoHome,
  onTellDoctor,
  onBreathing,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 48,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.center}>
          <CheckCircle />
          <Text style={styles.title}>Записано</Text>
          <Text style={styles.subtitle}>
            Спасибо! Это {weekCount}-я отметка за неделю.
          </Text>

          {offline ? (
            <View style={styles.offlinePill}>
              <OfflineIcon />
              <Text style={styles.offlineText}>
                Нет сети — отправим врачу позже
              </Text>
            </View>
          ) : null}

          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>
              Сон и настроение хуже 3 дня подряд
            </Text>
            <Text style={styles.warnBody}>
              Врач увидит это в отчёте. Короткая практика может помочь сейчас.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={onBreathing}
              style={({ pressed }) => [
                styles.practiceRow,
                pressed && styles.pressed,
              ]}
            >
              <BreathIcon />
              <Text style={styles.practiceText}>Дыхание 4-7-8 · 5 мин</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M9 5 L16 12 L9 19"
                  stroke={colors.footer}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={onGoHome}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>На главную</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onTellDoctor}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <ChatIcon />
            <Text style={styles.btnSecondaryText}>
              Рассказать врачу подробнее
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  center: {
    alignItems: "center",
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2440",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    marginTop: 22,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
  },
  offlinePill: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  offlineText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.muted,
  },
  warnCard: {
    marginTop: 28,
    width: "100%",
    backgroundColor: "#FFF4D6",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  warnTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: warnTitle,
  },
  warnBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: warnBody,
  },
  practiceRow: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  practiceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
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
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  btnSecondary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(59, 120, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnSecondaryText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
