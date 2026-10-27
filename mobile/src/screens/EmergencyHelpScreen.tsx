import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  onClose?: () => void;
};

const ITEMS = [
  "Отёк лица, губ или горла",
  "Трудно дышать",
  "Судороги или потеря сознания",
  "Боль в груди, сильные перебои сердца",
  "Мысли о самоубийстве и план",
] as const;

function WarnIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24">
      <Path
        d="M12 3.5 L22 20.5 H2 Z"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={colors.white}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 17.5 V17.6"
        stroke={colors.white}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M7.5 4.5 H10 L11.2 8.2 L9.3 9.5 C10.2 11.4 11.6 12.8 13.5 13.7 L14.8 11.8 L18.5 13 V15.5 C18.5 16.6 17.6 17.5 16.5 17.5 C10.7 17.5 6 12.8 6 7 C6 5.9 6.9 5 8 5"
        stroke="#D63A31"
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const colors = {
  white: "#FFFFFF",
} as const;

async function callNumber(num: string) {
  const url = `tel:${num}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
  } catch {
    // ignore — emulator may not support tel:
  }
}

export function EmergencyHelpScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={["#F05F52", "#D63A31"]} style={styles.root}>
      <StatusBar style="light" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.spacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.pressed,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke={colors.white}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <WarnIcon />
          </View>
          <Text style={styles.title}>Нужна срочная помощь</Text>
          <Text style={styles.subtitle}>
            Эти симптомы могут быть опасны. Позвоните в скорую прямо сейчас.
          </Text>

          <View style={styles.listCard}>
            <Text style={styles.listTitle}>Звоните сразу, если есть:</Text>
            {ITEMS.map((item) => (
              <View key={item} style={styles.listRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItem}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => callNumber("103")}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <PhoneIcon />
            <Text style={styles.btnPrimaryText}>Позвонить 103</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => callNumber("112")}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnSecondaryText}>Единый номер 112</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Ваш врач уже получил уведомление
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  spacer: { flex: 1 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 12,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  listCard: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.14)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  listItem: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.white,
  },
  footer: {
    gap: 12,
  },
  btnPrimary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnPrimaryText: {
    color: "#D63A31",
    fontSize: 17,
    fontWeight: "700",
  },
  btnSecondary: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  footerNote: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.85)",
  },
  pressed: { opacity: 0.88 },
});
