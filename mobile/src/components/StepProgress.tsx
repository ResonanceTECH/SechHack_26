import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  step: number;
  total?: number;
  label: string;
};

export function StepProgress({ step, total = 5, label }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step ? styles.segmentActive : null]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        Шаг {step} из {total} · {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
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
  segmentActive: {
    backgroundColor: colors.brand,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.brand,
  },
});
