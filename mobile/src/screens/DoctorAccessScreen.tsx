import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onWriteDoctor?: () => void;
};

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

function ChatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="9"
        r="3.2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M6.5 18.5 C7 15.5 9.2 14 12 14 C14.8 14 17 15.5 17.5 18.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function GroupIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle
        cx="9"
        cy="9"
        r="2.8"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Circle
        cx="16"
        cy="9.5"
        r="2.4"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M4.5 18 C5 15.5 6.8 14.2 9 14.2 C11.2 14.2 13 15.5 13.5 18"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M13.5 18 C14 16 15.4 15 17 15 C18.6 15 19.8 16 20.2 18"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2.5"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M8 3.5 V6.5 M16 3.5 V6.5 M4 9.5 H20"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M2.5 12 C4.5 8 8 6 12 6 C16 6 19.5 8 21.5 12 C19.5 16 16 18 12 18 C8 18 4.5 16 2.5 12 Z"
        stroke={colors.footer}
        strokeWidth={1.6}
        fill="none"
      />
      <Circle
        cx="12"
        cy="12"
        r="2.5"
        stroke={colors.footer}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

type AccessRow = {
  id: string;
  title: string;
  sub: string;
  Icon: typeof PersonIcon;
};

const ACCESS: AccessRow[] = [
  {
    id: "doctor",
    title: "Смирнова Е. С.",
    sub: "Дневник, опросники, лекарства, чат",
    Icon: PersonIcon,
  },
  {
    id: "maria",
    title: "Мария (сестра)",
    sub: "Только план безопасности",
    Icon: GroupIcon,
  },
  {
    id: "coord",
    title: "Координатор клиники",
    sub: "Только запись на приём",
    Icon: CalendarIcon,
  },
];

export function DoctorAccessScreen({ onBack, onWriteDoctor }: Props) {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    doctor: true,
    maria: true,
    coord: true,
  });

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
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Врач и доступ</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.doctorCard}>
            <View style={styles.doctorTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>ЕС</Text>
              </View>
              <View style={styles.doctorText}>
                <Text style={styles.doctorName}>Смирнова Елена Сергеевна</Text>
                <Text style={styles.doctorSub}>
                  Врач-психиатр · Клиника «Равновесие»
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onWriteDoctor}
              style={({ pressed }) => [
                styles.writeBtn,
                pressed && styles.pressed,
              ]}
            >
              <ChatIcon />
              <Text style={styles.writeBtnText}>Написать врачу</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Кто видит мои данные</Text>

          <View style={styles.card}>
            {ACCESS.map((row, i) => (
              <View key={row.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.accessRow}>
                  <View style={styles.iconWrap}>
                    <row.Icon />
                  </View>
                  <View style={styles.accessText}>
                    <Text style={styles.accessTitle}>{row.title}</Text>
                    <Text style={styles.accessSub}>{row.sub}</Text>
                  </View>
                  <Switch
                    value={toggles[row.id]}
                    onValueChange={(v) =>
                      setToggles((prev) => ({ ...prev, [row.id]: v }))
                    }
                    trackColor={{
                      false: "rgba(27,36,64,0.12)",
                      true: colors.brand,
                    }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.noteCard}>
            <EyeIcon />
            <Text style={styles.noteText}>
              Последний просмотр: Смирнова Е. С., сегодня в 11:05. Каждый доступ
              записывается в журнал.
            </Text>
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
  scrollContent: { gap: 14, paddingBottom: 12 },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  doctorTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
  doctorText: { flex: 1 },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  doctorSub: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  writeBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  writeBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 4,
  },
  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  accessText: { flex: 1 },
  accessTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  accessSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 17,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27, 36, 64, 0.08)",
    marginLeft: 66,
    marginRight: 14,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  pressed: { opacity: 0.88 },
});
