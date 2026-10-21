import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Severity = "mild" | "moderate" | "severe";
type Onset = "today" | "yesterday" | "2to3";

type Props = {
  title?: string;
  onBack?: () => void;
  onSend?: () => void;
  onOpenCamera?: () => void;
};

const SEVERITY: { id: Severity; label: string }[] = [
  { id: "mild", label: "Слабо" },
  { id: "moderate", label: "Умеренно" },
  { id: "severe", label: "Сильно" },
];

const ONSET: { id: Onset; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "yesterday", label: "Вчера" },
  { id: "2to3", label: "2–3 дня" },
];

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

function PillIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
        stroke="#7B6CFF"
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M11 13 L13.5 10.5"
        stroke="#7B6CFF"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M4 11.5 L20 4 L13.5 20 L11 13 Z"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SymptomDetailScreen({
  title = "Сыпь и зуд",
  onBack,
  onSend,
  onOpenCamera,
}: Props) {
  const insets = useSafeAreaInsets();
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [onset, setOnset] = useState<Onset>("yesterday");
  const [hasPhoto, setHasPhoto] = useState(true);

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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Насколько выражено?</Text>
            <ChipRow
              options={SEVERITY}
              value={severity}
              onChange={setSeverity}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Когда появилось?</Text>
            <ChipRow options={ONSET} value={onset} onChange={setOnset} />
          </View>

          <View style={styles.card}>
            <View style={styles.photoHeader}>
              <Text style={styles.cardTitle}>Фото</Text>
              <Text style={styles.optional}>по желанию</Text>
            </View>
            <View style={styles.photoRow}>
              {hasPhoto ? (
                <Pressable
                  onLongPress={() => setHasPhoto(false)}
                  style={styles.photoPreview}
                />
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setHasPhoto(true);
                  onOpenCamera?.();
                }}
                style={({ pressed }) => [
                  styles.cameraBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cameraPlus}>+</Text>
                <Text style={styles.cameraLabel}>Камера</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.medBanner}>
            <PillIcon />
            <View style={styles.medText}>
              <Text style={styles.medTitle}>Принимаю Авиандр 20 мг</Text>
              <Text style={styles.medSub}>
                Связь с препаратом оценит врач
              </Text>
            </View>
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={onSend}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          <SendIcon />
          <Text style={styles.btnPrimaryText}>Отправить врачу</Text>
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
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
    minHeight: 42,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  chipTextIdle: { color: colors.ink },
  chipTextSelected: { color: colors.white },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optional: {
    fontSize: 13,
    color: colors.footer,
  },
  photoRow: {
    flexDirection: "row",
    gap: 12,
  },
  photoPreview: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: "#F2C4B0",
  },
  cameraBtn: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cameraPlus: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "500",
    color: colors.brand,
  },
  cameraLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
  },
  medBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFEAFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  medText: { flex: 1 },
  medTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  medSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B5FBF",
  },
  btnPrimary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
