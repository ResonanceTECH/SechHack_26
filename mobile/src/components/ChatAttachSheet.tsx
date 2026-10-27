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
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export type ChatAttachAction = "camera" | "gallery" | "symptom";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (action: ChatAttachAction) => void;
};

const warnBrown = "#C47A3A";

const ITEMS: Array<{
  id: ChatAttachAction;
  title: string;
  sub?: string;
  bg: string;
  Icon: typeof CameraPlusIcon;
}> = [
  {
    id: "camera",
    title: "Сделать фото",
    sub: "Например, высыпания на коже",
    bg: colors.brandSoft,
    Icon: CameraPlusIcon,
  },
  {
    id: "gallery",
    title: "Выбрать из галереи",
    bg: colors.brandSoft,
    Icon: GalleryIcon,
  },
  {
    id: "symptom",
    title: "Отметить симптом",
    sub: "Выбрать из списка — не нужно подбирать слова",
    bg: "#FFF1D6",
    Icon: WarnIcon,
  },
];

function CameraPlusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 8 V16 M8 12 H16"
        stroke={colors.brand}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function GalleryIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2.5"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M4 15 L8.5 11 L12 14 L15 11.5 L20 16"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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
      <Path
        d="M12 17.2 V17.4"
        stroke={warnBrown}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ChatAttachSheet({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(420)).current;
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
      slide.setValue(420);
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
          <Text style={styles.title}>Прикрепить</Text>

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
                  {item.sub ? (
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  ) : null}
                </View>
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
  list: { gap: 2 },
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
