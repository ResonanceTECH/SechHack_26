import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onClose?: () => void;
  onStart?: () => void;
  onRemindLater?: () => void;
};

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

function BellIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 3 C9 3 7 5.2 7 8 V12 L5 15 H19 L17 12 V8 C17 5.2 15 3 12 3 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M10 18 C10.5 19.2 11.2 20 12 20 C12.8 20 13.5 19.2 14 18"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function FollowUpQuestionnaireIntroScreen({
  onBack,
  onClose,
  onStart,
  onRemindLater,
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
          <Text style={styles.headerTitle}>Опросник</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
            onPress={onClose ?? onBack}
            style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke={colors.ink}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.doctorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>ЕС</Text>
            </View>
            <View style={styles.doctorText}>
              <Text style={styles.doctorName}>Е. С. Смирнова</Text>
              <Text style={styles.doctorSub}>
                просит пройти опросник повторно
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            Как вы себя чувствовали эти 2 недели?
          </Text>
          <Text style={styles.subtitle}>
            Те же вопросы, что 4 октября. Покажем, что изменилось.
          </Text>

          <View style={styles.modulesCard}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <MoodIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Настроение</Text>
                <Text style={styles.rowSub}>PHQ-9 · 9 вопросов</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.icon}>
                <HeartIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Тревога</Text>
                <Text style={styles.rowSub}>GAD-7 · 7 вопросов</Text>
              </View>
            </View>
          </View>

          <View style={styles.tags}>
            {["≈ 3 минуты", "Можно пропустить"].map((tag) => (
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
            onPress={onRemindLater}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <BellIcon />
            <Text style={styles.btnSecondaryText}>Напомнить вечером</Text>
          </Pressable>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
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
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 16 },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  doctorText: { flex: 1 },
  doctorName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  doctorSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
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
  modulesCard: {
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
  icon: {
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
  footer: { gap: 12, paddingTop: 8 },
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
    backgroundColor: "rgba(59, 120, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnSecondaryText: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
