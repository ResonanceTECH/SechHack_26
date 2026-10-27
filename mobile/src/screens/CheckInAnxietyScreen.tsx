import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { SegmentBar } from "../components/SegmentBar";
import { colors } from "../theme/colors";

export type AnxietyId = 1 | 2 | 3 | 4 | 5;

type Props = {
  initialAnxiety?: AnxietyId;
  onBack?: () => void;
  onClose?: () => void;
  onContinue?: (anxiety: AnxietyId) => void;
};

const LEVELS: {
  id: AnxietyId;
  title: string;
  sub: string;
  bg: string;
  fg: string;
}[] = [
  {
    id: 1,
    title: "Нет тревоги",
    sub: "Спокойно",
    bg: "#DDF5E8",
    fg: "#1F6B52",
  },
  {
    id: 2,
    title: "Лёгкая",
    sub: "Фоновое беспокойство",
    bg: "#F5EBD6",
    fg: "#8A6A14",
  },
  {
    id: 3,
    title: "Заметная",
    sub: "Мешает сосредоточиться",
    bg: "#F7E8B8",
    fg: "#9A7A10",
  },
  {
    id: 4,
    title: "Сильная",
    sub: "Трудно успокоиться",
    bg: "#FFE0C8",
    fg: "#9A4A28",
  },
  {
    id: 5,
    title: "Очень сильная",
    sub: "Паника, не справляюсь",
    bg: "#FFE4E6",
    fg: "#B04050",
  },
];

function CheckIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M5.5 12.5 L10 17 L18.5 7.5"
        stroke={colors.brand}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function CheckInAnxietyScreen({
  initialAnxiety = 4,
  onBack,
  onClose,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const [anxiety, setAnxiety] = useState<AnxietyId>(initialAnxiety);

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
          <Text style={styles.headerTitle}>Отметка</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
            onPress={onClose}
            style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke={colors.ink}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.progressWrap}>
          <SegmentBar step={2} total={3} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Насколько вы тревожитесь?</Text>
          <Text style={styles.subtitle}>Сейчас или в течение дня</Text>

          <View style={styles.list}>
            {LEVELS.map((item) => {
              const selected = anxiety === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setAnxiety(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    selected ? styles.cardSelected : styles.cardIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: item.bg },
                      selected && styles.badgeSelected,
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: item.fg }]}>
                      {item.id}
                    </Text>
                  </View>
                  <View style={styles.cardText}>
                    <Text
                      style={[
                        styles.cardTitle,
                        selected && styles.cardTitleSelected,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        selected && styles.cardSubSelected,
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </View>
                  {selected ? <CheckIcon /> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={() => onContinue?.(anxiety)}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Далее</Text>
        </Pressable>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
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
  progressWrap: { marginTop: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 24, paddingBottom: 16 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  list: { gap: 10 },
  card: {
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIdle: {
    backgroundColor: colors.white,
    borderColor: "transparent",
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: "rgba(59, 120, 255, 0.08)",
    borderColor: colors.brand,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSelected: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  badgeText: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  cardTitleSelected: { color: colors.brand },
  cardSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  cardSubSelected: { color: colors.brand },
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
  pressed: { opacity: 0.88 },
});
