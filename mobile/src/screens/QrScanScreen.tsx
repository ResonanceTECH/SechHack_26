import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraPermissionSheet } from "../components/CameraPermissionSheet";

type Props = {
  onClose?: () => void;
  onManualEntry?: () => void;
  onScanned?: (data: string) => void;
};

const FRAME = 260;
const INNER = 120;

export function QrScanScreen({ onClose, onManualEntry, onScanned }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanY, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanY]);

  useEffect(() => {
    if (permission && !permission.granted) {
      setSheetVisible(true);
    }
  }, [permission]);

  const lineTranslate = scanY.interpolate({
    inputRange: [0, 1],
    outputRange: [8, INNER - 10],
  });

  async function handleAllow() {
    const res = await requestPermission();
    setSheetVisible(false);
    if (!res.granted && !res.canAskAgain) {
      await Linking.openSettings();
    }
  }

  function handleDeny() {
    setSheetVisible(false);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={
            locked
              ? undefined
              : ({ data }) => {
                  setLocked(true);
                  onScanned?.(data.trim());
                }
          }
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.noCam]} />
      )}

      <LinearGradient
        colors={["rgba(30, 58, 138, 0.9)", "rgba(15, 27, 51, 0)", "#0F1B33"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.pressed,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.center}>
          <Text style={styles.title}>Наведите камеру на QR-код</Text>

          <View style={styles.frame}>
            <Corner style={styles.tl} />
            <Corner style={styles.tr} />
            <Corner style={styles.bl} />
            <Corner style={styles.br} />

            <View style={styles.inner}>
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: lineTranslate }] },
                ]}
              />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Код в приглашении от клиники или на экране у врача
          </Text>

          {!permission?.granted && (
            <Pressable
              onPress={() => setSheetVisible(true)}
              style={styles.permBtn}
            >
              <Text style={styles.permText}>Разрешить доступ к камере</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={onManualEntry ?? onClose}
          style={({ pressed }) => [
            styles.manualBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.manualText}>Ввести код вручную</Text>
        </Pressable>
      </View>

      <CameraPermissionSheet
        visible={sheetVisible}
        onAllow={handleAllow}
        onDeny={handleDeny}
      />
    </View>
  );
}

function Corner({ style }: { style: object }) {
  return <View style={[styles.corner, style]} />;
}

const CORNER = 28;
const THICK = 4;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F1B33",
  },
  noCam: {
    backgroundColor: "#0F1B33",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(148, 173, 230, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
  },
  frame: {
    width: FRAME,
    height: FRAME,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#FFFFFF",
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: THICK,
    borderLeftWidth: THICK,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: THICK,
    borderRightWidth: THICK,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: THICK,
    borderLeftWidth: THICK,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: THICK,
    borderRightWidth: THICK,
    borderBottomRightRadius: 10,
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: 16,
    backgroundColor: "rgba(15, 27, 51, 0.45)",
    overflow: "hidden",
  },
  scanLine: {
    alignSelf: "center",
    width: INNER - 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#4D80F7",
    shadowColor: "#4D80F7",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    marginTop: 24,
    maxWidth: 280,
    color: "#A0ABC0",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  permBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permText: {
    color: "#4D80F7",
    fontSize: 15,
    fontWeight: "600",
  },
  manualBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(148, 173, 230, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  manualText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
