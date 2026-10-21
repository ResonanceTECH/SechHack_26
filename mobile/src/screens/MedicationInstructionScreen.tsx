import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onSideEffect?: () => void;
};

const pillPurple = "#7B6CFF";
const red = "#E5484D";
const yellow = "#C47A3A";

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

function HeartIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 20 S4.5 15.2 4.5 9.8 C4.5 7.2 6.5 5.5 8.8 5.5 C10.2 5.5 11.4 6.2 12 7.2 C12.6 6.2 13.8 5.5 15.2 5.5 C17.5 5.5 19.5 7.2 19.5 9.8 C19.5 15.2 12 20 12 20 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 4 C7.6 4 4 7.6 4 12 C4 16.4 7.6 20 12 20 C16.4 20 20 16.4 20 12 C20 7.6 16.4 4 12 4 Z"
        stroke={pillPurple}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 8 V12.5 L15 14.5"
        stroke={pillPurple}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M7 7 L17 17 M17 7 L7 17"
        stroke={red}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BoltIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M13 3 L6 13 H12 L11 21 L18 11 H12 Z"
        stroke={yellow}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WarnIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L21 19.5 H3 Z"
        stroke={colors.brand}
        strokeWidth={1.6}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={colors.brand}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M12 17.2 V17.4"
        stroke={colors.brand}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const CARDS = [
  {
    title: "Для чего",
    lines: ["Лечение тревожного расстройства у взрослых"],
    bg: colors.brandSoft,
    Icon: HeartIcon,
  },
  {
    title: "Как принимать",
    lines: [
      "Утром и вечером, за 30 минут до еды",
      "Пропустили — не удваивайте дозу",
    ],
    bg: "#EFEAFF",
    Icon: ClockIcon,
  },
  {
    title: "Сообщите врачу, если",
    lines: [
      "Эпилепсия, болезни печени или почек",
      "Беременность или кормление грудью",
    ],
    bg: "#FDECEC",
    Icon: XIcon,
  },
  {
    title: "Возможные побочные эффекты",
    lines: ["Часто: головокружение, сонливость, слабость"],
    bg: "#FFF1D6",
    Icon: BoltIcon,
  },
] as const;

export function MedicationInstructionScreen({ onBack, onSideEffect }: Props) {
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
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Инструкция</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headline}>Авиандр® 20 мг</Text>
          <Text style={styles.caption}>Кратко из листка-вкладыша</Text>

          {CARDS.map((card) => (
            <View key={card.title} style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: card.bg }]}>
                <card.Icon />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                {card.lines.map((line) => (
                  <Text key={line} style={styles.cardLine}>
                    • {line}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.source}>
            Источник: Государственный реестр лекарственных средств
          </Text>
        </ScrollView>

        <Pressable
          onPress={onSideEffect}
          style={({ pressed }) => [
            styles.footerBtn,
            pressed && styles.pressed,
          ]}
        >
          <WarnIcon />
          <Text style={styles.footerBtnText}>
            Сообщить о побочном эффекте
          </Text>
        </Pressable>
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
  scrollContent: { gap: 12, paddingBottom: 12 },
  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  caption: {
    marginTop: -4,
    marginBottom: 4,
    fontSize: 14,
    color: colors.muted,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 4,
  },
  cardLine: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  source: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
    textAlign: "center",
  },
  footerBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
