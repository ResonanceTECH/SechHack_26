import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AddEntrySheet,
  type AddEntryAction,
} from "../components/AddEntrySheet";
import { MainTabBar, type MainTabId } from "../components/MainTabBar";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onTab?: (tab: MainTabId) => void;
  onAddAction?: (action: AddEntryAction) => void;
  onMedication?: () => void;
  onBreathing?: () => void;
  onQuestionnaires?: () => void;
  onAppointment?: () => void;
};

const pillPurple = "#7B6CFF";
const green = "#2FBF6B";

function Chevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M9 5 L16 12 L9 19"
        stroke={colors.footer}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function Check() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.5 L10 17 L18.5 7.5"
        stroke={green}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M8.2 15.8 C6.3 13.9 6.3 10.8 8.2 8.9 L10.9 6.2 C12.8 4.3 15.9 4.3 17.8 6.2 C19.7 8.1 19.7 11.2 17.8 13.1 L15.1 15.8 C13.2 17.7 10.1 17.7 8.2 15.8 Z"
        stroke={pillPurple}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M9.6 9.6 L14.4 14.4"
        stroke={pillPurple}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BreathIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M4 9 C8 6 12 12 16 9 C18.5 7.2 20 7.5 21 8"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M4 14 C8 11 12 17 16 14 C18.5 12.2 20 12.5 21 13"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function PulseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M3 12 H7 L9.5 7 L12.5 17 L15 12 H21"
        stroke={green}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function ClipboardIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 4.5 H15 V6.5 H9 Z"
        stroke={colors.brand}
        strokeWidth={1.5}
        fill="none"
      />
      <Path
        d="M9 11 H15 M9 14.5 H13"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8 3.5 V6.5 M16 3.5 V6.5 M4 9.5 H20"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type RowProps = {
  iconBg: string;
  Icon: typeof PillIcon;
  title: string;
  sub: string;
  trailing?: "chevron" | "check";
  onPress?: () => void;
};

function Row({ iconBg, Icon, title, sub, trailing = "chevron", onPress }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {trailing === "check" ? <Check /> : <Chevron />}
    </Pressable>
  );
}

export function TreatmentScreen({
  onTab,
  onAddAction,
  onMedication,
  onBreathing,
  onQuestionnaires,
  onAppointment,
}: Props) {
  const insets = useSafeAreaInsets();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Моё лечение</Text>
          <Text style={styles.subtitle}>
            План от Смирновой Е. С. · обновлён 18 окт
          </Text>

          <Text style={styles.section}>Препараты</Text>
          <View style={styles.card}>
            <Row
              iconBg="#EFEAFF"
              Icon={PillIcon}
              title="Авиандр 20 мг"
              sub="Утром и вечером · 09:30 и 21:00"
              onPress={onMedication}
            />
          </View>

          <Text style={styles.section}>Задания</Text>
          <View style={styles.card}>
            <Row
              iconBg={colors.brandSoft}
              Icon={BreathIcon}
              title="Дыхание 4-7-8"
              sub="5 минут · утром и вечером"
              onPress={onBreathing}
            />
            <View style={styles.divider} />
            <Row
              iconBg="#DDF5E8"
              Icon={PulseIcon}
              title="Прогулка 20 минут"
              sub="Сегодня выполнено"
              trailing="check"
            />
          </View>

          <Text style={styles.section}>Наблюдение</Text>
          <View style={styles.card}>
            <Row
              iconBg={colors.brandSoft}
              Icon={ClipboardIcon}
              title="Опросники тревоги и депрессии"
              sub="Повторный — до 20 октября"
              onPress={onQuestionnaires}
            />
            <View style={styles.divider} />
            <Row
              iconBg={colors.brandSoft}
              Icon={CalendarIcon}
              title="Приём у врача"
              sub="Сб, 24 октября · 14:00"
              onPress={onAppointment}
            />
          </View>
        </ScrollView>

        <MainTabBar
          active="treatment"
          onTab={onTab}
          onAdd={() => setAddOpen(true)}
        />
      </View>

      <AddEntrySheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSelect={onAddAction}
      />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 18, gap: 10 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  section: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27, 36, 64, 0.08)",
    marginLeft: 70,
    marginRight: 14,
  },
  pressed: { opacity: 0.88 },
});
