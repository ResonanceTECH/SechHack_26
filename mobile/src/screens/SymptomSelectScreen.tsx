import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

export type SymptomId =
  | "drowsiness"
  | "dizziness"
  | "weakness"
  | "nausea"
  | "headache"
  | "restless"
  | "insomnia"
  | "anxietyUp"
  | "rash"
  | "itch"
  | "swelling"
  | "breathing";

type Symptom = {
  id: SymptomId;
  label: string;
  urgent?: boolean;
};

type Props = {
  onBack?: () => void;
  onContinue?: (selected: SymptomId[]) => void;
  onOwnWords?: () => void;
  onUrgent?: (id: SymptomId) => void;
};

const SECTIONS: { title: string; items: Symptom[] }[] = [
  {
    title: "Тело",
    items: [
      { id: "drowsiness", label: "Сонливость" },
      { id: "dizziness", label: "Головокружение" },
      { id: "weakness", label: "Слабость" },
      { id: "nausea", label: "Тошнота" },
      { id: "headache", label: "Головная боль" },
    ],
  },
  {
    title: "Состояние",
    items: [
      { id: "restless", label: "Не могу усидеть на месте" },
      { id: "insomnia", label: "Бессонница" },
      { id: "anxietyUp", label: "Тревога сильнее" },
    ],
  },
  {
    title: "Кожа и аллергия",
    items: [
      { id: "rash", label: "Сыпь" },
      { id: "itch", label: "Зуд" },
      { id: "swelling", label: "Отёк лица или губ", urgent: true },
      { id: "breathing", label: "Трудно дышать", urgent: true },
    ],
  },
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

export function SymptomSelectScreen({
  onBack,
  onContinue,
  onOwnWords,
  onUrgent,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<SymptomId[]>([
    "drowsiness",
    "rash",
    "itch",
  ]);

  const count = selected.length;
  const canNext = count > 0;

  const toggle = (id: SymptomId, urgent?: boolean) => {
    if (urgent) {
      onUrgent?.(id);
      return;
    }
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const title = useMemo(
    () => (canNext ? `Далее · выбрано ${count}` : "Далее"),
    [canNext, count]
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
          <Text style={styles.headerTitle}>Самочувствие</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Что вы замечаете?</Text>
          <Text style={styles.subtitle}>
            Отметьте всё, что подходит — можно несколько.
          </Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.chips}>
                {section.items.map((item) => {
                  const isOn = selected.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isOn }}
                      onPress={() => toggle(item.id, item.urgent)}
                      style={({ pressed }) => [
                        styles.chip,
                        item.urgent
                          ? isOn
                            ? styles.chipUrgentSelected
                            : styles.chipUrgent
                          : isOn
                            ? styles.chipSelected
                            : styles.chipIdle,
                        pressed && styles.pressed,
                      ]}
                    >
                      {item.urgent ? <View style={styles.urgentDot} /> : null}
                      <Text
                        style={[
                          styles.chipText,
                          item.urgent
                            ? styles.chipTextUrgent
                            : isOn
                              ? styles.chipTextSelected
                              : styles.chipTextIdle,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={styles.legend}>
            <View style={styles.urgentDot} />
            <Text style={styles.legendText}>
              Красные — нужна срочная помощь
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={!canNext}
            onPress={() => onContinue?.(selected)}
            style={({ pressed }) => [
              styles.btnPrimary,
              !canNext && styles.btnDisabled,
              pressed && canNext && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>{title}</Text>
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
            <Text style={styles.btnSecondaryText}>Описать своими словами</Text>
          </Pressable>
        </View>
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
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 24, paddingBottom: 16 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  chipIdle: {
    backgroundColor: colors.white,
    borderColor: "rgba(27, 36, 64, 0.12)",
  },
  chipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipUrgent: {
    backgroundColor: "#FFE4E6",
    borderColor: "transparent",
  },
  chipUrgentSelected: {
    backgroundColor: "#FFD0D5",
    borderColor: "#E85A6B",
  },
  chipText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  chipTextIdle: { color: colors.ink },
  chipTextSelected: { color: colors.white },
  chipTextUrgent: { color: "#B04050" },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E85A6B",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  legendText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  footer: { gap: 12, paddingTop: 8 },
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
