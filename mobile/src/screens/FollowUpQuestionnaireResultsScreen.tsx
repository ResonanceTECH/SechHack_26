import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  showDoctorAlert?: boolean;
  onGoHome?: () => void;
  onOpenAlert?: () => void;
};

const SCALE_COLORS = ["#5CC8B0", "#A8E07A", "#F2E27A", "#F5C08A", "#F08A8A"];

function PhoneIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M7.5 4.5 H10 L11.2 8.2 L9.3 9.5 C10.2 11.4 11.6 12.8 13.5 13.7 L14.8 11.8 L18.5 13 V15.5 C18.5 16.6 17.6 17.5 16.5 17.5 C10.7 17.5 6 12.8 6 7 C6 5.9 6.9 5 8 5"
        stroke="#B04050"
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CompareCard({
  title,
  score,
  max,
  badge,
  badgeTone,
  currentLabel,
  previousLabel,
  currentPct,
  previousPct,
  showPrevious,
  footer,
}: {
  title: string;
  score: number;
  max: number;
  badge: string;
  badgeTone: "up" | "flat";
  currentLabel: string;
  previousLabel?: string;
  currentPct: number;
  previousPct?: number;
  showPrevious?: boolean;
  footer: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.score}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreMax}> /{max}</Text>
        </Text>
      </View>

      <View
        style={[
          styles.changeBadge,
          badgeTone === "up" ? styles.badgeUp : styles.badgeFlat,
        ]}
      >
        <View
          style={[
            styles.changeDot,
            badgeTone === "up" ? styles.dotUp : styles.dotFlat,
          ]}
        />
        <Text
          style={[
            styles.changeText,
            badgeTone === "up" ? styles.changeUp : styles.changeFlat,
          ]}
        >
          {badge}
        </Text>
      </View>

      <View style={styles.scaleWrap}>
        <View
          style={[
            styles.tooltip,
            { left: `${currentPct}%` as DimensionValue },
          ]}
        >
          <Text style={styles.tooltipText}>{currentLabel}</Text>
        </View>

        <View style={styles.scaleTrack}>
          {SCALE_COLORS.map((c, i) => (
            <View
              key={c}
              style={[
                styles.scaleSeg,
                { backgroundColor: c },
                i === 0 && styles.segFirst,
                i === SCALE_COLORS.length - 1 && styles.segLast,
              ]}
            />
          ))}
          {showPrevious && previousPct != null ? (
            <View
              style={[
                styles.prevMarker,
                { left: `${previousPct}%` as DimensionValue },
              ]}
            />
          ) : null}
          <View
            style={[
              styles.marker,
              { left: `${currentPct}%` as DimensionValue },
            ]}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </View>
        </View>

        {showPrevious && previousLabel ? (
          <Text
            style={[
              styles.prevLabel,
              { left: `${previousPct}%` as DimensionValue },
            ]}
          >
            {previousLabel}
          </Text>
        ) : null}
      </View>

      <Text style={styles.cardFooter}>{footer}</Text>
    </View>
  );
}

export function FollowUpQuestionnaireResultsScreen({
  showDoctorAlert = true,
  onGoHome,
  onOpenAlert,
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
            18 октября · в сравнении с 4 октября
          </Text>

          {showDoctorAlert ? (
            <Pressable
              onPress={onOpenAlert}
              style={({ pressed }) => [
                styles.alertBanner,
                pressed && styles.pressed,
              ]}
            >
              <PhoneIcon />
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>
                  Врач свяжется с вами сегодня
                </Text>
                <Text style={styles.alertSub}>
                  Е. С. Смирнова получила уведомление · план безопасности
                </Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M9 5 L16 12 L9 19"
                  stroke="#B04050"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Pressable>
          ) : null}

          <CompareCard
            title="Настроение · PHQ-9"
            score={14}
            max={27}
            badge="↓ 3 · стало лучше"
            badgeTone="up"
            currentLabel="Сейчас · 14"
            previousLabel="4 окт · 17"
            currentPct={52}
            previousPct={63}
            showPrevious
            footer={'Умеренный уровень: было «выраженный».'}
          />

          <CompareCard
            title="Тревога · GAD-7"
            score={12}
            max={21}
            badge="Без изменений"
            badgeTone="flat"
            currentLabel="Сейчас и 4 окт · 12"
            currentPct={57}
            footer="Умеренный уровень, как и 2 недели назад."
          />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Это не диагноз. Обсудите результат с врачом 24 октября.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onGoHome}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>На главную</Text>
          </Pressable>
        </View>
      </View>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16, gap: 14 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: -4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  alertBanner: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFE4E6",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(176, 64, 80, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  alertText: { flex: 1 },
  alertTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#B04050",
  },
  alertSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: "#B04050",
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
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  score: { textAlign: "right" },
  scoreValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.ink,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.footer,
  },
  changeBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeUp: { backgroundColor: "#DDF5E8" },
  badgeFlat: { backgroundColor: "rgba(27, 36, 64, 0.06)" },
  changeDot: { width: 6, height: 6, borderRadius: 3 },
  dotUp: { backgroundColor: "#1F9A5A" },
  dotFlat: { backgroundColor: colors.muted },
  changeText: { fontSize: 12, fontWeight: "700" },
  changeUp: { color: "#1F6B52" },
  changeFlat: { color: colors.muted },
  scaleWrap: { marginTop: 22, marginBottom: 8 },
  tooltip: {
    position: "absolute",
    top: 0,
    transform: [{ translateX: -36 }],
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  tooltipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  scaleTrack: {
    marginTop: 30,
    height: 10,
    flexDirection: "row",
    gap: 3,
    position: "relative",
  },
  scaleSeg: { flex: 1, height: 10 },
  segFirst: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  segLast: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
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
  prevMarker: {
    position: "absolute",
    top: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    backgroundColor: colors.white,
    transform: [{ translateX: -4 }],
    zIndex: 2,
  },
  prevLabel: {
    position: "absolute",
    bottom: -18,
    transform: [{ translateX: -24 }],
    fontSize: 11,
    color: colors.footer,
    fontWeight: "500",
  },
  cardFooter: {
    marginTop: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  footer: { gap: 12, paddingTop: 8 },
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
