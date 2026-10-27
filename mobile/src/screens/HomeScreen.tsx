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
  name?: string;
  initials?: string;
  onProfile?: () => void;
  onSos?: () => void;
  onNotifications?: () => void;
  onMood?: (value: number) => void;
  onTakeMed?: () => void;
  onQuestionnaire?: () => void;
  onConfirmVisit?: () => void;
  onRescheduleVisit?: () => void;
  onAddAction?: (action: AddEntryAction) => void;
  onTab?: (tab: MainTabId) => void;
};

const MOODS = [
  { id: 1, bg: "#FF6B6B", mouth: "sad" as const },
  { id: 2, bg: "#FF9F43", mouth: "flat" as const },
  { id: 3, bg: "#F7C948", mouth: "neutral" as const },
  { id: 4, bg: "#A8D65B", mouth: "smile" as const },
  { id: 5, bg: "#4CD964", mouth: "grin" as const },
];

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 5) return "Доброй ночи,";
  if (h < 12) return "Доброе утро,";
  if (h < 18) return "Добрый день,";
  return "Добрый вечер,";
}

function MoodFace({
  bg,
  mouth,
}: {
  bg: string;
  mouth: "sad" | "flat" | "neutral" | "smile" | "grin";
}) {
  const mouthPath =
    mouth === "sad"
      ? "M9 16.5 C10.5 14.8 13.5 14.8 15 16.5"
      : mouth === "flat"
        ? "M9 16 H15"
        : mouth === "neutral"
          ? "M9.5 16 H14.5"
          : mouth === "smile"
            ? "M8.5 14.5 C10 16.2 14 16.2 15.5 14.5"
            : "M8 14 C10 17.5 14 17.5 16 14";

  return (
    <View style={[styles.moodFace, { backgroundColor: bg }]}>
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Circle cx="9" cy="10" r="1.3" fill="#1B2440" />
        <Circle cx="15" cy="10" r="1.3" fill="#1B2440" />
        <Path
          d={mouthPath}
          stroke="#1B2440"
          strokeWidth={1.7}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

function HeartSos() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M12 20 S4.5 15.2 4.5 9.8 C4.5 7.2 6.5 5.5 8.8 5.5 C10.2 5.5 11.4 6.2 12 7.2 C12.6 6.2 13.8 5.5 15.2 5.5 C17.5 5.5 19.5 7.2 19.5 9.8 C19.5 15.2 12 20 12 20 Z"
        fill="#FF4D6A"
      />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 3 C9 3 7 5.2 7 8 V12 L5 15 H19 L17 12 V8 C17 5.2 15 3 12 3 Z"
        stroke={colors.ink}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M10 18 C10.5 19.2 11.2 20 12 20 C12.8 20 13.5 19.2 14 18"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M7 9.5 H17 A3.5 3.5 0 0 1 17 16.5 H7 A3.5 3.5 0 0 1 7 9.5 Z"
        stroke="#7B6CFF"
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M12 9.5 V16.5"
        stroke="#7B6CFF"
        strokeWidth={1.8}
        strokeLinecap="round"
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
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8 3.5 V6.5 M16 3.5 V6.5 M4 9.5 H20"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function HomeScreen({
  name = "Анна",
  initials = "АМ",
  onProfile,
  onSos,
  onNotifications,
  onMood,
  onTakeMed,
  onQuestionnaire,
  onConfirmVisit,
  onRescheduleVisit,
  onAddAction,
  onTab,
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
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Профиль"
              onPress={onProfile}
              style={({ pressed }) => [
                styles.profile,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View>
                <Text style={styles.greeting}>{greetingForNow()}</Text>
                <Text style={styles.name}>{name}</Text>
              </View>
            </Pressable>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                onPress={onSos}
                style={({ pressed }) => [
                  styles.sosBtn,
                  pressed && styles.pressed,
                ]}
              >
                <HeartSos />
                <Text style={styles.sosText}>SOS</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onNotifications}
                style={({ pressed }) => [
                  styles.bellBtn,
                  pressed && styles.pressed,
                ]}
              >
                <BellIcon />
              </Pressable>
            </View>
          </View>

          <View style={styles.moodCard}>
            <Text style={styles.moodTitle}>Как вы сегодня?</Text>
            <Text style={styles.moodSub}>Отметка займёт 5 секунд</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Настроение ${m.id}`}
                  onPress={() => onMood?.(m.id)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <MoodFace bg={m.bg} mouth={m.mouth} />
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Сегодня</Text>

          <Pressable
            onPress={onTakeMed}
            style={({ pressed }) => [
              styles.taskCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.taskIconPurple}>
              <PillIcon />
            </View>
            <View style={styles.taskText}>
              <Text style={styles.taskTitle}>Авиандр 20 мг</Text>
              <Text style={styles.taskSub}>Утро · 09:30</Text>
            </View>
            <Pressable
              onPress={onTakeMed}
              style={({ pressed }) => [
                styles.takeBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.takeBtnText}>Принять</Text>
            </Pressable>
          </Pressable>

          <Pressable
            onPress={onQuestionnaire}
            style={({ pressed }) => [
              styles.taskCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.taskIconBlue}>
              <ClipboardIcon />
            </View>
            <View style={styles.taskText}>
              <Text style={styles.taskTitle}>Опросник от врача</Text>
              <Text style={styles.taskSub}>Повторный · 3 минуты</Text>
            </View>
            <View style={styles.newBadge}>
              <View style={styles.newDot} />
              <Text style={styles.newText}>Новое</Text>
            </View>
          </Pressable>

          <View style={styles.visitCard}>
            <View style={styles.visitTop}>
              <View style={styles.visitIcon}>
                <CalendarIcon />
              </View>
              <View style={styles.visitText}>
                <Text style={styles.visitTitle}>Сб, 24 октября · 14:00</Text>
                <Text style={styles.visitSub}>
                  Смирнова Е. С. · кабинет 214
                </Text>
              </View>
            </View>
            <View style={styles.visitActions}>
              <Pressable
                onPress={onConfirmVisit}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmText}>Подтвердить</Text>
              </Pressable>
              <Pressable
                onPress={onRescheduleVisit}
                style={({ pressed }) => [
                  styles.rescheduleBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.rescheduleText}>Перенести</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <MainTabBar
          active="home"
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
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
  greeting: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.ink,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sosBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sosText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF4D6A",
  },
  bellBtn: {
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
  moodCard: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  moodTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.white,
  },
  moodSub: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.85)",
  },
  moodRow: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodFace: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.ink,
  },
  taskCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  taskIconPurple: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFEAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  taskIconBlue: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: { flex: 1 },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  taskSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  takeBtn: {
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 120, 255, 0.12)",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  takeBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  newText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
  visitCard: {
    marginTop: 4,
    backgroundColor: "#E8EEFF",
    borderRadius: 24,
    padding: 16,
  },
  visitTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  visitIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  visitText: { flex: 1 },
  visitTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  visitSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  visitActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  rescheduleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "rgba(27, 36, 64, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  rescheduleText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },
});
