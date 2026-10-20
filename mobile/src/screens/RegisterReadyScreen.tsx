import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { Toggle } from "../components/Toggle";
import { colors } from "../theme/colors";

type ReminderTime = "09:00" | "14:00" | "20:00";

type Props = {
  name?: string;
  onGoHome?: () => void;
};

const REMINDERS: ReminderTime[] = ["09:00", "14:00", "20:00"];

function MoodIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Circle cx="9" cy="10" r="1.2" fill={colors.brand} />
      <Circle cx="15" cy="10" r="1.2" fill={colors.brand} />
      <Path
        d="M8.5 14.5 C10 16.2 14 16.2 15.5 14.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function ClipboardIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
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

const calendarGreen = "#2FBF6B";

function CalendarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2.5"
        stroke={calendarGreen}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8 3.5 V6.5 M16 3.5 V6.5 M4 9.5 H20"
        stroke={calendarGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M8 13 H10 M12 13 H14 M16 13 H16.01 M8 16.5 H10 M12 16.5 H14"
        stroke={calendarGreen}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function RegisterReadyScreen({ name = "Анна", onGoHome }: Props) {
  const insets = useSafeAreaInsets();
  const [reminder, setReminder] = useState<ReminderTime>("09:00");
  const [quietHours, setQuietHours] = useState(true);

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Всё готово, {name}</Text>
          <Text style={styles.subtitle}>Так будет устроено наблюдение</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBlue}>
                <MoodIcon />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Каждый день — отметка</Text>
                <Text style={styles.rowSub}>5 секунд. Когда напоминать?</Text>
                <View style={styles.times}>
                  {REMINDERS.map((time) => {
                    const selected = reminder === time;
                    return (
                      <Pressable
                        key={time}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setReminder(time)}
                        style={({ pressed }) => [
                          styles.timeChip,
                          selected ? styles.timeSelected : styles.timeIdle,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            selected
                              ? styles.timeTextSelected
                              : styles.timeTextIdle,
                          ]}
                        >
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconBlue}>
                <ClipboardIcon />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Раз в 2 недели — опросники</Text>
                <Text style={styles.rowSub}>Следующий 18 октября</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconGreen}>
                <CalendarIcon />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>Первый приём у врача</Text>
                <Text style={styles.rowSub}>Сб, 10 октября · 12:00</Text>
              </View>
            </View>
          </View>

          <View style={styles.quietCard}>
            <View style={styles.quietText}>
              <Text style={styles.rowTitle}>Тихие часы</Text>
              <Text style={styles.rowSub}>22:00–9:00 без уведомлений</Text>
            </View>
            <Toggle value={quietHours} onValueChange={setQuietHours} />
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={onGoHome}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>На главную</Text>
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
  scroll: { flex: 1 },
  scrollContent: {
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 14,
  },
  iconBlue: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGreen: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DDF5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  times: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  timeChip: {
    minWidth: 64,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
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
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  timeTextIdle: { color: colors.ink },
  timeTextSelected: { color: colors.white },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27,36,64,0.1)",
    marginLeft: 56,
  },
  quietCard: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quietText: { flex: 1 },
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
