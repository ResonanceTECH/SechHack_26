import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  name?: string;
  initials?: string;
  onBack?: () => void;
  onDoctorAccess?: () => void;
  onNotificationSettings?: () => void;
  onSafetyPlan?: () => void;
  onMyData?: () => void;
  onLogout?: () => void;
};

const softRed = "#FDECEC";
const inkRed = "#D63A31";

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

function PersonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="9"
        r="3.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M6 19 C6.5 15.5 9 14 12 14 C15 14 17.5 15.5 18 19"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M6 16 H18 L16.5 13.5 V10 C16.5 7.5 14.5 5.5 12 5.5 C9.5 5.5 7.5 7.5 7.5 10 V13.5 Z"
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

function ShieldIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 3.5 L19 6.5 V11.5 C19 16 15.5 19.5 12 20.5 C8.5 19.5 5 16 5 11.5 V6.5 Z"
        stroke={inkRed}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12 L11.2 14.2 L15.5 9.5"
        stroke={inkRed}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="10"
        width="12"
        height="10"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M8.5 10 V8 C8.5 5.8 10 4.5 12 4.5 C14 4.5 15.5 5.8 15.5 8 V10"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M10 5 H7 C5.9 5 5 5.9 5 7 V17 C5 18.1 5.9 19 7 19 H10"
        stroke={inkRed}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M11 12 H20 M16.5 8.5 L20 12 L16.5 15.5"
        stroke={inkRed}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type RowProps = {
  iconBg: string;
  Icon: typeof PersonIcon;
  title: string;
  sub?: string;
  onPress?: () => void;
};

function Row({ iconBg, Icon, title, sub, onPress }: RowProps) {
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
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Chevron />
    </Pressable>
  );
}

export function ProfileScreen({
  name = "Анна Миронова",
  initials = "АМ",
  onBack,
  onDoctorAccess,
  onNotificationSettings,
  onSafetyPlan,
  onMyData,
  onLogout,
}: Props) {
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
          <Text style={styles.title}>Профиль</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userSub}>Пациент с 4 октября</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Row
              iconBg={colors.brandSoft}
              Icon={PersonIcon}
              title="Врач и доступ к данным"
              sub="Смирнова Е. С. · Мария — только план"
              onPress={onDoctorAccess}
            />
          </View>

          <View style={styles.card}>
            <Row
              iconBg={colors.brandSoft}
              Icon={BellIcon}
              title="Уведомления"
              sub="1 раз в день · тихие часы 22–9"
              onPress={onNotificationSettings}
            />
            <View style={styles.divider} />
            <Row
              iconBg={softRed}
              Icon={ShieldIcon}
              title="План безопасности"
              sub="Доступен без интернета"
              onPress={onSafetyPlan}
            />
          </View>

          <View style={styles.card}>
            <Row
              iconBg={colors.brandSoft}
              Icon={LockIcon}
              title="Согласия и мои данные"
              onPress={onMyData}
            />
            <View style={styles.divider} />
            <Row
              iconBg={softRed}
              Icon={LogoutIcon}
              title="Выйти"
              onPress={onLogout}
            />
          </View>
        </ScrollView>
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
    marginBottom: 18,
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
  scroll: { flex: 1 },
  scrollContent: { gap: 14, paddingBottom: 12 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand,
  },
  userText: { flex: 1 },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  userSub: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    fontSize: 16,
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
    marginLeft: 68,
    marginRight: 12,
  },
  pressed: { opacity: 0.88 },
});
