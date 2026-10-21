import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { Toggle } from "../components/Toggle";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onConsentText?: () => void;
  onDownload?: () => void;
  onDeleteAccount?: () => void;
};

const deleteRed = "#9E2A2A";

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

function DocIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M7 4 H14 L18 8 V20 H7 Z"
        stroke={colors.ink}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M14 4 V8 H18"
        stroke={colors.ink}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M10 12 H15 M10 15.5 H13.5"
        stroke={colors.ink}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DownloadIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 4 V14 M8.5 11 L12 14.5 L15.5 11"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5 18 H19"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const TOGGLES = [
  {
    id: "personal",
    title: "Персональные данные",
    sub: "Обязательно для работы приложения",
  },
  {
    id: "medical",
    title: "Медицинские данные",
    sub: "Обязательно для работы приложения",
  },
  {
    id: "share",
    title: "Передача данных врачу",
    sub: "Можно отозвать — врач перестанет видеть отметки",
  },
] as const;

export function MyDataScreen({
  onBack,
  onConsentText,
  onDownload,
  onDeleteAccount,
}: Props) {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState({
    personal: true,
    medical: true,
    share: true,
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
          <Text style={styles.title}>Мои данные</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {TOGGLES.map((item, i) => (
              <View key={item.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  <Toggle
                    value={toggles[item.id]}
                    onValueChange={(v) =>
                      setToggles((prev) => ({ ...prev, [item.id]: v }))
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onConsentText}
            style={({ pressed }) => [
              styles.consentCard,
              pressed && styles.pressed,
            ]}
          >
            <DocIcon />
            <Text style={styles.consentText}>Текст согласия (152-ФЗ)</Text>
            <Chevron />
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={onDownload}
            style={({ pressed }) => [
              styles.downloadBtn,
              pressed && styles.pressed,
            ]}
          >
            <DownloadIcon />
            <Text style={styles.downloadText}>Скачать мои данные (PDF)</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onDeleteAccount}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={styles.deleteText}>Удалить аккаунт и данные</Text>
          </Pressable>
        </View>
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
  scroll: { flex: 1 },
  scrollContent: { gap: 14, paddingBottom: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSub: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27, 36, 64, 0.08)",
    marginLeft: 16,
    marginRight: 16,
  },
  consentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  consentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  footer: {
    gap: 14,
    paddingTop: 8,
  },
  downloadBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
  deleteText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: deleteRed,
    paddingVertical: 4,
  },
  pressed: { opacity: 0.88 },
});
