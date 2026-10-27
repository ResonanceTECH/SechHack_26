import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";
import { colors } from "../theme/colors";

type Props = {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
};

export function OtpInput({ length = 4, value, onChange, error }: Props) {
  const inputRef = useRef<TextInputType>(null);
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, "").slice(0, length).split("");
  const activeIndex = Math.min(digits.length, length - 1);

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length }, (_, i) => {
        const char = digits[i] ?? "";
        const isActive = focused && i === activeIndex;
        return (
          <View
            key={i}
            style={[
              styles.cell,
              isActive && styles.cellActive,
              error && styles.cellError,
            ]}
          >
            {char ? (
              <Text style={styles.digit}>{char}</Text>
            ) : isActive ? (
              <View style={styles.caret} />
            ) : null}
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  cell: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#1B2440",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cellActive: {
    borderColor: colors.brand,
  },
  cellError: {
    borderColor: colors.error,
  },
  digit: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
  },
  caret: {
    width: 2,
    height: 28,
    borderRadius: 1,
    backgroundColor: colors.brand,
  },
  hidden: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
});
