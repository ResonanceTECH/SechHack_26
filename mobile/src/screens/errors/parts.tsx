import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors";

export function Headline({
  children,
  center,
  noMargin,
}: {
  children: ReactNode;
  center?: boolean;
  noMargin?: boolean;
}) {
  return (
    <Text
      style={[
        styles.headline,
        noMargin && styles.noMargin,
        center && styles.center,
      ]}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  center,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return <Text style={[styles.body, center && styles.center]}>{children}</Text>;
}

export function Section({ children }: { children: ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

type IconProps = { color: string; size?: number };

function Icon({
  color,
  size = 32,
  paths,
}: IconProps & { paths: string[] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}

export const WifiOffIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M3 3 L21 21",
      "M1.5 8.5 C4.5 5.8 8.1 4.5 12 4.5 C15.9 4.5 19.5 5.8 22.5 8.5",
      "M5 12.5 C7 10.7 9.4 9.7 12 9.7 C14.6 9.7 17 10.7 19 12.5",
      "M8.5 16 C9.5 15.1 10.7 14.7 12 14.7 C13.3 14.7 14.5 15.1 15.5 16",
      "M12 19.5 L12.01 19.5",
    ]}
  />
);

export const WarningIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={["M12 3.5 L21.5 20 H2.5 Z", "M12 10 V14", "M12 17 L12.01 17"]}
  />
);

export const LockIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M7.5 11 V8 C7.5 5.5 9.5 3.5 12 3.5 C14.5 3.5 16.5 5.5 16.5 8 V11",
      "M6.5 11 H17.5 C18.6 11 19 11.4 19 12.5 V19 C19 20.1 18.6 20.5 17.5 20.5 H6.5 C5.4 20.5 5 20.1 5 19 V12.5 C5 11.4 5.4 11 6.5 11 Z",
      "M12 15 V16.5",
    ]}
  />
);

export const ClockIcon = (p: IconProps) => (
  <Icon
    {...p}
    size={p.size ?? 18}
    paths={[
      "M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12 Z",
      "M12 7 V12 L15.5 14",
    ]}
  />
);

export const DocumentIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M6 4 H18 V20 H6 Z",
      "M9 9 H15",
      "M9 12.5 H15",
      "M9 16 H13",
    ]}
  />
);

export const ShieldCheckIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M12 3 L19 6 V12 C19 16.5 16 19.5 12 21 C8 19.5 5 16.5 5 12 V6 Z",
      "M9 12 L11.2 14.2 L15 10",
    ]}
  />
);

export const MicOffIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M12 3 C10.6 3 9.5 4.1 9.5 5.5 V11.5 C9.5 12.9 10.6 14 12 14 C13.4 14 14.5 12.9 14.5 11.5 V5.5 C14.5 4.1 13.4 3 12 3 Z",
      "M6 11 C6 14.3 8.7 17 12 17 C15.3 17 18 14.3 18 11",
      "M12 17 V21",
      "M4 4 L20 20",
    ]}
  />
);

export const InfoCircleIcon = (p: IconProps) => (
  <Icon
    {...p}
    paths={[
      "M3 12 A9 9 0 1 0 21 12 A9 9 0 1 0 3 12 Z",
      "M12 11 V16",
      "M12 8 L12.01 8",
    ]}
  />
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p} paths={["M5 12.5 L10 17.5 L19 7"]} />
);

const styles = StyleSheet.create({
  headline: {
    marginTop: 20,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: colors.ink,
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  section: { marginTop: 20 },
  noMargin: { marginTop: 0 },
  center: { textAlign: "center" },
});
