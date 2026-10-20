import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { colors } from "../theme/colors";

type ConcernId =
  | "anxiety"
  | "sleep"
  | "noEnergy"
  | "depression"
  | "irritability"
  | "focus"
  | "panic"
  | "interest";

type DurationId = "underMonth" | "oneToSix" | "longer";

type Props = {
  onBack?: () => void;
  onContinue?: (payload: {
    concerns: ConcernId[];
    duration: DurationId | null;
  }) => void;
  onOwnWords?: () => void;
};

const CONCERNS: { id: ConcernId; label: string }[] = [
  { id: "anxiety", label: "Тревога" },
  { id: "sleep", label: "Плохой сон" },
  { id: "noEnergy", label: "Нет сил" },
  { id: "depression", label: "Подавленность" },
  { id: "irritability", label: "Раздражительность" },
  { id: "focus", label: "Трудно сосредоточиться" },
  { id: "panic", label: "Панические атаки" },
  { id: "interest", label: "Потеря интереса" },
];

const DURATIONS: { id: DurationId; label: string }[] = [
  { id: "underMonth", label: "До месяца" },
  { id: "oneToSix", label: "1–6 месяцев" },
  { id: "longer", label: "Дольше" },
];

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

export function RegisterSurveyScreen({
  onBack,
  onContinue,
  onOwnWords,
}: Props) {
  const insets = useSafeAreaInsets();
  const [concerns, setConcerns] = useState<ConcernId[]>([
    "anxiety",
    "sleep",
    "irritability",
  ]);
  const [duration, setDuration] = useState<DurationId | null>("oneToSix");

  const toggleConcern = (id: ConcernId) => {
    setConcerns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
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
          <Text style={styles.headerTitle}>Анкета</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressWrap}>
          <StepProgress step={4} total={5} label="Анкета" />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Что вас беспокоит?</Text>
          <Text style={styles.subtitle}>Выберите всё, что подходит.</Text>

          <View style={styles.chips}>
            {CONCERNS.map((item) => {
              const selected = concerns.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleConcern(item.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected ? styles.chipSelected : styles.chipIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected ? styles.chipTextSelected : styles.chipTextIdle,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Как давно?</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((item) => {
              const selected = duration === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setDuration(item.id)}
                  style={({ pressed }) => [
                    styles.durationChip,
                    selected ? styles.chipSelected : styles.chipIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selected ? styles.chipTextSelected : styles.chipTextIdle,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onContinue?.({ concerns, duration })}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Далее</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onOwnWords}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <ChatIcon />
            <Text style={styles.btnSecondaryText}>
              Рассказать своими словами
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 20,
  },
  title: {
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
  chips: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipIdle: {
    backgroundColor: colors.white,
    borderColor: "rgba(27, 36, 64, 0.12)",
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  chipTextIdle: {
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.white,
  },
  sectionTitle: {
    marginTop: 28,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  durationRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  durationChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  durationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    gap: 12,
    paddingTop: 8,
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
