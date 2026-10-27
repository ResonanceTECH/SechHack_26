import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onStart?: () => void;
};

const severityRed = "#E5484D";

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

function ClipboardIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 4.5 H15 V6.5 H9 Z"
        stroke={colors.white}
        strokeWidth={1.5}
        fill="none"
      />
      <Path
        d="M9 11 H15 M9 14.5 H13"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

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

function ClockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="8"
        stroke={colors.footer}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 8 V12.5 L15 14.5"
        stroke={colors.footer}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function QuestionnairesScreen({ onBack, onStart }: Props) {
  const insets = useSafeAreaInsets();

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
            accessibilityLabel="Назад"
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Опросники</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.activeCard}>
            <View style={styles.activeTop}>
              <View style={styles.activeIcon}>
                <ClipboardIcon />
              </View>
              <View style={styles.activeText}>
                <Text style={styles.activeTitle}>Повторный опросник</Text>
                <Text style={styles.activeSub}>
                  Назначила Е. С. Смирнова · до 20 октября
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onStart}
              style={({ pressed }) => [
                styles.startBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.startBtnText}>Пройти · 3 минуты</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>История</Text>

          <View style={styles.historyCard}>
            <View style={styles.historyIcon}>
              <MoodIcon />
            </View>
            <View style={styles.historyText}>
              <Text style={styles.historyTitle}>4 октября · первый</Text>
              <Text style={styles.historySub}>Настроение 17 · тревога 12</Text>
            </View>
            <View style={styles.severityChip}>
              <View style={styles.severityDot} />
              <Text style={styles.severityText}>Выраженный</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <ClockIcon />
            <Text style={styles.infoText}>
              Раз в 2 недели по назначению врача. Ежедневная отметка — отдельно,
              в «Дневнике».
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    marginBottom: 16,
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
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  scroll: { flex: 1 },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  activeCard: {
    backgroundColor: "rgba(201, 213, 255, 0.45)",
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  activeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  activeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  activeText: { flex: 1 },
  activeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  activeSub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  startBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: { flex: 1 },
  historyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  historySub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  severityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FDECEC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: severityRed,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
    color: severityRed,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  pressed: { opacity: 0.88 },
});
