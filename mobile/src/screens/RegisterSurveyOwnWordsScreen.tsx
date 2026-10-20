import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenGradient } from "../components/ScreenGradient";
import { colors } from "../theme/colors";

type Props = {
  initialText?: string;
  onBack?: () => void;
  onSave?: (text: string) => void;
  onRecordVoice?: () => void;
};

const DEFAULT_TEXT =
  "Последние месяцы постоянно тревожно, долго не могу уснуть, срываюсь на близких.";

function MicIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M12 3 C10.3 3 9 4.3 9 6 V12 C9 13.7 10.3 15 12 15 C13.7 15 15 13.7 15 12 V6 C15 4.3 13.7 3 12 3 Z"
        stroke={colors.brand}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M6.5 12 C6.5 15.6 9.1 18.2 12.5 18.5 M17.5 12 C17.5 15.6 14.9 18.2 11.5 18.5 M12 18.5 V21"
        stroke={colors.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function RegisterSurveyOwnWordsScreen({
  initialText = DEFAULT_TEXT,
  onBack,
  onSave,
  onRecordVoice,
}: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(initialText);
  const [focused, setFocused] = useState(true);

  return (
    <ScreenGradient soft>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <View style={styles.top}>
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Назад"
                onPress={onBack}
                style={({ pressed }) => [
                  styles.backBtn,
                  pressed && styles.pressed,
                ]}
              >
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
              </Pressable>
              <Text style={styles.headerTitle}>Анкета</Text>
              <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.title}>Расскажите своими словами</Text>
            <Text style={styles.subtitle}>
              Что беспокоит и с чего началось. Можно голосом.
            </Text>

            <View style={[styles.card, focused && styles.cardFocused]}>
              <TextInput
                value={text}
                onChangeText={setText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                multiline
                textAlignVertical="top"
                autoFocus
                style={styles.input}
                placeholder="Опишите, что беспокоит…"
                placeholderTextColor={colors.footer}
                selectionColor={colors.brand}
                cursorColor={colors.brand}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onRecordVoice}
              style={({ pressed }) => [
                styles.voiceBtn,
                pressed && styles.pressed,
              ]}
            >
              <MicIcon />
              <Text style={styles.voiceText}>Записать голосом</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onSave?.(text.trim())}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryText}>Сохранить</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    flexShrink: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  backBtn: {
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
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  headerSpacer: { width: 40 },
  title: {
    marginTop: 28,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  card: {
    marginTop: 24,
    minHeight: 168,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardFocused: {
    borderColor: colors.brand,
  },
  input: {
    flexGrow: 1,
    minHeight: 136,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    fontWeight: "500",
    padding: 0,
  },
  voiceBtn: {
    alignSelf: "flex-start",
    marginTop: 16,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: "rgba(59, 120, 255, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  voiceText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    color: colors.brand,
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
