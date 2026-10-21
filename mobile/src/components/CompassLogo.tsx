import { Image, StyleSheet, View } from "react-native";
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
        <Image
          source={require("../../assets/compass-in-circle.png")}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode="cover"
        />
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
    overflow: "hidden",
    shadowColor: "#8EAEFF",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
