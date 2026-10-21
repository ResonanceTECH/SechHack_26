import { Pressable, StyleSheet, Text } from "react-native";
import {
  ErrorChrome,
  IconTile,
  SecondaryButton,
  WarnBanner,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, ClockIcon, Headline, LockIcon, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onChangePhone?: () => void;
  onDemoUnlocked?: () => void;
};

export function RateLimitScreen({
  onBack,
  onDemoAll,
  onChangePhone,
  onDemoUnlocked,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Вход по SMS"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={<SecondaryButton label="Изменить номер" onPress={onChangePhone} />}
    >
      <IconTile bg={colors.iconWarnBg}>
        <LockIcon color={colors.warn} />
      </IconTile>
      <Headline>Слишком много попыток</Headline>
      <BodyText>
        Для защиты аккаунта ввод и повторная отправка кода временно ограничены.
      </BodyText>
      <Section>
        <WarnBanner
          icon={<ClockIcon color={colors.warn} />}
          title="Повторите через 1 минуту"
          body="Дождитесь окончания ограничения. Не запрашивайте несколько кодов подряд."
        />
      </Section>
      {onDemoUnlocked ? (
        <Section>
          <Pressable
            accessibilityRole="button"
            onPress={onDemoUnlocked}
            style={({ pressed }) => [styles.demoLink, pressed && styles.pressed]}
          >
            <Text style={styles.demoText}>Демо · прошла 1 минута</Text>
          </Pressable>
        </Section>
      ) : null}
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  demoLink: { alignSelf: "flex-start", paddingVertical: 4 },
  demoText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.brand,
  },
  pressed: { opacity: 0.88 },
});
