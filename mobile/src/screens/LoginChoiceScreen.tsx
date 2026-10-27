import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onPhone?: () => void;
  onEmail?: () => void;
};

export function LoginChoiceScreen({ onBack, onPhone, onEmail }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Вход</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Как войти?</Text>
          <Text style={styles.subtitle}>
            Выберите удобный способ входа в аккаунт.
          </Text>

          <Pressable
            onPress={onPhone}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <Text style={styles.btnText}>По номеру телефона</Text>
          </Pressable>

          <Pressable
            onPress={onEmail}
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.btnSecondaryText}>По email и паролю</Text>
          </Pressable>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  header: { flexDirection: "row", alignItems: "center", minHeight: 44 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 22, color: colors.ink, fontWeight: "700" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.ink },
  headerSpacer: { width: 40 },
  body: { flex: 1, justifyContent: "center", gap: 16 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 8 },
  btn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: "600" },
  btnSecondary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
  },
  btnSecondaryText: { color: colors.ink, fontSize: 17, fontWeight: "600" },
  pressed: { opacity: 0.88 },
});