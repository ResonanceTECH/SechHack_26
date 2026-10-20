import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import {
  type InstrumentResult,
  type SeverityTone,
} from "../data/questionnaires";
import { colors } from "../theme/colors";

type Props = {
  dateLabel?: string;
  phq9: InstrumentResult;
  gad7: InstrumentResult;
  onContinue?: () => void;
};

const SCALE_COLORS = ["#5CC8B0", "#A8E07A", "#F2E27A", "#F5C08A", "#F08A8A"];

const TONE_STYLES: Record<
  SeverityTone,
  { bg: string; title: string; body: string }
> = {
  none: { bg: "#E8F7F1", title: "#1F6B52", body: "#3A7A66" },
  mild: { bg: "#EEF7E0", title: "#4A6B1F", body: "#5A7A36" },
  moderate: { bg: "#FFF4D6", title: "#8A6A14", body: "#8A6A14" },
  moderatelySevere: { bg: "#FFE8DC", title: "#9A4A28", body: "#9A4A28" },
  severe: { bg: "#FFE4E6", title: "#B04050", body: "#B04050" },
};

function ClipboardIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="6"
        y="4"
        width="12"
        height="16"
        rx="2"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 4.5 H15 V6.5 H9 Z"
        stroke={colors.brand}
        strokeWidth={1.5}
        fill="none"
      />
      <Path
        d="M9 11.2 L10.8 13 L14.5 9.2"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function ResultCard({ result }: { result: InstrumentResult }) {
  const tone = TONE_STYLES[result.tone];
  // marker sits in the middle of the severity band (0..4)
  const markerLeft = `${((result.band + 0.5) / 5) * 100}%`;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cardTitle}>{result.title}</Text>
          <Text style={styles.cardInstrument}>{result.instrument}</Text>
        </View>
        <Text style={styles.score}>
          <Text style={styles.scoreValue}>{result.score}</Text>
          <Text style={styles.scoreMax}> / {result.max}</Text>
        </Text>
      </View>

      <View style={styles.scaleWrap}>
        <View style={[styles.tooltip, { left: markerLeft }]}>
          <Text style={styles.tooltipText}>Вы · {result.score}</Text>
        </View>

        <View style={styles.scaleTrack}>
          {SCALE_COLORS.map((c, i) => (
            <View
              key={c}
              style={[
                styles.scaleSeg,
                { backgroundColor: c },
                i === 0 && styles.scaleSegFirst,
                i === SCALE_COLORS.length - 1 && styles.scaleSegLast,
              ]}
            />
          ))}
          <View style={[styles.marker, { left: markerLeft }]}>
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </View>
        </View>

        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Нет симптомов</Text>
          <Text style={styles.scaleLabel}>Выраженные</Text>
        </View>
      </View>

      <View style={[styles.statusBox, { backgroundColor: tone.bg }]}>
        <Text style={[styles.statusTitle, { color: tone.title }]}>
          {result.levelLabel}
        </Text>
        <Text style={[styles.statusBody, { color: tone.body }]}>
          {result.levelHint}
        </Text>
      </View>
    </View>
  );
}

export function RegisterQuestionnaireResultsScreen({
  dateLabel = "4 октября",
  phq9,
  gad7,
  onContinue,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>Ваши результаты</Text>
          <Text style={styles.subtitle}>
            {dateLabel} · по ответам за последние 2 недели
          </Text>

          <ResultCard result={phq9} />
          <ResultCard result={gad7} />

          <View style={styles.infoBanner}>
            <ClipboardIcon />
            <Text style={styles.infoText}>
              Это отправная точка. Через 2 недели повторим опросник и покажем
              изменения.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Это не диагноз. Результат увидит ваш врач.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Далее</Text>
          </Pressable>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 20,
    gap: 14,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: -4,
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  cardInstrument: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  score: {
    textAlign: "right",
  },
  scoreValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.ink,
  },
  scoreMax: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: colors.footer,
  },
  scaleWrap: {
    marginTop: 18,
  },
  tooltip: {
    position: "absolute",
    top: 0,
    transform: [{ translateX: -28 }],
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  tooltipText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  scaleTrack: {
    marginTop: 30,
    height: 10,
    flexDirection: "row",
    gap: 3,
    position: "relative",
  },
  scaleSeg: {
    flex: 1,
    height: 10,
  },
  scaleSegFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  scaleSegLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  marker: {
    position: "absolute",
    top: -5,
    transform: [{ translateX: -10 }],
    zIndex: 3,
  },
  markerOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  scaleLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scaleLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
  },
  statusBox: {
    marginTop: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  statusBody: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  infoBanner: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#E4ECFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.brand,
    fontWeight: "500",
  },
  footer: {
    gap: 12,
    paddingTop: 8,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: colors.footer,
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
  pressed: { opacity: 0.88 },
});
