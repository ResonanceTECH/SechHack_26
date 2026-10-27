import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type PhaseId = "inhale" | "hold" | "exhale";

type Phase = {
  id: PhaseId;
  label: string;
  seconds: number;
  scaleFrom: number;
  scaleTo: number;
};

const PHASES: Phase[] = [
  { id: "inhale", label: "Вдох", seconds: 4, scaleFrom: 0.72, scaleTo: 1 },
  { id: "hold", label: "Задержка", seconds: 7, scaleFrom: 1, scaleTo: 1 },
  { id: "exhale", label: "Выдох", seconds: 8, scaleFrom: 1, scaleTo: 0.72 },
];

const STEPS = [
  { id: "inhale" as const, sec: "4 с", text: "Вдох через нос" },
  { id: "hold" as const, sec: "7 с", text: "Задержите дыхание" },
  { id: "exhale" as const, sec: "8 с", text: "Медленный выдох ртом" },
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
  const [cycle, setCycle] = useState(1);

  const scale = useRef(new Animated.Value(PHASES[0].scaleFrom)).current;
  const glow = useRef(new Animated.Value(0.35)).current;
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    scale.setValue(phase.scaleFrom);
    const duration = phase.seconds * 1000;

    const scaleAnim =
      phase.scaleFrom === phase.scaleTo
        ? Animated.timing(scale, {
            toValue: phase.scaleTo,
            duration: 1,
            useNativeDriver: true,
          })
        : Animated.timing(scale, {
            toValue: phase.scaleTo,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          });

    const glowAnim = Animated.timing(glow, {
      toValue: phase.id === "exhale" ? 0.25 : phase.id === "hold" ? 0.55 : 0.7,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });

    Animated.parallel([scaleAnim, glowAnim]).start();

    setLeft(phase.seconds);
    const tick = setInterval(() => {
      setLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const advance = setTimeout(() => {
      setPhaseIndex((i) => {
        const next = (i + 1) % PHASES.length;
        if (next === 0) setCycle((c) => Math.min(4, c + 1));
        return next;
      });
    }, duration);

    return () => {
      clearInterval(tick);
      clearTimeout(advance);
    };
  }, [phaseIndex, phase, scale, glow]);

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
          <View style={styles.orbWrap}>
            <Animated.View
              style={[
                styles.glow,
                {
                  opacity: glow,
                  transform: [{ scale: Animated.multiply(scale, 1.12) }],
                },
              ]}
            />
            <Animated.View
              style={[styles.ring, { transform: [{ scale }] }]}
            >
              <View style={styles.circle}>
                <Text style={styles.phaseLabel}>{phase.label}</Text>
                <Text style={styles.phaseSec}>{Math.max(1, left)} с</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.stepsCard}>
            {STEPS.map((s) => {
              const active = s.id === phase.id;
              return (
                <View key={s.sec} style={styles.stepRow}>
                  <View
                    style={[styles.badge, active && styles.badgeActive]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        active && styles.badgeTextActive,
                      ]}
                    >
                      {s.sec}
                    </Text>
                  </View>
                  <Text
                    style={[styles.stepText, active && styles.stepTextActive]}
                  >
                    {s.text}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.hint}>
            Цикл {cycle} из 4. «Делайте утром и перед сном» — Е. С.
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
  orbWrap: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.brandGlow,
  },
  ring: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
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
  badgeActive: {
    backgroundColor: colors.brand,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand,
  },
  badgeTextActive: {
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  stepTextActive: {
    fontWeight: "700",
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
