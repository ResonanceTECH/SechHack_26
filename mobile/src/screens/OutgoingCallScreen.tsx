import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export type OutgoingCallTarget = {
  initials: string;
  name: string;
  status: string;
};

type Props = {
  target: OutgoingCallTarget;
  onHangUp?: () => void;
};

function HangUpIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24">
      <Path
        d="M5 10 C8 7.5 16 7.5 19 10 L17.5 13.5 C16.5 12.8 14.5 12.2 12 12.2 C9.5 12.2 7.5 12.8 6.5 13.5 Z"
        fill={colors.white}
      />
    </Svg>
  );
}

export function OutgoingCallScreen({ target, onHangUp }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={["#1A367E", "#0D162D"]} style={styles.root}>
      <StatusBar style="light" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 80,
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          },
        ]}
      >
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{target.initials}</Text>
          </View>
          <Text style={styles.name}>{target.name}</Text>
          <Text style={styles.status}>{target.status}</Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Завершить звонок"
            onPress={onHangUp}
            style={({ pressed }) => [
              styles.hangUp,
              pressed && styles.pressed,
            ]}
          >
            <HangUpIcon />
          </Pressable>
          <Text style={styles.hint}>
            Демонстрация: в приложении открывается системный звонок
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
    alignItems: "center",
  },
  top: {
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
  },
  status: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  bottom: {
    alignItems: "center",
    gap: 18,
    width: "100%",
  },
  hangUp: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#D63A31",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.88 },
});
