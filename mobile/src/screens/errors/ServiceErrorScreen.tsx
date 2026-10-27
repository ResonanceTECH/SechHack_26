import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, Section, WarningIcon } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onRetry?: () => void;
  onSafetyPlan?: () => void;
};

export function ServiceErrorScreen({
  onBack,
  onDemoAll,
  onRetry,
  onSafetyPlan,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Загрузка данных"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Попробовать ещё раз" onPress={onRetry} />
          <SecondaryButton
            label="Открыть план безопасности"
            onPress={onSafetyPlan}
          />
        </>
      }
    >
      <IconTile bg={colors.iconErrorBg}>
        <WarningIcon color={colors.error} />
      </IconTile>
      <Headline>Не удалось загрузить данные</Headline>
      <BodyText>
        На стороне сервиса временный сбой. Попробуйте обновить экран через
        некоторое время.
      </BodyText>
      <Section>
        <InfoCard
          title="Ваши записи в аккаунте сохранены"
          body="Не нужно повторно проходить регистрацию или заполнять прошлые отметки."
        />
      </Section>
    </ErrorChrome>
  );
}
