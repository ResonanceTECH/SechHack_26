import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import type { MedicationItem } from "./RegisterMedsScreen";

type Props = {
  initialQuery?: string;
  onBack?: () => void;
  onAdd?: (med: MedicationItem) => void;
  onAddManual?: () => void;
};

const CATALOG: MedicationItem[] = [
  { id: "sertr-50", name: "Сертралин 50 мг", form: "таблетки" },
  { id: "sertr-100", name: "Сертралин 100 мг", form: "таблетки" },
  { id: "aviandr-20", name: "Авиандр 20 мг", form: "таблетки" },
  { id: "escit-10", name: "Эсциталопрам 10 мг", form: "таблетки" },
  { id: "escit-20", name: "Эсциталопрам 20 мг", form: "таблетки" },
  { id: "quet-25", name: "Кветиапин 25 мг", form: "таблетки" },
  { id: "quet-100", name: "Кветиапин 100 мг", form: "таблетки" },
];

const pillPurple = "#7B6CFF";

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M11 4 C7.1 4 4 7.1 4 11 C4 14.9 7.1 18 11 18 C12.8 18 14.4 17.3 15.6 16.2 L19.5 20.1"
        stroke={colors.brand}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function PillIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M8.5 15.5 L15.5 8.5 C17 7 19.5 7 21 8.5 C22.5 10 22.5 12.5 21 14 L14 21 C12.5 22.5 10 22.5 8.5 21 C7 19.5 7 17 8.5 15.5 Z"
        stroke={pillPurple}
        strokeWidth={1.8}
        fill="none"
      />
      <Path
        d="M11 13 L13.5 10.5"
        stroke={pillPurple}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 5 V19 M5 12 H19"
        stroke={colors.brand}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function RegisterAddMedScreen({
  initialQuery = "Сертр",
  onBack,
  onAdd,
  onAddManual,
}: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(true);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CATALOG.filter((item) => item.name.toLowerCase().includes(q));
  }, [query]);

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
            <Text style={styles.headerTitle}>Добавить лекарство</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View
            style={[styles.search, focused && styles.searchFocused]}
          >
            <SearchIcon />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              autoCorrect={false}
              placeholder="Название лекарства"
              placeholderTextColor={colors.footer}
              selectionColor={colors.brand}
              cursorColor={colors.brand}
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {results.length > 0 ? (
              <View style={styles.card}>
                {results.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.row}>
                      <View style={styles.pillIcon}>
                        <PillIcon />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.medName}>{item.name}</Text>
                        <Text style={styles.medForm}>{item.form}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Добавить ${item.name}`}
                        onPress={() => onAdd?.(item)}
                        hitSlop={10}
                        style={({ pressed }) => [
                          styles.plusBtn,
                          pressed && styles.pressed,
                        ]}
                      >
                        <PlusIcon />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : query.trim().length > 0 ? (
              <Text style={styles.empty}>Ничего не найдено</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={onAddManual}
              style={({ pressed }) => [
                styles.manualWrap,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.manualText}>Не нашли? Добавить вручную</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Список — из Государственного реестра лекарственных средств.
            </Text>
          </ScrollView>
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
  search: {
    marginTop: 24,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.brand,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchFocused: {
    borderColor: colors.brand,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
    padding: 0,
  },
  scroll: { flex: 1, marginTop: 16 },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: "#1B2440",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFEAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  medName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  medForm: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  plusBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(27,36,64,0.1)",
    marginLeft: 66,
  },
  empty: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
  manualWrap: {
    marginTop: 22,
    alignItems: "center",
  },
  manualText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.brand,
  },
  disclaimer: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    color: colors.footer,
    paddingHorizontal: 12,
  },
  pressed: { opacity: 0.88 },
});
