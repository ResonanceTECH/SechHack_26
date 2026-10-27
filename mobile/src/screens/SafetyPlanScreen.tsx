import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onCallDoctor?: () => void;
  onCallContact?: () => void;
  onEmergency?: () => void;
};

const red = "#D63A31";
const softPink = "#FDECEC";
const helps = [
  "Прогулка",
  "Дыхание 4-7-8",
  "Тёплый душ",
  "Позвонить сестре",
] as const;

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

function Chevron({ light }: { light?: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M9 5 L16 12 L9 19"
        stroke={light ? colors.white : colors.footer}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function PhoneIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M7.5 4.5 H10 L11.2 8.2 L9.3 9.5 C10.2 11.4 11.6 12.8 13.5 13.7 L14.8 11.8 L18.5 13 V15.5 C18.5 16.6 17.6 17.5 16.5 17.5 C10.7 17.5 6 12.8 6 7 C6 5.9 6.9 5 8 5"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PeopleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M9 10 C10.7 10 12 8.7 12 7 C12 5.3 10.7 4 9 4 C7.3 4 6 5.3 6 7 C6 8.7 7.3 10 9 10 Z"
        stroke={red}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M16 10.5 C17.4 10.5 18.5 9.4 18.5 8 C18.5 6.6 17.4 5.5 16 5.5 C14.6 5.5 13.5 6.6 13.5 8 C13.5 9.4 14.6 10.5 16 10.5 Z"
        stroke={red}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M3.5 19 C4 15.8 6 14.5 9 14.5 C12 14.5 14 15.8 14.5 19"
        stroke={red}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M14.5 19 C15 16.8 16.2 15.8 18 15.8 C19.8 15.8 20.8 16.8 21.2 19"
        stroke={red}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function WarnIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L21 19.5 H3 Z"
        stroke={red}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={red}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12 17.2 V17.4"
        stroke={red}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SafetyPlanScreen({
  onBack,
  onCallDoctor,
  onCallContact,
  onEmergency,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["rgba(255, 200, 196, 0.95)", "rgba(244,246,252,0)", colors.bgApp]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />
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
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>План безопасности</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headline}>Если станет очень тяжело</Text>
          <Text style={styles.subheadline}>
            Вы не одни. Начните с первого шага.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onCallDoctor}
            style={({ pressed }) => [
              styles.actionRed,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionIconLight}>
              <PhoneIcon color={red} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitleLight}>Позвонить врачу</Text>
              <Text style={styles.actionSubLight}>
                Смирнова Е. С. · будни 9–18
              </Text>
            </View>
            <Chevron light />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onCallContact}
            style={({ pressed }) => [
              styles.actionWhite,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionIconPink}>
              <PeopleIcon />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Позвонить Марии</Text>
              <Text style={styles.actionSub}>
                Сестра · доверенный контакт
              </Text>
            </View>
            <Chevron />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onEmergency}
            style={({ pressed }) => [
              styles.actionWhite,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionIconPink}>
              <WarnIcon />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Срочная помощь 103 / 112</Text>
              <Text style={styles.actionSub}>Если есть угроза жизни</Text>
            </View>
            <Chevron />
          </Pressable>

          <View style={styles.helpsCard}>
            <Text style={styles.helpsTitle}>Что мне помогает</Text>
            <View style={styles.chips}>
              {helps.map((label) => (
                <View key={label} style={styles.chip}>
                  <Text style={styles.chipText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  content: { flex: 1, paddingHorizontal: 20 },
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
    fontWeight: "700",
    color: colors.ink,
  },
  scrollContent: { gap: 12, paddingBottom: 12 },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 8,
  },
  actionRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: red,
    borderRadius: 22,
    padding: 16,
  },
  actionWhite: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
  },
  actionIconLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconPink: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: softPink,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1 },
  actionTitleLight: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  actionSubLight: {
    marginTop: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  actionSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  helpsCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
  },
  helpsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(27, 36, 64, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    color: colors.ink,
  },
  pressed: { opacity: 0.88 },
});
