import { StyleSheet, View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

type Props = ViewProps & {
  soft?: boolean;
};

export function ScreenGradient({ soft = false, style, children, ...rest }: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={
          soft
            ? [colors.gradientTopSoft, "rgba(244,246,252,0)", colors.bgApp]
            : [colors.gradientTop, "rgba(244,246,252,0)", colors.bgApp]
        }
        locations={soft ? [0, 0.38, 1] : [0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
});
