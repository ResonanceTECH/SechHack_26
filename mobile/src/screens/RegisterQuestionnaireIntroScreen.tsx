import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onStart?: () => void;
  onSkip?: () => void;
};

function ClipboardIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 4.5 H15 V6.8 H9 Z"
        stroke={colors.brand}
        strokeWidth={1.5}
        fill="none"
      />
      <Path
        d="M9 11.2 L10.8 13 L14.5 9.2"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9 16.5 H15"
        stroke={colors.brand}
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

function HeartIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 20 S4.5 15.2 4.5 9.8 C4.5 7.2 6.5 5.5 8.8 5.5 C10.2 5.5 11.4 6.2 12 7.2 C12.6 6.2 13.8 5.5 15.2 5.5 C17.5 5.5 19.5 7.2 19.5 9.8 C19.5 15.2 12 20 12 20 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAGS = ["≈ 3 минуты", "Можно пропустить", "Не диагноз"] as const;

export function RegisterQuestionnaireIntroScreen({
  onBack,
  onStart,
  onSkip,
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
          <Text style={styles.headerTitle}>Опросник</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressWrap}>
          <StepProgress step={5} total={5} label="Опросник" />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroCircle}>
              <ClipboardIcon />
            </View>
          </View>

          <Text style={styles.title}>Два коротких опросника</Text>
          <Text style={styles.subtitle}>
            Помогут врачу понять, как вы себя чувствовали последние 2 недели.
          </Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MoodIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Настроение</Text>
                <Text style={styles.rowSub}>PHQ-9 · 9 вопросов</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <HeartIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Тревога</Text>
                <Text style={styles.rowSub}>GAD-7 · 7 вопросов</Text>
              </View>
            </View>
          </View>

          <View style={styles.tags}>
            {TAGS.map((tag) => (
              <View key={tag} style={styles.tag}>
                <View style={styles.tagDot} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Начать</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onSkip}
            style={({ pressed }) => [
              styles.skipWrap,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.skipText}>Пройду позже</Text>
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
    paddingTop: 24,
    paddingBottom: 20,
  },
  hero: {
    height: 148,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B2440",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    marginTop: 24,
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
    marginTop: 20,
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
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brandSoft,
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
    marginLeft: 56,
  },
  tags: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(27, 36, 64, 0.06)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.muted,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: colors.muted,
  },
  footer: {
    gap: 14,
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
  skipWrap: {
    alignItems: "center",
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
