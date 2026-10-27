import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AddEntrySheet,
  type AddEntryAction,
} from "../components/AddEntrySheet";
import { MainTabBar, type MainTabId } from "../components/MainTabBar";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";
import { listDiary } from "../api/diary";

type RangeId = "week" | "month";

type Props = {
  onTab?: (tab: MainTabId) => void;
  onAddAction?: (action: AddEntryAction) => void;
  onQuestionnaires?: () => void;
};

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

/** Demo week series: mood (blue) & anxiety (orange), 0–4 scale → chart Y */
const MOOD = [2.2, 2.6, 3.1, 2.8, 1.6, 1.9, 2.4];
const ANXIETY = [1.8, 2.0, 2.4, 2.9, 3.4, 3.1, 2.7];
const HIGHLIGHT_DAY = 3; // Чт

const CHART_W = 310;
const CHART_H = 140;
const PAD_X = 12;
const PAD_Y = 16;

function MoonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M15.5 3.5 C11.5 4 8.5 7.5 8.5 12 C8.5 16.5 11.8 20.2 16.2 20.6 C13.2 22.2 9.5 21.5 7.2 19.2 C4.2 16.2 4 11.5 6.8 8.2 C8.5 6.2 11.2 4.8 14.2 4.5 C14.6 4 15.1 3.7 15.5 3.5 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="8"
        stroke="#C47A3A"
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M12 8 V12.5 L15 14.5"
        stroke="#C47A3A"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

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
        d="M9 11 H15 M9 14.5 H13"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function toPoints(values: number[]) {
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_Y * 2;
  return values.map((v, i) => {
    const x = PAD_X + (i / (values.length - 1)) * innerW;
    const y = PAD_Y + (1 - v / 4) * innerH;
    return { x, y };
  });
}

function linePath(pts: { x: number; y: number }[]) {
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function MoodAnxietyChart({ mood, anxiety }: { mood?: number[]; anxiety?: number[] }) {
  const m = mood && mood.length ? mood : MOOD;
  const a = anxiety && anxiety.length ? anxiety : ANXIETY;
  const moodPts = useMemo(() => toPoints(m), [m]);
  const anxPts = useMemo(() => toPoints(a), [a]);
  const moodD = useMemo(() => linePath(moodPts), [moodPts]);
  const anxD = useMemo(() => linePath(anxPts), [anxPts]);
  const hi = moodPts[HIGHLIGHT_DAY];

  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Rect
          x={hi.x - 14}
          y={6}
          width={28}
          height={CHART_H - 12}
          rx={10}
          fill="rgba(27, 36, 64, 0.05)"
        />
        <Path
          d={moodD}
          stroke={colors.brand}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={anxD}
          stroke="#E8A05A"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {moodPts.map((p, i) => (
          <Circle key={`m${i}`} cx={p.x} cy={p.y} r={3.2} fill={colors.brand} />
        ))}
        {anxPts.map((p, i) => (
          <Circle key={`a${i}`} cx={p.x} cy={p.y} r={3.2} fill="#E8A05A" />
        ))}
      </Svg>
      <View style={styles.dayRow}>
        {DAYS.map((d, i) => (
          <Text
            key={d}
            style={[styles.dayLabel, i === HIGHLIGHT_DAY && styles.dayLabelActive]}
          >
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function DiaryScreen({ onTab, onAddAction, onQuestionnaires }: Props) {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<RangeId>("week");
  const [addOpen, setAddOpen] = useState(false);
  const [mood, setMood] = useState<number[] | null>(null);
  const [anxiety, setAnxiety] = useState<number[] | null>(null);
  useEffect(() => {
    listDiary({ limit: 7 }).then((res) => {
      const entries = res.items ?? [];
      const m = entries.map((e) => (e.mood_score ?? 0) / 2.5).slice(0, 7).reverse();
      const a = entries.map((e) => (e.anxiety_score ?? 0) / 2.5).slice(0, 7).reverse();
      if (m.length) setMood(m);
      if (a.length) setAnxiety(a);
    }).catch(() => {});
  }, []);

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Дневник</Text>
            <View style={styles.rangeToggle}>
              <Pressable
                onPress={() => setRange("week")}
                style={[
                  styles.rangeBtn,
                  range === "week" && styles.rangeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    range === "week" && styles.rangeTextActive,
                  ]}
                >
                  Неделя
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRange("month")}
                style={[
                  styles.rangeBtn,
                  range === "month" && styles.rangeBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    range === "month" && styles.rangeTextActive,
                  ]}
                >
                  Месяц
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Настроение и тревога</Text>
              <Text style={styles.cardMeta}>
                {range === "week" ? "12–18 окт" : "Октябрь"}
              </Text>
            </View>
            <MoodAnxietyChart mood={mood ?? undefined} anxiety={anxiety ?? undefined} />
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.brand }]} />
                <Text style={styles.legendText}>Настроение</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: "#E8A05A" }]} />
                <Text style={styles.legendText}>Тревога</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statSleep]}>
              <MoonIcon />
              <Text style={styles.statValue}>5 ч 40 мин</Text>
              <Text style={styles.statSub}>сон в среднем</Text>
            </View>
            <View style={[styles.statCard, styles.statWake]}>
              <ClockIcon />
              <Text style={styles.statValue}>4 из 7</Text>
              <Text style={styles.statSub}>ночей с пробуждениями</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onQuestionnaires}
            style={({ pressed }) => [
              styles.qCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.qIcon}>
              <ClipboardIcon />
            </View>
            <View style={styles.qText}>
              <Text style={styles.qTitle}>Опросники</Text>
              <Text style={styles.qSub}>
                Последний 4 окт · повторный до 20 окт
              </Text>
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Новое</Text>
            </View>
          </Pressable>
        </ScrollView>

        <MainTabBar
          active="diary"
          onTab={onTab}
          onAdd={() => setAddOpen(true)}
        />
      </View>

      <AddEntrySheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSelect={onAddAction}
      />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  rangeToggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 3,
  },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 17,
  },
  rangeBtnActive: {
    backgroundColor: colors.brand,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  rangeTextActive: {
    color: colors.white,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.footer,
  },
  chartWrap: {
    marginTop: 4,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: colors.footer,
  },
  dayLabelActive: {
    color: colors.ink,
    fontWeight: "700",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  statSleep: {
    backgroundColor: "rgba(201, 213, 255, 0.45)",
  },
  statWake: {
    backgroundColor: "rgba(255, 238, 201, 0.7)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 4,
  },
  statSub: {
    fontSize: 13,
    lineHeight: 17,
    color: colors.muted,
  },
  qCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
  },
  qIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  qText: { flex: 1 },
  qTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  qSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brandSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
