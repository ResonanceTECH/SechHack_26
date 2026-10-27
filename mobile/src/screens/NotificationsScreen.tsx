import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type NotifTone = "blue" | "purple" | "green";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  tone: NotifTone;
  kind: "clipboard" | "pill" | "calendar" | "chat";
};

type Props = {
  onBack?: () => void;
  onFilter?: () => void;
  onOpen?: (id: string) => void;
};

const SECTIONS: { title: string; items: NotificationItem[] }[] = [
  {
    title: "Сегодня",
    items: [
      {
        id: "n1",
        kind: "clipboard",
        tone: "blue",
        title: "Повторный опросник",
        body: "Е. С. Смирнова просит пройти до 20 октября",
        time: "08:00",
        unread: true,
      },
      {
        id: "n2",
        kind: "pill",
        tone: "purple",
        title: "Пора принять Авиандр 20 мг",
        body: "Утренний приём · 09:30",
        time: "09:30",
        unread: true,
      },
    ],
  },
  {
    title: "Вчера",
    items: [
      {
        id: "n3",
        kind: "calendar",
        tone: "green",
        title: "Подтвердите приём",
        body: "Сб, 24 октября · 14:00",
        time: "18:00",
      },
      {
        id: "n4",
        kind: "chat",
        tone: "blue",
        title: "Ответ врача",
        body: "«Как вы себя чувствуете после...»",
        time: "12:40",
      },
    ],
  },
];

const TONE = {
  blue: { bg: colors.brandSoft, stroke: colors.brand },
  purple: { bg: "#EFEAFF", stroke: "#7B6CFF" },
  green: { bg: "#DDF5E8", stroke: "#2FBF6B" },
} as const;

function NotifIcon({
  kind,
  tone,
}: {
  kind: NotificationItem["kind"];
  tone: NotifTone;
}) {
  const c = TONE[tone].stroke;

  if (kind === "clipboard") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Rect
          x="6"
          y="4"
          width="12"
          height="16"
          rx="2"
          stroke={c}
          strokeWidth={1.8}
          fill="none"
        />
        <Path
          d="M9 4.5 H15 V6.5 H9 Z"
          stroke={c}
          strokeWidth={1.5}
          fill="none"
        />
        <Path
          d="M9 11 H15 M9 14.5 H13"
          stroke={c}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (kind === "pill") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
          stroke={c}
          strokeWidth={1.8}
          fill="none"
        />
        <Path
          d="M11 13 L13.5 10.5"
          stroke={c}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (kind === "calendar") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2.5"
          stroke={c}
          strokeWidth={1.8}
          fill="none"
        />
        <Path
          d="M8 3.5 V6.5 M16 3.5 V6.5 M4 9.5 H20"
          stroke={c}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={c}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SlidersIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M4 7 H20 M4 12 H20 M4 17 H20"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="9" cy="7" r="2.2" fill={colors.ink} />
      <Circle cx="15" cy="12" r="2.2" fill={colors.ink} />
      <Circle cx="11" cy="17" r="2.2" fill={colors.ink} />
    </Svg>
  );
}

export function NotificationsScreen({ onBack, onFilter, onOpen }: Props) {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Уведомления</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Фильтр"
            onPress={onFilter}
            style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          >
            <SlidersIcon />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => onOpen?.(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: TONE[item.tone].bg },
                    ]}
                  >
                    <NotifIcon kind={item.kind} tone={item.tone} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSub} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                  <View style={styles.meta}>
                    <Text style={styles.time}>{item.time}</Text>
                    {item.unread ? <View style={styles.unread} /> : null}
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
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
  scroll: { flex: 1, marginTop: 20 },
  scrollContent: {
    paddingBottom: 24,
    gap: 18,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#1B2440",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    paddingRight: 4,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  cardSub: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  meta: {
    alignItems: "flex-end",
    gap: 8,
    minWidth: 40,
    paddingTop: 2,
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: colors.footer,
  },
  unread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
