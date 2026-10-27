import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  requestedSlot?: string;
  currentSlot?: string;
  onGoHome?: () => void;
};

function ClockIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="8.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M12 7.5 V12.2 L15.2 14.2"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function RescheduleRequestSentScreen({
  requestedSlot = "Вт, 27 октября · 11:30",
  currentSlot = "сб, 24 октября",
  onGoHome,
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
          <View style={styles.iconCircle}>
            <ClockIcon />
          </View>
          <Text style={styles.title}>Запрос отправлен</Text>
          <Text style={styles.slot}>{requestedSlot}</Text>
          <Text style={styles.body}>
            Пришлём уведомление, когда врач подтвердит. Пока действует запись на{" "}
            {currentSlot}.
          </Text>
        </View>

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
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginTop: 24,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  slot: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.brand,
    textAlign: "center",
  },
  body: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 300,
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
  pressed: { opacity: 0.88 },
});
