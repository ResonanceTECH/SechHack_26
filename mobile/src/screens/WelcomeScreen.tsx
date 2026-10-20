import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompassLogo } from "../components/CompassLogo";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onStart?: () => void;
  onLogin?: () => void;
};

export function WelcomeScreen({ onStart, onLogin }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const logoSize = height < 700 ? 96 : 120;

  return (
    <ScreenGradient>
      <StatusBar style="dark" />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 56,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.hero}>
          <CompassLogo size={logoSize} />

          <Text style={styles.brand}>Клинический компас</Text>
          <Text style={styles.headline}>
            Поддержка между{"\n"}визитами к врачу
          </Text>
          <Text style={styles.subtitle}>
            Отмечайте самочувствие — врач увидит динамику и вовремя поможет.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
            onPress={onStart}
          >
            <Text style={styles.btnPrimaryText}>Начать</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
            onPress={onLogin}
          >
            <Text style={styles.btnSecondaryText}>Войти</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Не ставит диагноз и не заменяет приём врача
          </Text>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
  },
  brand: {
    marginTop: 28,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "500",
    color: colors.brand,
    textAlign: "center",
  },
  headline: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 14,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    color: colors.muted,
    textAlign: "center",
  },
  footer: {
    gap: 12,
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
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
  disclaimer: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
    textAlign: "center",
  },
});
