import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Phase = { label: string; seconds: number };

const PHASES: Phase[] = [
  { label: "Вдох", seconds: 4 },
  { label: "Задержка", seconds: 7 },
  { label: "Выдох", seconds: 8 },
];

type Props = {
  onBack?: () => void;
  onDone?: () => void;
};

function BackIcon() {
  return (
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
  );
}

function CheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.5 L10 17 L18.5 7.5"
        stroke={colors.white}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function BreathingScreen({ onBack, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [left, setLeft] = useState(PHASES[0].seconds);
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          setPhaseIndex((i) => (i + 1) % PHASES.length);
          return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phaseIndex]);

  useEffect(() => {
    setLeft(PHASES[phaseIndex].seconds);
  }, [phaseIndex]);

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Дыхание 4-7-8</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <View style={styles.glow}>
            <View style={styles.ring}>
              <View style={styles.circle}>
                <Text style={styles.phaseLabel}>{phase.label}</Text>
                <Text style={styles.phaseSec}>{left} с</Text>
              </View>
            </View>
          </View>

          <View style={styles.stepsCard}>
            {[
              { sec: "4 с", text: "Вдох через нос" },
              { sec: "7 с", text: "Задержите дыхание" },
              { sec: "8 с", text: "Медленный выдох ртом" },
            ].map((s) => (
              <View key={s.sec} style={styles.stepRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{s.sec}</Text>
                </View>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.hint}>
            Повторите 4 цикла. «Делайте утром и перед сном» — Е. С.
          </Text>
        </View>

        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneBtn,
            pressed && styles.pressed,
          ]}
        >
          <CheckIcon />
          <Text style={styles.doneText}>Готово</Text>
        </Pressable>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    marginBottom: 8,
  },
  headerSpacer: { width: 40 },
  roundBtn: {
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
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  glow: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.brandGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  phaseSec: {
    marginTop: 4,
    fontSize: 40,
    fontWeight: "700",
    color: colors.white,
  },
  stepsCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  hint: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    paddingHorizontal: 12,
  },
  doneBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  doneText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },
});
