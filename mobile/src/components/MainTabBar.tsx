import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme/colors";

export type MainTabId = "home" | "diary" | "treatment" | "chat";

type Props = {
  active: MainTabId;
  onTab?: (tab: MainTabId) => void;
  onAdd?: () => void;
};

function HomeIcon({ active }: { active?: boolean }) {
  const c = active ? colors.brand : colors.muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z"
        stroke={c}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DiaryIcon({ active }: { active?: boolean }) {
  const c = active ? colors.brand : colors.muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M7 4 H18 V20 H7 C5.9 20 5 19.1 5 18 V6 C5 4.9 5.9 4 7 4 Z"
        stroke={c}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M9 8 H15 M9 12 H15"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TreatmentIcon({ active }: { active?: boolean }) {
  const c = active ? colors.brand : colors.muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {/* diagonal capsule — matches med cards */}
      <Path
        d="M8.2 15.8 C6.3 13.9 6.3 10.8 8.2 8.9 L10.9 6.2 C12.8 4.3 15.9 4.3 17.8 6.2 C19.7 8.1 19.7 11.2 17.8 13.1 L15.1 15.8 C13.2 17.7 10.1 17.7 8.2 15.8 Z"
        stroke={c}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M9.6 9.6 L14.4 14.4"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChatIcon({ active }: { active?: boolean }) {
  const c = active ? colors.brand : colors.muted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M5 6.5 C5 5.1 6.1 4 7.5 4 H16.5 C17.9 4 19 5.1 19 6.5 V13.5 C19 14.9 17.9 16 16.5 16 H10 L6 19.5 V16 H7.5 C6.1 16 5 14.9 5 13.5 Z"
        stroke={c}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MainTabBar({ active, onTab, onAdd }: Props) {
  return (
    <View style={styles.tabBar}>
      <Pressable style={styles.tabItem} onPress={() => onTab?.("home")}>
        {active === "home" ? (
          <View style={styles.tabActiveWrap}>
            <HomeIcon active />
          </View>
        ) : (
          <HomeIcon />
        )}
        <Text
          style={active === "home" ? styles.tabLabelActive : styles.tabLabel}
        >
          Главная
        </Text>
      </Pressable>

      <Pressable style={styles.tabItem} onPress={() => onTab?.("diary")}>
        {active === "diary" ? (
          <View style={styles.tabActiveWrap}>
            <DiaryIcon active />
          </View>
        ) : (
          <DiaryIcon />
        )}
        <Text
          style={active === "diary" ? styles.tabLabelActive : styles.tabLabel}
        >
          Дневник
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Добавить"
        onPress={onAdd}
        style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path
            d="M12 5 V19 M5 12 H19"
            stroke={colors.white}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </Svg>
      </Pressable>

      <Pressable style={styles.tabItem} onPress={() => onTab?.("treatment")}>
        {active === "treatment" ? (
          <View style={styles.tabActiveWrap}>
            <TreatmentIcon active />
          </View>
        ) : (
          <TreatmentIcon />
        )}
        <Text
          style={
            active === "treatment" ? styles.tabLabelActive : styles.tabLabel
          }
        >
          Лечение
        </Text>
      </Pressable>

      <Pressable style={styles.tabItem} onPress={() => onTab?.("chat")}>
        {active === "chat" ? (
          <View style={styles.tabActiveWrap}>
            <ChatIcon active />
          </View>
        ) : (
          <ChatIcon />
        )}
        <Text
          style={active === "chat" ? styles.tabLabelActive : styles.tabLabel}
        >
          Чат
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 28,
    minHeight: 68,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1B2440",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tabItem: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabActiveWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
  },
  tabLabelActive: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brand,
  },
  addBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowColor: colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pressed: { opacity: 0.88 },
});
