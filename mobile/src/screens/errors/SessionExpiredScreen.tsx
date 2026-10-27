import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, LockIcon, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onLogin?: () => void;
};

export function SessionExpiredScreen({ onBack, onDemoAll, onLogin }: Props) {
  return (
    <ErrorChrome
      headerTitle="Безопасность"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <PrimaryButton label="Войти по номеру телефона" onPress={onLogin} />
      }
    >
      <IconTile bg={colors.iconErrorBg}>
        <LockIcon color={colors.error} />
      </IconTile>
      <Headline>Войдите ещё раз</Headline>
      <BodyText>
        Сессия завершилась. Подтвердите номер телефона, чтобы вернуться в
        аккаунт.
      </BodyText>
      <Section>
        <InfoCard
          title="Данные аккаунта не удалены"
          body="До повторного входа медицинские записи скрыты. Повторять регистрацию и согласия не нужно."
        />
      </Section>
    </ErrorChrome>
  );
}
