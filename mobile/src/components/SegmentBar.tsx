import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  step: number;
  total?: number;
};

export function SegmentBar({ step, total = 3 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[styles.segment, i < step ? styles.active : null]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
  },
  active: {
    backgroundColor: colors.brand,
  },
});
