import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

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
        d="M15.5 3.5 C11.5 4 8.5 7.5 8.5 12 C8.5 16.5 11.8 20.2 16.2 20.6 C13.2 22.2 9.5 21.5 7.2 19.2 C4.2 16.2 4 11.5 6.8 8.2 C8.5 6.2 11.2 4.8 14.2 4.5 C14.6 4 15.1 3.7 15.5 3.5 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
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
        d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
        stroke={pillPurple}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M11 13 L13.5 10.5"
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
  const slide = useRef(new Animated.Value(520)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
    } else {
      slide.setValue(520);
      fade.setValue(0);
    }
  }, [visible, fade, slide]);

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
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
          <View style={styles.handle} />
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
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(27, 36, 64, 0.12)",
    marginBottom: 18,
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
