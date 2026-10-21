import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

export type MedicationDoseState = "pending" | "taken" | "skipped" | "paused";

type Props = {
  morning?: MedicationDoseState;
  evening?: MedicationDoseState;
  paused?: boolean;
  onBack?: () => void;
  onInstruction?: () => void;
  onTakeMorning?: () => void;
  onSkipMorning?: () => void;
  onSideEffect?: () => void;
  onWriteDoctor?: () => void;
};

const pillPurple = "#7B6CFF";
const green = "#2FBF6B";
const warnBg = "#FFF6E5";
const warnInk = "#9A6B2F";
const softRed = "#FDECEC";
const inkRed = "#C47A3A";

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

function DocIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M7 4 H14 L18 8 V20 H7 Z"
        stroke={colors.ink}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M14 4 V8 H18"
        stroke={colors.ink}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M10 12 H15 M10 15.5 H13.5"
        stroke={colors.ink}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M7 9.5 H17 A3.5 3.5 0 0 1 17 16.5 H7 A3.5 3.5 0 0 1 7 9.5 Z"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M12 9.5 V16.5"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 4 C7.6 4 4 7.6 4 12 C4 16.4 7.6 20 12 20 C16.4 20 20 16.4 20 12 C20 7.6 16.4 4 12 4 Z"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 8 V12.5 L15 14.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.5 L10 17 L18.5 7.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M7 7 L17 17 M17 7 L7 17"
        stroke={inkRed}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function WarnTriangle() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L21 19.5 H3 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M12 17.2 V17.4"
        stroke={colors.brand}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L21 19.5 H3 Z"
        stroke={warnInk}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={warnInk}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M12 17.2 V17.4"
        stroke={warnInk}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MedicationScreen({
  morning = "pending",
  evening = "pending",
  paused = false,
  onBack,
  onInstruction,
  onTakeMorning,
  onSkipMorning,
  onSideEffect,
  onWriteDoctor,
}: Props) {
  const insets = useSafeAreaInsets();
  const dosesTaken =
    (morning === "taken" ? 1 : 0) + (evening === "taken" ? 1 : 0) + 25;

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
          <Text style={styles.title}>Препарат</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Инструкция"
            onPress={onInstruction}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <DocIcon />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {paused ? (
            <View style={styles.pauseCard}>
              <AlertIcon />
              <View style={styles.pauseText}>
                <Text style={styles.pauseTitle}>
                  Приём приостановлен врачом
                </Text>
                <Text style={styles.pauseSub}>
                  Е. С. Смирнова, 18 окт · до осмотра. Не принимайте, пока врач
                  не разрешит.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.medCard}>
            <View style={styles.medIcon}>
              <PillIcon />
            </View>
            <View style={styles.medInfo}>
              <Text style={styles.medName}>Авиандр® 20 мг</Text>
              <Text style={styles.medInn}>маритупирдин</Text>
              <Text style={styles.medDose}>
                1 таблетка утром и вечером, за 30 минут до еды. Курс до 8
                ноября.
              </Text>
            </View>
          </View>

          <View style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>Сегодня</Text>
              <Text style={styles.dayMeta}>
                принято {dosesTaken} из 28 доз
              </Text>
            </View>

            {morning === "pending" && !paused ? (
              <View style={styles.slotActive}>
                <View style={styles.slotTop}>
                  <ClockIcon color={pillPurple} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotTitlePurple}>Утро · 09:30</Text>
                    <Text style={styles.slotNow}>Сейчас</Text>
                  </View>
                </View>
                <View style={styles.slotActions}>
                  <Pressable
                    onPress={onTakeMorning}
                    style={({ pressed }) => [
                      styles.btnTake,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CheckIcon color={colors.white} />
                    <Text style={styles.btnTakeText}>Принял(а)</Text>
                  </Pressable>
                  <Pressable
                    onPress={onSkipMorning}
                    style={({ pressed }) => [
                      styles.btnSkip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.btnSkipText}>Пропустил(а)</Text>
                  </Pressable>
                </View>
              </View>
            ) : morning === "taken" ? (
              <View style={styles.slotTaken}>
                <CheckIcon color={green} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotTitleGreen}>Утро · 09:30</Text>
                  <Text style={styles.slotSubGreen}>Принято в 09:32</Text>
                </View>
              </View>
            ) : paused ? (
              <View style={styles.slotTaken}>
                <CheckIcon color={green} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotTitleGreen}>Утро · 09:30</Text>
                  <Text style={styles.slotSubGreen}>Принято в 09:32</Text>
                </View>
              </View>
            ) : (
              <View style={styles.slotSkipped}>
                <XIcon />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotTitleBrown}>Утро · 09:30</Text>
                  <Text style={styles.slotSubBrown}>Пропущено</Text>
                </View>
              </View>
            )}

            {paused || evening === "paused" ? (
              <View style={[styles.slotSkipped, { marginTop: 10 }]}>
                <XIcon />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotTitleBrown}>Вечер · 21:00</Text>
                  <Text style={styles.slotSubBrown}>
                    Не принимать — решение врача
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.slotIdle, { marginTop: 10 }]}>
                <ClockIcon color={colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotTitleMuted}>Вечер · 21:00</Text>
                  <Text style={styles.slotSubMuted}>По расписанию</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {paused ? (
          <Pressable
            onPress={onWriteDoctor}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && styles.pressed,
            ]}
          >
            <ChatIcon />
            <Text style={styles.footerBtnText}>Написать врачу</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onSideEffect}
            style={({ pressed }) => [
              styles.footerBtn,
              pressed && styles.pressed,
            ]}
          >
            <WarnTriangle />
            <Text style={styles.footerBtnText}>
              Сообщить о побочном эффекте
            </Text>
          </Pressable>
        )}
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
    marginBottom: 14,
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
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  scrollContent: { gap: 14, paddingBottom: 12 },
  pauseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: warnBg,
    borderRadius: 18,
    padding: 14,
  },
  pauseText: { flex: 1 },
  pauseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: warnInk,
  },
  pauseSub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: warnInk,
  },
  medCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#EFEAFF",
    borderRadius: 22,
    padding: 16,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: pillPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  medInfo: { flex: 1 },
  medName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  medInn: {
    marginTop: 2,
    fontSize: 13,
    color: pillPurple,
  },
  medDose: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  dayMeta: {
    fontSize: 12,
    color: colors.footer,
  },
  slotActive: {
    borderWidth: 1.5,
    borderColor: pillPurple,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  slotTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  slotActions: {
    flexDirection: "row",
    gap: 8,
  },
  btnTake: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnTakeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  btnSkip: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(27,36,64,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSkipText: {
    color: colors.ink,
    fontWeight: "600",
    fontSize: 14,
  },
  slotTaken: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#DDF5E8",
    borderRadius: 14,
    padding: 12,
  },
  slotIdle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(27,36,64,0.04)",
    borderRadius: 14,
    padding: 12,
  },
  slotSkipped: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: softRed,
    borderRadius: 14,
    padding: 12,
  },
  slotTitlePurple: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  slotNow: {
    marginTop: 2,
    fontSize: 13,
    color: pillPurple,
    fontWeight: "600",
  },
  slotTitleGreen: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  slotSubGreen: {
    marginTop: 2,
    fontSize: 13,
    color: green,
  },
  slotTitleMuted: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  slotSubMuted: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  slotTitleBrown: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  slotSubBrown: {
    marginTop: 2,
    fontSize: 13,
    color: inkRed,
  },
  footerBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
