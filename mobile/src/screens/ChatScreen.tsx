import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChatAttachSheet,
  type ChatAttachAction,
} from "../components/ChatAttachSheet";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  onBack?: () => void;
  onMedPaused?: () => void;
  onAttach?: (action: ChatAttachAction) => void;
  online?: boolean;
  onSendFailed?: () => void;
  onUploadFailed?: () => void;
  onMicDenied?: () => void;
};

const QUICK = [
  "Сонливость",
  "Тревога",
  "Плохо спала",
  "Побочный эффект",
] as const;

const warnBg = "#FFF6E5";
const warnInk = "#9A6B2F";
const warnIcon = "#C47A3A";

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

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="8"
        stroke={colors.footer}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 8 V12.5 L15 14.5"
        stroke={colors.footer}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={warnIcon}
        strokeWidth={1.6}
        fill="none"
      />
      <Path
        d="M12 11 V16.5"
        stroke={warnIcon}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12 7.8 V8"
        stroke={warnIcon}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
        stroke={warnIcon}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M11 13 L13.5 10.5"
        stroke={warnIcon}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Chevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M9 5 L16 12 L9 19"
        stroke={warnIcon}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M12 6 V18 M6 12 H18"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MicIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect
        x="9"
        y="3.5"
        width="6"
        height="11"
        rx="3"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M6.5 11.5 C6.5 14.5 8.7 17 12 17 C15.3 17 17.5 14.5 17.5 11.5"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 17 V20.5"
        stroke={colors.white}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M4 11.5 L20 4 L13 20 L11.2 13.2 Z"
        stroke={colors.white}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M6 6 L18 18 M18 6 L6 18"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Waveform() {
  const bars = [6, 12, 18, 10, 16, 8, 14, 20, 11, 17, 9, 15, 7, 13, 19, 10, 16, 8];
  return (
    <View style={styles.wave}>
      {bars.map((h, i) => (
        <View
          key={i}
          style={[styles.waveBar, { height: h, opacity: 0.55 + (i % 3) * 0.15 }]}
        />
      ))}
    </View>
  );
}

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type OutgoingMsg =
  | { id: string; kind: "text"; text: string }
  | { id: string; kind: "voice"; seconds: number };

export function ChatScreen({
  onBack,
  onMedPaused,
  onAttach,
  online = true,
  onSendFailed,
  onUploadFailed,
  onMicDenied,
}: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [outgoing, setOutgoing] = useState<OutgoingMsg[]>([]);
  /** long-press toggles icons: send ↔ mic; tap on mic starts recording */
  const [actionMode, setActionMode] = useState<"send" | "voice">("send");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const lastModeToggleAt = useRef(0);

  useEffect(() => {
    if (!recording) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const startRecording = () => {
    if (!online) {
      onMicDenied?.();
      return;
    }
    setRecording(true);
  };

  const cancelRecording = () => {
    setRecording(false);
    setSeconds(0);
  };

  const sendRecording = () => {
    const dur = Math.max(1, seconds);
    setOutgoing((prev) => [
      ...prev,
      { id: `v-${Date.now()}`, kind: "voice", seconds: dur },
    ]);
    setRecording(false);
    setSeconds(0);
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true })
    );
  };

  const sendText = () => {
    const body = text.trim();
    if (!body) return;
    if (!online) {
      onSendFailed?.();
      return;
    }
    setOutgoing((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, kind: "text", text: body },
    ]);
    setText("");
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true })
    );
  };

  const toggleActionMode = () => {
    lastModeToggleAt.current = Date.now();
    setActionMode((m) => (m === "send" ? "voice" : "send"));
  };

  const onActionPress = () => {
    // ignore the release-press that can follow a long-press
    if (Date.now() - lastModeToggleAt.current < 450) return;
    // single tap mic → record; single tap send → text
    if (actionMode === "voice") {
      startRecording();
      return;
    }
    sendText();
  };

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
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            onPress={onBack}
            style={({ pressed }) => [
              styles.roundBtn,
              pressed && styles.pressed,
            ]}
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            Смирнова Е. С.
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.statusCard}>
          <ClockIcon />
          <Text style={styles.statusText}>
            Отвечает в течение дня. В экстренной ситуации — SOS.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.dateLabel}>Сегодня</Text>

          <View style={styles.outWrap}>
            <View style={styles.outBubble}>
              <Text style={styles.outText}>
                Со вчера сыпь на руках, чешется
              </Text>
            </View>
            <LinearGradient
              colors={["#E8C4B0", "#D4A088"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.photo}
            />
          </View>

          <View style={styles.infoCard}>
            <InfoIcon />
            <Text style={styles.infoText}>
              Отмечено: сыпь, зуд — умеренно, со вчера. Врачу передано как
              возможная реакция на препарат.
            </Text>
          </View>

          <View style={styles.inRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>ЕС</Text>
            </View>
            <View style={styles.inBubble}>
              <Text style={styles.inText}>
                Анна, спасибо. Вечернюю таблетку пока не принимайте — позвоню
                вам в 15:00.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onMedPaused}
            style={({ pressed }) => [
              styles.medCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.medIcon}>
              <PillIcon />
            </View>
            <View style={styles.medText}>
              <Text style={styles.medTitle}>Врач приостановил Авиандр</Text>
              <Text style={styles.medSub}>До осмотра · подробнее</Text>
            </View>
            <Chevron />
          </Pressable>

          {outgoing.map((msg) =>
            msg.kind === "text" ? (
              <View key={msg.id} style={styles.outWrap}>
                <View style={styles.outBubble}>
                  <Text style={styles.outText}>{msg.text}</Text>
                </View>
              </View>
            ) : (
              <View key={msg.id} style={styles.outWrap}>
                <View style={[styles.outBubble, styles.voiceBubble]}>
                  <MicIcon />
                  <Text style={styles.outText}>
                    Голосовое · {formatTimer(msg.seconds)}
                  </Text>
                </View>
              </View>
            )
          )}
        </ScrollView>

        {!recording ? (
          <View style={styles.composer}>
            <View style={styles.quickRow}>
              {QUICK.map((label) => (
                <Pressable
                  key={label}
                  onPress={() => setText(label)}
                  style={({ pressed }) => [
                    styles.quickChip,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.quickText}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Прикрепить"
                onPress={() => setAttachOpen(true)}
                style={({ pressed }) => [
                  styles.roundBtn,
                  pressed && styles.pressed,
                ]}
              >
                <PlusIcon />
              </Pressable>

              <View style={styles.inputWrap}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Сообщение"
                  placeholderTextColor={colors.footer}
                  style={styles.input}
                  multiline
                  blurOnSubmit={false}
                  onSubmitEditing={sendText}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  actionMode === "send"
                    ? "Отправить. Удерживайте, чтобы показать микрофон"
                    : "Нажмите — записать голос. Удерживайте, чтобы показать отправку"
                }
                onPress={onActionPress}
                onLongPress={toggleActionMode}
                delayLongPress={350}
                style={({ pressed }) => [
                  styles.micBtn,
                  pressed && styles.pressed,
                ]}
              >
                {actionMode === "send" ? <SendIcon /> : <MicIcon />}
              </Pressable>
            </View>
            <Text style={styles.composerHint}>
              Удерживайте — сменить режим ввода
            </Text>
          </View>
        ) : (
          <View style={styles.recordWrap}>
            <View style={styles.inputRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Отменить"
                onPress={cancelRecording}
                style={({ pressed }) => [
                  styles.roundBtn,
                  pressed && styles.pressed,
                ]}
              >
                <CloseIcon />
              </Pressable>

              <View style={styles.recordBar}>
                <View style={styles.recDot} />
                <Text style={styles.recTimer}>{formatTimer(seconds)}</Text>
                <Waveform />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Отправить"
                onPress={sendRecording}
                style={({ pressed }) => [
                  styles.micBtn,
                  pressed && styles.pressed,
                ]}
              >
                <SendIcon />
              </Pressable>
            </View>
            <Text style={styles.recordHint}>
              Отправьте или отмените · расшифровку увидит врач
            </Text>
          </View>
        )}
      </View>

      <ChatAttachSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelect={(action) => {
          setAttachOpen(false);
          if (
            (action === "camera" || action === "gallery") &&
            !online
          ) {
            onUploadFailed?.();
            return;
          }
          onAttach?.(action);
        }}
      />
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  dateLabel: {
    alignSelf: "center",
    fontSize: 13,
    lineHeight: 18,
    color: colors.footer,
    marginBottom: 4,
  },
  outWrap: {
    alignItems: "flex-end",
    gap: 8,
  },
  outBubble: {
    maxWidth: "82%",
    backgroundColor: colors.brand,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  outText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.white,
  },
  voiceBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photo: {
    width: 168,
    height: 120,
    borderRadius: 18,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: warnBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: warnInk,
  },
  inRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "92%",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  inBubble: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  medCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: warnBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFE8C8",
    alignItems: "center",
    justifyContent: "center",
  },
  medText: { flex: 1 },
  medTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: warnInk,
  },
  medSub: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: warnIcon,
  },
  composer: {
    gap: 10,
    paddingTop: 4,
  },
  composerHint: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
    marginBottom: 2,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(27, 36, 64, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickText: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.ink,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    backgroundColor: colors.white,
    borderRadius: 24,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    padding: 0,
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  recordWrap: {
    gap: 10,
    paddingTop: 4,
  },
  recordBar: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5484D",
  },
  recTimer: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
    minWidth: 36,
  },
  wave: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2.5,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: colors.brand,
  },
  recordHint: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: colors.footer,
    marginBottom: 2,
  },
  pressed: { opacity: 0.88 },
});
