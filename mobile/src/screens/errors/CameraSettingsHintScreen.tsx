import {
  ErrorChrome,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { BodyText, Headline, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onGranted?: () => void;
  onCancel?: () => void;
};

export function CameraSettingsHintScreen({
  onBack,
  onDemoAll,
  onGranted,
  onCancel,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Внешний шаг · настройки"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Демо · доступ разрешён" onPress={onGranted} />
          <SecondaryButton label="Вернуться без изменений" onPress={onCancel} />
        </>
      }
    >
      <Headline noMargin>Разрешите доступ к камере</Headline>
      <BodyText>
        Откройте настройки телефона → Клинический компас → Камера. Вернитесь в
        приложение после изменения разрешения.
      </BodyText>
      <Section>
        <InfoCard
          title="ПРОТОТИП · действие вне приложения"
          body="Этот экран показывает шаг в настройках телефона. Кнопка ниже моделирует возвращение с выданным разрешением."
        />
      </Section>
    </ErrorChrome>
  );
}
