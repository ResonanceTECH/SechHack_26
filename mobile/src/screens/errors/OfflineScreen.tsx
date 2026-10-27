import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, Section, WifiOffIcon } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onRetry?: () => void;
  onOfflineCheckIn?: () => void;
};

export function OfflineScreen({
  onBack,
  onDemoAll,
  onRetry,
  onOfflineCheckIn,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Нет сети"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Повторить подключение" onPress={onRetry} />
          <SecondaryButton
            label="Сделать отметку без сети"
            onPress={onOfflineCheckIn}
          />
        </>
      }
    >
      <IconTile bg={colors.iconWarnBg}>
        <WifiOffIcon color={colors.warn} />
      </IconTile>
      <Headline>Не удалось подключиться</Headline>
      <BodyText>
        Проверьте Wi-Fi или мобильный интернет и попробуйте ещё раз.
      </BodyText>
      <Section>
        <InfoCard
          title="Можно продолжить без сети"
          body="Отметки сохранятся на устройстве и отправятся врачу после подключения. Новые сообщения пока не приходят."
        />
      </Section>
    </ErrorChrome>
  );
}
