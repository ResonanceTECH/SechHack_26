import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  value: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
};

const WIDTH = 50;
const HEIGHT = 30;
const PADDING = 3;
const KNOB = HEIGHT - PADDING * 2; // 24

export function Toggle({ value, onValueChange, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      style={({ pressed }) => [
        styles.track,
        value ? styles.trackOn : styles.trackOff,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: value ? WIDTH - PADDING * 2 - KNOB : 0,
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 16,
    padding: PADDING,
    justifyContent: "center",
  },
  trackOn: {
    backgroundColor: colors.brand,
  },
  trackOff: {
    backgroundColor: "#D5DBEA",
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
});
