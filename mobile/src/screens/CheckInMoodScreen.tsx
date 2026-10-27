import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { SegmentBar } from "../components/SegmentBar";
import { colors } from "../theme/colors";

export type MoodId = 5 | 4 | 3 | 2 | 1;

type Props = {
  initialMood?: MoodId;
  onClose?: () => void;
  onContinue?: (mood: MoodId) => void;
};

const MOODS: {
  id: MoodId;
  title: string;
  sub: string;
  bg: string;
  mouth: "grin" | "smile" | "neutral" | "sad" | "cry";
}[] = [
  {
    id: 5,
    title: "Отлично",
    sub: "Много сил и радости",
    bg: "#4CD964",
    mouth: "grin",
  },
  {
    id: 4,
    title: "Хорошо",
    sub: "Спокойно, всё получается",
    bg: "#A8D65B",
    mouth: "smile",
  },
  {
    id: 3,
    title: "Нормально",
    sub: "Ни хорошо, ни плохо",
    bg: "#F7C948",
    mouth: "neutral",
  },
  {
    id: 2,
    title: "Плохо",
    sub: "Грустно, трудно радоваться",
    bg: "#FF9F43",
    mouth: "sad",
  },
  {
    id: 1,
    title: "Очень плохо",
    sub: "Тяжело справляться с делами",
    bg: "#FF6B6B",
    mouth: "cry",
  },
];

function MoodFace({
  bg,
  mouth,
}: {
  bg: string;
  mouth: "grin" | "smile" | "neutral" | "sad" | "cry";
}) {
  const mouthPath =
    mouth === "cry"
      ? "M9 16.5 C10.5 14.5 13.5 14.5 15 16.5"
      : mouth === "sad"
        ? "M9 16.2 C10.5 14.8 13.5 14.8 15 16.2"
        : mouth === "neutral"
          ? "M9.5 16 H14.5"
          : mouth === "smile"
            ? "M8.5 14.5 C10 16.2 14 16.2 15.5 14.5"
            : "M8 14 C10 17.5 14 17.5 16 14";

  return (
    <View style={[styles.face, { backgroundColor: bg }]}>
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Circle cx="9" cy="10" r="1.3" fill="#1B2440" />
        <Circle cx="15" cy="10" r="1.3" fill="#1B2440" />
        <Path
          d={mouthPath}
          stroke="#1B2440"
          strokeWidth={1.7}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

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

export function CheckInMoodScreen({
  initialMood = 2,
  onClose,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();
  const [mood, setMood] = useState<MoodId>(initialMood);

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
          <View style={styles.headerSpacer} />
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
          <SegmentBar step={1} total={3} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Какое у вас настроение?</Text>
          <Text style={styles.subtitle}>Выберите самое близкое</Text>

          <View style={styles.list}>
            {MOODS.map((item) => {
              const selected = mood === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setMood(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    selected ? styles.cardSelected : styles.cardIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <MoodFace bg={item.bg} mouth={item.mouth} />
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
          onPress={() => onContinue?.(mood)}
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
  headerSpacer: { width: 40 },
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
  face: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
