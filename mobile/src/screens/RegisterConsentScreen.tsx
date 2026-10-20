import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { StepProgress } from "../components/StepProgress";
import { Toggle } from "../components/Toggle";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onReadDocument?: () => void;
  onContinue?: () => void;
};

export function RegisterConsentScreen({
  onBack,
  onReadDocument,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const [personal, setPersonal] = useState(true);
  const [medical, setMedical] = useState(true);
  const canContinue = personal && medical;

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
        <View>
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
            <Text style={styles.headerTitle}>Регистрация</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.progressWrap}>
            <StepProgress step={2} total={5} label="Согласия" />
          </View>

          <Text style={styles.title}>Согласие на обработку данных</Text>
          <Text style={styles.subtitle}>
            Без него приложение не сможет хранить ваши отметки.
          </Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Персональные данные</Text>
                <Text style={styles.rowSub}>Имя, телефон · обязательно</Text>
              </View>
              <Toggle value={personal} onValueChange={setPersonal} />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Медицинские данные</Text>
                <Text style={styles.rowSub}>
                  Отметки, опросники, лекарства · обязательно
                </Text>
              </View>
              <Toggle value={medical} onValueChange={setMedical} />
            </View>
          </View>

          <View style={styles.banner}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M12 3 L20 6.5 V12 c0 5 -3.5 8.5 -8 9.5 C7.5 20.5 4 17 4 12 V6.5 Z"
                fill={colors.brand}
              />
              <Path
                d="M9 12.2 L11 14.2 L15.5 9.5"
                stroke={colors.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <Text style={styles.bannerText}>
              Храним в России по 152-ФЗ. Доступ врачу вы дадите на следующем
              шаге.
            </Text>
          </View>

          <Pressable
            onPress={onReadDocument}
            style={({ pressed }) => [styles.docLinkWrap, pressed && styles.pressed]}
          >
            <Text style={styles.docLink}>Читать документ полностью</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={!canContinue}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.btnPrimary,
            !canContinue && styles.btnDisabled,
            pressed && canContinue && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Принять и продолжить</Text>
        </Pressable>
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
  title: {
    marginTop: 28,
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
    marginTop: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
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
    color: colors.footer,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27,36,64,0.1)",
  },
  banner: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#E4ECFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brand,
    fontWeight: "500",
  },
  docLinkWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  docLink: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.brand,
  },
  btnPrimary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.45 },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
