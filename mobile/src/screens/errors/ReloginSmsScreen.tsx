import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ErrorChrome,
  InfoCard,
  PrimaryButton,
} from "../../components/errors/ErrorChrome";
import { OtpInput } from "../../components/OtpInput";
import { colors } from "../../theme/colors";
import { maskRuPhone } from "../../utils/phone";
import { Headline } from "./parts";

type Props = {
  phone?: string;
  initialCode?: string;
  onConfirm?: (code: string) => void;
  onChangePhone?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function ReloginSmsScreen({
  phone = "+7 916 123-45-67",
  initialCode = "4721",
  onConfirm,
  onChangePhone,
  onBack,
  onDemoAll,
}: Props) {
  const [code, setCode] = useState(initialCode);

  return (
    <ErrorChrome
      headerTitle="Вход"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <PrimaryButton
          label="Подтвердить вход"
          disabled={code.length < 4}
          onPress={() => onConfirm?.(code)}
        />
      }
    >
      <Headline noMargin>Подтвердите вход</Headline>
      <Text style={styles.subtitle}>Отправили на {maskRuPhone(phone)}</Text>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.timer}>Отправить ещё раз через 0:42</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onChangePhone}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>Изменить номер</Text>
        </Pressable>
      </View>

      <View style={styles.infoWrap}>
        <InfoCard
          title="Возвращаемся в ваш аккаунт"
          body="После проверки кода откроется главная. Повторная регистрация не потребуется."
        />
      </View>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  otpWrap: { marginTop: 24 },
  metaRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  timer: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  link: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.brand,
  },
  infoWrap: { marginTop: 16 },
  pressed: { opacity: 0.88 },
});
