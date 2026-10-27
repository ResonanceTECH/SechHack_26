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
import { colors } from "../theme/colors";

type DayOption = {
  id: string;
  weekday: string;
  day: number;
  label: string;
};

type Props = {
  onBack?: () => void;
  onSubmit?: (payload: { dateId: string; time: string }) => void;
};

const DAYS: DayOption[] = [
  { id: "26", weekday: "Пн", day: 26, label: "Понедельник, 26 октября" },
  { id: "27", weekday: "Вт", day: 27, label: "Вторник, 27 октября" },
  { id: "28", weekday: "Ср", day: 28, label: "Среда, 28 октября" },
  { id: "29", weekday: "Чт", day: 29, label: "Четверг, 29 октября" },
  { id: "30", weekday: "Пт", day: 30, label: "Пятница, 30 октября" },
];

const TIMES = ["10:00", "11:30", "15:00", "16:30", "18:00"] as const;

export function RescheduleAppointmentScreen({ onBack, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [dateId, setDateId] = useState("27");
  const [time, setTime] = useState<string>("11:30");

  const selectedDay = useMemo(
    () => DAYS.find((d) => d.id === dateId) ?? DAYS[1],
    [dateId]
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
          <Text style={styles.headerTitle}>Перенос приёма</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Выберите удобное время</Text>
          <Text style={styles.subtitle}>
            Врач подтвердит новое время. До этого действует текущая запись.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysRow}
          >
            {DAYS.map((day) => {
              const selected = dateId === day.id;
              return (
                <Pressable
                  key={day.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setDateId(day.id)}
                  style={({ pressed }) => [
                    styles.dayCard,
                    selected ? styles.daySelected : styles.dayIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayWeekday,
                      selected && styles.dayTextSelected,
                    ]}
                  >
                    {day.weekday}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      selected && styles.dayTextSelected,
                    ]}
                  >
                    {day.day}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.dateLabel}>{selectedDay.label}</Text>

          <View style={styles.times}>
            {TIMES.map((slot) => {
              const selected = time === slot;
              return (
                <Pressable
                  key={slot}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setTime(slot)}
                  style={({ pressed }) => [
                    styles.timeChip,
                    selected ? styles.timeSelected : styles.timeIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selected ? styles.timeTextSelected : styles.timeTextIdle,
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => onSubmit?.({ dateId, time })}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Отправить запрос</Text>
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
    paddingTop: 28,
    paddingBottom: 20,
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
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  daysRow: {
    gap: 10,
    paddingRight: 8,
  },
  dayCard: {
    width: 64,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayIdle: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "rgba(27, 36, 64, 0.08)",
  },
  daySelected: {
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  dayWeekday: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.muted,
  },
  dayNumber: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.ink,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dateLabel: {
    marginTop: 22,
    marginBottom: 14,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  times: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    minWidth: 96,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  timeIdle: {
    backgroundColor: colors.white,
    borderColor: "rgba(27, 36, 64, 0.12)",
  },
  timeSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  timeText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  timeTextIdle: { color: colors.ink },
  timeTextSelected: { color: colors.white },
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
