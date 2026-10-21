import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, Section, ShieldCheckIcon } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onHowToAllow?: () => void;
  onManualCode?: () => void;
};

export function CameraUnavailableScreen({
  onBack,
  onDemoAll,
  onHowToAllow,
  onManualCode,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Сканирование QR"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Как разрешить доступ" onPress={onHowToAllow} />
          <SecondaryButton label="Ввести код вручную" onPress={onManualCode} />
        </>
      }
    >
      <IconTile bg={colors.iconWarnBg}>
        <ShieldCheckIcon color={colors.warn} />
      </IconTile>
      <Headline>Камера недоступна</Headline>
      <BodyText>
        Для сканирования QR-кода нужен доступ к камере. Его можно разрешить в
        настройках телефона.
      </BodyText>
      <Section>
        <InfoCard
          title="Можно подключиться без камеры"
          body="Введите код из приглашения вручную. Отказ в доступе к камере не блокирует регистрацию."
        />
      </Section>
    </ErrorChrome>
  );
}
