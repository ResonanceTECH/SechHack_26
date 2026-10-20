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
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  onAllow: () => void;
  onDeny: () => void;
};

export function CameraPermissionSheet({ visible, onAllow, onDeny }: Props) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(320)).current;
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
      slide.setValue(320);
      fade.setValue(0);
    }
  }, [visible, fade, slide]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDeny}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDeny} />
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

          <View style={styles.iconWrap}>
            <Svg width={28} height={28} viewBox="0 0 24 24">
              <Path
                d="M4 8.5 A2 2 0 0 1 6 6.5 H8 L9.2 5 H14.8 L16 6.5 H18 A2 2 0 0 1 20 8.5 V17 A2 2 0 0 1 18 19 H6 A2 2 0 0 1 4 17 Z"
                fill={colors.brand}
              />
              <Circle cx="12" cy="12.5" r="3.2" fill={colors.white} />
              <Rect x="16.5" y="8.2" width="1.8" height="1.8" rx="0.4" fill={colors.white} />
            </Svg>
          </View>

          <Text style={styles.title}>Доступ к камере</Text>
          <Text style={styles.body}>
            Разрешите доступ к камере, чтобы отсканировать QR-код приглашения
            от врача или клиники.
          </Text>

          <Pressable
            onPress={onAllow}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Разрешить</Text>
          </Pressable>

          <Pressable
            onPress={onDeny}
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnSecondaryText}>Не сейчас</Text>
          </Pressable>
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
    backgroundColor: "rgba(15, 27, 51, 0.55)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(27, 36, 64, 0.12)",
    marginBottom: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 24,
  },
  btnPrimary: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  btnSecondary: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnSecondaryText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
