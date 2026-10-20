import { useMemo, useState } from "react";
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
import {
  LIKERT_OPTIONS,
  QUESTIONNAIRE_QUESTIONS,
} from "../data/questionnaires";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onClose?: () => void;
  onComplete?: (answers: Record<string, number | null>) => void;
};

export function RegisterQuestionnaireQuestionScreen({
  onBack,
  onClose,
  onComplete,
}: Props) {
  const insets = useSafeAreaInsets();
  const total = QUESTIONNAIRE_QUESTIONS.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  const question = QUESTIONNAIRE_QUESTIONS[index];
  const selected = answers[question.id];
  const progress = (index + 1) / total;

  const canNext = selected !== undefined && selected !== null;

  const goNext = (nextAnswers: Record<string, number | null>) => {
    if (index >= total - 1) {
      onComplete?.(nextAnswers);
      return;
    }
    setIndex((i) => i + 1);
  };

  const onSelect = (score: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: score }));
  };

  const headerRight = useMemo(
    () => (
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
    ),
    [onClose]
  );

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
            style={({ pressed }) => [
              styles.roundBtn,
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
          <Text style={styles.headerTitle}>Опросник</Text>
          {headerRight}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaCount}>
            Вопрос {index + 1} из {total}
          </Text>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{question.sectionLabel}</Text>
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
          <Text style={styles.prompt}>{question.prompt}</Text>
          <Text style={styles.question}>{question.text}</Text>

          <View style={styles.options}>
            {LIKERT_OPTIONS.map((opt) => {
              const isSelected = selected === opt.score;
              return (
                <Pressable
                  key={opt.score}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(opt.score)}
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
                    {opt.label}
                  </Text>
                  <Text style={styles.optionScore}>{opt.score}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={!canNext}
            onPress={() => goNext(answers)}
            style={({ pressed }) => [
              styles.btnPrimary,
              !canNext && styles.btnDisabled,
              pressed && canNext && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Далее</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              const next = { ...answers, [question.id]: null };
              setAnswers(next);
              goNext(next);
            }}
            style={({ pressed }) => [
              styles.skipWrap,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.skipText}>Пропустить вопрос</Text>
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
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: colors.brand,
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
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  prompt: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  question: {
    marginTop: 12,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  options: {
    marginTop: 24,
    gap: 10,
  },
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
  radioIdle: {
    borderColor: "rgba(27, 36, 64, 0.22)",
  },
  radioSelected: {
    borderColor: colors.brand,
  },
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
  optionLabelSelected: {
    color: colors.brand,
  },
  optionScore: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.footer,
    minWidth: 14,
    textAlign: "right",
  },
  footer: {
    gap: 14,
    paddingTop: 8,
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
