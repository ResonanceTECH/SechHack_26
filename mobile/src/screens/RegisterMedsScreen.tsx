import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { colors } from "../theme/colors";

export type MedicationItem = {
  id: string;
  name: string;
  form: string;
};

export type AllergyAnswer = "no" | "yes" | "unknown";

type Props = {
  medications?: MedicationItem[];
  takingNothing?: boolean;
  allergy?: AllergyAnswer;
  onTakingNothingChange?: (value: boolean) => void;
  onAllergyChange?: (value: AllergyAnswer) => void;
  onRemoveMedication?: (id: string) => void;
  onBack?: () => void;
  onAddMedication?: () => void;
  onContinue?: () => void;
};

const ALLERGY_OPTIONS: { id: AllergyAnswer; label: string }[] = [
  { id: "no", label: "Нет" },
  { id: "yes", label: "Да" },
  { id: "unknown", label: "Не знаю" },
];

export function RegisterMedsScreen({
  medications = [],
  takingNothing = true,
  allergy = "no",
  onTakingNothingChange,
  onAllergyChange,
  onRemoveMedication,
  onBack,
  onAddMedication,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();

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
          <View>
            <Text style={styles.title}>Лекарства и аллергии</Text>
            <Text style={styles.subtitle}>
              Это важно для безопасности лечения.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Что принимаете сейчас</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: takingNothing }}
              onPress={() => onTakingNothingChange?.(true)}
              style={({ pressed }) => [
                styles.option,
                takingNothing ? styles.optionSelected : styles.optionIdle,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  takingNothing
                    ? styles.optionTextSelected
                    : styles.optionTextIdle,
                ]}
              >
                Ничего не принимаю
              </Text>
            </Pressable>

            {!takingNothing && medications.length > 0 ? (
              <View style={styles.medList}>
                {medications.map((med) => (
                  <View key={med.id} style={styles.medChip}>
                    <View style={styles.medChipText}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medForm}>{med.form}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Удалить"
                      onPress={() => onRemoveMedication?.(med.id)}
                      hitSlop={8}
                    >
                      <Svg width={16} height={16} viewBox="0 0 24 24">
                        <Path
                          d="M6 6 L18 18 M18 6 L6 18"
                          stroke={colors.muted}
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={onAddMedication}
              style={({ pressed }) => [
                styles.addBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.addBtnPlus}>+</Text>
              <Text style={styles.addBtnText}>Добавить лекарство</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Аллергия на лекарства</Text>
            <View style={styles.allergyRow}>
              {ALLERGY_OPTIONS.map((item) => {
                const selected = allergy === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onAllergyChange?.(item.id)}
                    style={({ pressed }) => [
                      styles.allergyChip,
                      selected ? styles.optionSelected : styles.optionIdle,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.allergyText,
                        selected
                          ? styles.optionTextSelected
                          : styles.optionTextIdle,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Далее</Text>
        </Pressable>
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
    gap: 16,
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  option: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  optionIdle: {
    backgroundColor: colors.white,
    borderColor: "rgba(27, 36, 64, 0.12)",
  },
  optionSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  optionTextIdle: { color: colors.ink },
  optionTextSelected: { color: colors.white },
  medList: { gap: 8 },
  medChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3F6FC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  medChipText: { flex: 1 },
  medName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  medForm: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  addBtn: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: "rgba(59, 120, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
  },
  addBtnPlus: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.brand,
  },
  addBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.brand,
  },
  allergyRow: {
    flexDirection: "row",
    gap: 8,
  },
  allergyChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  allergyText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
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
