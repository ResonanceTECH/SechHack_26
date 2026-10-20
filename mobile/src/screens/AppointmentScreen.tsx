import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  initiallyConfirmed?: boolean;
  onBack?: () => void;
  onDone?: () => void;
  onReschedule?: () => void;
};

const checklist = [
  "Список вопросов к врачу",
  "Упаковку лекарства",
] as const;

function BuildingIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 8 H11 M13 8 H15 M9 12 H11 M13 12 H15 M9 16 H15"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.5 L10 17 L18.5 7.5"
        stroke={colors.brand}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function AppointmentScreen({
  initiallyConfirmed = false,
  onBack,
  onDone,
  onReschedule,
}: Props) {
  const insets = useSafeAreaInsets();
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);

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
          <Text style={styles.headerTitle}>Приём</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <View
              style={[
                styles.badge,
                confirmed ? styles.badgeConfirmed : styles.badgePending,
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  confirmed ? styles.dotConfirmed : styles.dotPending,
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  confirmed ? styles.badgeTextConfirmed : styles.badgeTextPending,
                ]}
              >
                {confirmed ? "Вы подтвердили" : "Ждёт подтверждения"}
              </Text>
            </View>
            <Text style={styles.heroTitle}>Сб, 24 октября · 14:00</Text>
            <Text style={styles.heroSub}>Повторный приём · очно</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>ЕС</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Смирнова Е. С.</Text>
                <Text style={styles.rowSub}>Врач-психиатр</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.buildingIcon}>
                <BuildingIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Клиника «Равновесие»</Text>
                <Text style={styles.rowSub}>
                  ул. Лесная, 8 · кабинет 214
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.checklistTitle}>Что взять с собой</Text>
            {checklist.map((item) => (
              <View key={item} style={styles.checkRow}>
                <CheckMark />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.checklistNote}>
              Отчёт о вашем самочувствии врач получит автоматически.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (confirmed) {
                onDone?.();
                return;
              }
              setConfirmed(true);
            }}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>
              {confirmed ? "Готово" : "Подтвердить приём"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onReschedule}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnSecondaryText}>Перенести</Text>
          </Pressable>
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
  scroll: { flex: 1, marginTop: 20 },
  scrollContent: {
    paddingBottom: 20,
    gap: 14,
  },
  hero: {
    backgroundColor: colors.brand,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgePending: {
    backgroundColor: "#F5E6C8",
  },
  badgeConfirmed: {
    backgroundColor: "#D8F5E4",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotPending: { backgroundColor: "#C47A3A" },
  dotConfirmed: { backgroundColor: "#1F9A5A" },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  badgeTextPending: { color: "#9A6B1A" },
  badgeTextConfirmed: { color: "#1F6B52" },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.white,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.85)",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  buildingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EEF1F8",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27,36,64,0.1)",
    marginVertical: 14,
    marginLeft: 60,
  },
  checklistTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.ink,
  },
  checklistNote: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.footer,
  },
  footer: {
    gap: 12,
    paddingTop: 8,
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
  btnSecondary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "rgba(27, 36, 64, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
