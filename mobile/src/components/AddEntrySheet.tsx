import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

const SHEET_OFFSCREEN = 560;
const DISMISS_DY = 96;
const DISMISS_VY = 0.85;

export type AddEntryAction =
  | "wellbeing"
  | "sleep"
  | "symptom"
  | "medication"
  | "message";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (action: AddEntryAction) => void;
};

const warnBrown = "#C47A3A";
const pillPurple = "#7B6CFF";
const chatGreen = "#2FBF6B";

const ITEMS: Array<{
  id: AddEntryAction;
  title: string;
  sub: string;
  bg: string;
  Icon: typeof MoodIcon;
}> = [
  {
    id: "wellbeing",
    title: "Самочувствие",
    sub: "Настроение и тревога",
    bg: colors.brandSoft,
    Icon: MoodIcon,
  },
  {
    id: "sleep",
    title: "Сон",
    sub: "Часы, засыпание, пробуждения",
    bg: colors.brandSoft,
    Icon: MoonIcon,
  },
  {
    id: "symptom",
    title: "Симптом или побочный эффект",
    sub: "Выбрать из списка",
    bg: "#FFF1D6",
    Icon: WarnIcon,
  },
  {
    id: "medication",
    title: "Приём лекарства",
    sub: "Авиандр 20 мг",
    bg: "#EFEAFF",
    Icon: PillIcon,
  },
  {
    id: "message",
    title: "Написать врачу",
    sub: "Текст, фото или голос",
    bg: "#DDF5E8",
    Icon: ChatIcon,
  },
];

function MoodIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Circle cx="9" cy="10" r="1.2" fill={colors.brand} />
      <Circle cx="15" cy="10" r="1.2" fill={colors.brand} />
      <Path
        d="M8.5 14.5 C10 16.2 14 16.2 15.5 14.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function MoonIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M14.2 3.8 C10.2 4.4 7.2 7.9 7.2 12.1 C7.2 16.6 10.7 20.3 15.2 20.7 C12.1 22.2 8.4 21.4 6.1 19 C3.2 16 3.1 11.2 5.9 7.9 C7.7 5.8 10.5 4.4 13.6 4.1 C13.8 4 14 3.9 14.2 3.8 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M17.2 6.2 L17.8 7.6 L19.2 8.2 L17.8 8.8 L17.2 10.2 L16.6 8.8 L15.2 8.2 L16.6 7.6 Z"
        fill={colors.brand}
      />
      <Path
        d="M19.8 11.5 L20.15 12.3 L21 12.6 L20.15 12.9 L19.8 13.7 L19.45 12.9 L18.6 12.6 L19.45 12.3 Z"
        fill={colors.brand}
      />
    </Svg>
  );
}

function WarnIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L21 19.5 H3 Z"
        stroke={warnBrown}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 10 V14.5"
        stroke={warnBrown}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="17" r="1.1" fill={warnBrown} />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M8.2 15.8 C6.3 13.9 6.3 10.8 8.2 8.9 L10.9 6.2 C12.8 4.3 15.9 4.3 17.8 6.2 C19.7 8.1 19.7 11.2 17.8 13.1 L15.1 15.8 C13.2 17.7 10.1 17.7 8.2 15.8 Z"
        stroke={pillPurple}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M9.6 9.6 L14.4 14.4"
        stroke={pillPurple}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChatIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={chatGreen}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
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
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function AddEntrySheet({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(SHEET_OFFSCREEN)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const dragY = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const animateOpen = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateClose = (then?: () => void) => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: SHEET_OFFSCREEN,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) then?.();
    });
  };

  useEffect(() => {
    if (visible) {
      dragY.current = 0;
      animateOpen();
    } else {
      slide.setValue(SHEET_OFFSCREEN);
      fade.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => {
          slide.stopAnimation((v) => {
            dragY.current = typeof v === "number" ? v : 0;
          });
        },
        onPanResponderMove: (_, g) => {
          const next = Math.max(0, dragY.current + g.dy);
          slide.setValue(next);
          fade.setValue(Math.max(0, 1 - next / 360));
        },
        onPanResponderRelease: (_, g) => {
          const next = Math.max(0, dragY.current + g.dy);
          if (next > DISMISS_DY || g.vy > DISMISS_VY) {
            animateClose(() => onCloseRef.current());
            return;
          }
          Animated.parallel([
            Animated.spring(slide, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
              speed: 14,
            }),
            Animated.timing(fade, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start();
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => animateClose(() => onCloseRef.current())}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <View style={styles.handleHit} {...pan.panHandlers}>
            <View style={styles.handle} />
          </View>
          <Text style={styles.title}>Что отметить?</Text>

          <View style={styles.list}>
            {ITEMS.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  onSelect?.(item.id);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                  <item.Icon />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Chevron />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 27, 51, 0.45)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handleHit: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 14,
    marginHorizontal: -8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(27, 36, 64, 0.12)",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
  },
  list: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  rowSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  pressed: { opacity: 0.88 },
});
