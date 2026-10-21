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
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
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

function BookIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M6 5 H17 C18 5 19 5.9 19 7 V19 H8 C6.9 19 6 18.1 6 17 V5 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M9 9 H15 M9 12.5 H14"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}

function ClipboardIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M9 4.5 H15 V6.5 H9 Z"
        stroke={colors.brand}
        strokeWidth={1.4}
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
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MoonIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M15.5 3.5 C11.5 4 8.5 7.5 8.5 12 C8.5 16.5 11.8 20.2 16.2 20.6 C13.2 22.2 9.5 21.5 7.2 19.2 C4.2 16.2 4 11.5 6.8 8.2 C8.5 6.2 11.2 4.8 14.2 4.5 C14.6 4 15.1 3.7 15.5 3.5 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const ITEMS = [
  {
    id: "wellbeing",
    title: "Отметка самочувствия",
    sub: "Каждый день в 09:00",
    Icon: BookIcon,
  },
  {
    id: "meds",
    title: "Приём лекарств",
    sub: "09:30 и 21:00",
    Icon: PillIcon,
  },
  {
    id: "questionnaires",
    title: "Опросники от врача",
    sub: "Когда врач назначит",
    Icon: ClipboardIcon,
  },
  {
    id: "messages",
    title: "Сообщения врача",
    sub: "Сразу",
    Icon: ChatIcon,
  },
] as const;

export function NotificationSettingsScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    wellbeing: true,
    meds: true,
    questionnaires: true,
    messages: true,
    quiet: true,
  });

  const set = (id: string, v: boolean) =>
    setToggles((prev) => ({ ...prev, [id]: v }));

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
          <Text style={styles.title}>Уведомления</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.intro}>
          Напоминаем только о важном — не чаще одного раза по каждому пункту.
        </Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {ITEMS.map((item, i) => (
              <View key={item.id}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <item.Icon />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={toggles[item.id]}
                    onValueChange={(v) => set(item.id, v)}
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

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <MoonIcon />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Тихие часы</Text>
                <Text style={styles.rowSub}>
                  22:00–9:00 — без уведомлений
                </Text>
              </View>
              <Switch
                value={toggles.quiet}
                onValueChange={(v) => set("quiet", v)}
                trackColor={{
                  false: "rgba(27,36,64,0.12)",
                  true: colors.brand,
                }}
                thumbColor={colors.white}
              />
            </View>
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
    marginBottom: 12,
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
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: 16,
  },
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
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27, 36, 64, 0.08)",
    marginLeft: 66,
    marginRight: 14,
  },
  pressed: { opacity: 0.88 },
});
