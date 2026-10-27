import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type ReasonId =
  | "forgot"
  | "unwell"
  | "sideEffects"
  | "outOfPills"
  | "other";

type Props = {
  nextDoseLabel?: string;
  onBack?: () => void;
  onSave?: (reason: ReasonId) => void;
};

const REASONS: { id: ReasonId; label: string }[] = [
  { id: "forgot", label: "Забыл(а)" },
  { id: "unwell", label: "Плохо себя чувствую" },
  { id: "sideEffects", label: "Побочные эффекты" },
  { id: "outOfPills", label: "Закончились таблетки" },
  { id: "other", label: "Другое" },
];

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

function InfoIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 11 V16.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12 7.8 V8"
        stroke={colors.brand}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SkipDoseScreen({
  nextDoseLabel = "21:00",
  onBack,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ReasonId>("forgot");

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
          <Text style={styles.title}>Пропуск приёма</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.headline}>Почему пропустили?</Text>
        <Text style={styles.sub}>
          Врач увидит причину — это поможет подобрать удобную схему.
        </Text>

        <View style={styles.chips}>
          {REASONS.map((r) => {
            const selected = reason === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setReason(r.id)}
                style={[
                  styles.chip,
                  selected ? styles.chipOn : styles.chipOff,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected ? styles.chipTextOn : styles.chipTextOff,
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <InfoIcon />
          <Text style={styles.infoText}>
            Не принимайте двойную дозу. Следующую таблетку — в обычное время, в{" "}
            {nextDoseLabel}.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => onSave?.(reason)}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveText}>Сохранить</Text>
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
    marginBottom: 18,
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
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipOn: { backgroundColor: colors.brand },
  chipOff: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(27,36,64,0.1)",
  },
  chipText: { fontSize: 15, fontWeight: "600" },
  chipTextOn: { color: colors.white },
  chipTextOff: { color: colors.ink },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.brandSoft,
    borderRadius: 16,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brand,
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },
});
