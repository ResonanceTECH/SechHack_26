import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

export type ClarificationAnswer = "no" | "yes";

type Props = {
  onBack?: () => void;
  onClose?: () => void;
  onComplete?: (answers: Record<string, ClarificationAnswer>) => void;
};

const QUESTIONS = [
  {
    id: "method",
    text: "За последний месяц вы думали о том, как именно могли бы это сделать?",
  },
  {
    id: "intent",
    text: "Есть ли у вас намерение сделать это в ближайшее время?",
  },
  {
    id: "protective",
    text: "Есть ли люди или вещи, которые вас удерживают?",
  },
] as const;

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="11"
        width="12"
        height="10"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8 11 V8 a4 4 0 0 1 8 0 v3"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function QuestionnaireClarificationScreen({
  onBack,
  onClose,
  onComplete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ClarificationAnswer>>(
    {}
  );

  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const progress = (index + 1) / QUESTIONS.length;
  const canNext = selected !== undefined;

  const goNext = () => {
    if (index >= QUESTIONS.length - 1) {
      onComplete?.(answers);
      return;
    }
    setIndex((i) => i + 1);
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
            onPress={() => {
              if (index === 0) {
                onBack?.();
                return;
              }
              setIndex((i) => i - 1);
            }}
            style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
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
          <Text style={styles.headerTitle}>Опросник</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
            onPress={onClose}
            style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke={colors.ink}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaCount}>
            Уточнение {index + 1} из {QUESTIONS.length}
          </Text>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Видит только врач</Text>
          </View>
        </View>

        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.question}>{question.text}</Text>

          <View style={styles.options}>
            {(["no", "yes"] as const).map((value) => {
              const isSelected = selected === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: value }))
                  }
                  style={({ pressed }) => [
                    styles.option,
                    isSelected ? styles.optionSelected : styles.optionIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      isSelected ? styles.radioSelected : styles.radioIdle,
                    ]}
                  >
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {value === "no" ? "Нет" : "Да"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.infoBanner}>
            <LockIcon />
            <Text style={styles.infoText}>
              Спасибо за честность. Ответы помогут врачу понять, как лучше вам
              помочь.
            </Text>
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          disabled={!canNext}
          onPress={goNext}
          style={({ pressed }) => [
            styles.btnPrimary,
            !canNext && styles.btnDisabled,
            pressed && canNext && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Далее</Text>
        </Pressable>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  metaRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metaCount: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.muted,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(27, 36, 64, 0.06)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: colors.muted,
  },
  track: {
    marginTop: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.progressTrack,
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 24, paddingBottom: 16 },
  question: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  options: { marginTop: 24, gap: 10 },
  option: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIdle: {
    backgroundColor: colors.white,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "rgba(59, 120, 255, 0.08)",
    borderColor: colors.brand,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    alignItems: "center",
    justifyContent: "center",
  },
  radioIdle: { borderColor: "rgba(27, 36, 64, 0.22)" },
  radioSelected: { borderColor: colors.brand },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.ink,
  },
  optionLabelSelected: { color: colors.brand },
  infoBanner: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#E4ECFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brand,
    fontWeight: "500",
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
  pressed: { opacity: 0.88 },
});
