import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../theme/colors";

type Props = {
  size?: number;
};

export function CompassLogo({ size = 120 }: Props) {
  const ring = size + 36;
  const glow = size + 72;

  return (
    <View style={[styles.wrap, { width: glow, height: glow }]}>
      <View
        style={[
          styles.glow,
          {
            width: glow,
            height: glow,
            borderRadius: glow / 2,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
          },
        ]}
      />
      <View
        style={[
          styles.disk,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Svg width={size * 0.46} height={size * 0.46} viewBox="0 0 64 64">
          <Circle
            cx="32"
            cy="32"
            r="27"
            stroke={colors.brand}
            strokeWidth="3.2"
            fill="none"
          />
          {/* tilted compass diamond */}
          <Path
            d="M38 12 L50 38 L26 52 L14 26 Z"
            stroke={colors.brand}
            strokeWidth="3.2"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: colors.brandGlow,
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "transparent",
  },
  disk: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8EAEFF",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
