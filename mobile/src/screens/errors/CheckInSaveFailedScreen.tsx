import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AlertBanner,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { ScreenGradient } from "../../components/ScreenGradient";
import { SegmentBar } from "../../components/SegmentBar";
import { colors } from "../../theme/colors";
import type {
  EarlyWakeId,
  FallAsleepId,
  NightWakesId,
  SleepCheckIn,
} from "../CheckInSleepScreen";

type Props = {
  initial?: Partial<SleepCheckIn>;
  step?: number;
  total?: number;
  onBack?: () => void;
  onClose?: () => void;
  onRetrySave?: (data: SleepCheckIn) => void;
  onReview?: () => void;
  onDemoAll?: () => void;
};

const FALL_ASLEEP: { id: FallAsleepId; label: string }[] = [
  { id: "under30", label: "До 30 мин" },
  { id: "30to60", label: "30–60 мин" },
  { id: "over60", label: "Больше часа" },
];

const NIGHT_WAKES: { id: NightWakesId; label: string }[] = [
  { id: "none", label: "Нет" },
  { id: "1to2", label: "1–2 раза" },
  { id: "3plus", label: "3 и более" },
];

const EARLY_WAKE: { id: EarlyWakeId; label: string }[] = [
  { id: "no", label: "Нет" },
  { id: "yes", label: "Да" },
];

const STEP_MIN = 15;
const MIN_SLEEP = 0;
const MAX_SLEEP = 14 * 60;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} ч ${m.toString().padStart(2, "0")} мин`;
}

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.id)}
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
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CheckInSaveFailedScreen({
  initial,
  step = 3,
  total = 3,
  onBack,
  onClose,
  onRetrySave,
  onReview,
  onDemoAll,
}: Props) {
  const insets = useSafeAreaInsets();
  const [minutes, setMinutes] = useState(initial?.minutes ?? 5 * 60 + 30);
  const [fallAsleep, setFallAsleep] = useState<FallAsleepId>(
    initial?.fallAsleep ?? "30to60"
  );
  const [nightWakes, setNightWakes] = useState<NightWakesId>(
    initial?.nightWakes ?? "1to2"
  );
  const [earlyWake, setEarlyWake] = useState<EarlyWakeId>(
    initial?.earlyWake ?? "yes"
  );

  const adjust = (delta: number) => {
    setMinutes((prev) =>
      Math.min(MAX_SLEEP, Math.max(MIN_SLEEP, prev + delta))
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
          <Text style={styles.headerTitle}>Отметка</Text>
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

        <View style={styles.progressWrap}>
          <SegmentBar step={step} total={total} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <AlertBanner
            title="Не удалось сохранить отметку"
            body="Ответы остались в черновике. Врач их ещё не получил. Повторите сохранение."
          />

          <View style={styles.card}>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Меньше"
                onPress={() => adjust(-STEP_MIN)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>

              <View style={styles.stepperCenter}>
                <Text style={styles.duration}>{formatDuration(minutes)}</Text>
                <Text style={styles.durationSub}>удалось поспать</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Больше"
                onPress={() => adjust(STEP_MIN)}
                style={({ pressed }) => [
                  styles.stepBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Как быстро уснули?</Text>
            <ChipRow
              options={FALL_ASLEEP}
              value={fallAsleep}
              onChange={setFallAsleep}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Просыпались ночью?</Text>
            <ChipRow
              options={NIGHT_WAKES}
              value={nightWakes}
              onChange={setNightWakes}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Проснулись рано и не смогли уснуть?
            </Text>
            <ChipRow
              options={EARLY_WAKE}
              value={earlyWake}
              onChange={setEarlyWake}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Повторить сохранение"
            onPress={() =>
              onRetrySave?.({ minutes, fallAsleep, nightWakes, earlyWake })
            }
          />
          <SecondaryButton label="Проверить ответы" onPress={onReview} />
          {onDemoAll ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDemoAll}
              style={({ pressed }) => [
                styles.demoLink,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.demoText}>Демо · все ошибки</Text>
            </Pressable>
          ) : null}
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
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
  progressWrap: { marginTop: 12 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(59, 120, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "500",
    color: colors.ink,
  },
  stepperCenter: {
    alignItems: "center",
    flex: 1,
  },
  duration: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.ink,
  },
  durationSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexGrow: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  chipTextIdle: { color: colors.ink },
  chipTextSelected: { color: colors.white },
  footer: { gap: 12 },
  demoLink: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  demoText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
