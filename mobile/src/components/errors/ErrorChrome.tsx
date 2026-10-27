import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScreenGradient } from "../ScreenGradient";
import { colors } from "../../theme/colors";

type Props = {
  headerTitle: string;
  onBack?: () => void;
  onDemoAll?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function ErrorChrome({
  headerTitle,
  onBack,
  onDemoAll,
  children,
  footer,
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>{children}</View>

        <View style={styles.footer}>
          {footer}
          {onDemoAll ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDemoAll}
              style={({ pressed }) => [
                styles.demoLink,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.demoText}>Демо · все ошибки</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </ScreenGradient>
  );
}

export function IconTile({
  bg,
  children,
}: {
  bg: string;
  children: ReactNode;
}) {
  return <View style={[styles.iconTile, { backgroundColor: bg }]}>{children}</View>;
}

export function InfoCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoGlyph}>
          <Text style={styles.infoGlyphText}>i</Text>
        </View>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

export function AlertBanner({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={styles.alertBanner}>
      <View style={styles.alertRow}>
        <View style={styles.alertGlyph}>
          <Text style={styles.alertGlyphText}>i</Text>
        </View>
        <View style={styles.alertTextCol}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertBody}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

export function WarnBanner({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: ReactNode;
}) {
  return (
    <View style={styles.warnBanner}>
      <View style={styles.warnHeader}>
        {icon}
        <Text style={styles.warnTitle}>{title}</Text>
      </View>
      <Text style={styles.warnBody}>{body}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnPrimary,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.btnPrimaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
    >
      <Text style={styles.btnSecondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
  },
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
  headerSpacer: { width: 40 },
  body: {
    flex: 1,
    paddingTop: 28,
  },
  footer: {
    gap: 12,
  },
  demoLink: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  demoText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.brand,
  },
  iconTile: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoGlyph: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoGlyphText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    lineHeight: 14,
  },
  infoTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  infoBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  alertBanner: {
    backgroundColor: colors.errorSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  alertGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  alertGlyphText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  alertTextCol: { flex: 1 },
  alertTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.errorInk,
  },
  alertBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.errorInk,
  },
  warnBanner: {
    backgroundColor: colors.warnSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  warnHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warnTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.warn,
  },
  warnBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.warnBody,
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
    backgroundColor: colors.secondaryBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: "600",
  },
  btnDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.88 },
});
