import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, CheckIcon, Headline, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onHome?: () => void;
  onDiary?: () => void;
};

export function CheckInRetrySuccessScreen({
  onBack,
  onDemoAll,
  onHome,
  onDiary,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Ежедневная отметка"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="На главную" onPress={onHome} />
          <SecondaryButton label="Открыть дневник" onPress={onDiary} />
        </>
      }
    >
      <IconTile bg={colors.iconSuccessBg}>
        <CheckIcon color={colors.success} />
      </IconTile>
      <Headline>Отметка сохранена</Headline>
      <BodyText>
        Повторная попытка прошла успешно. Ответы сохранены одной записью.
      </BodyText>
      <Section>
        <InfoCard
          title="Готово"
          body="Больше нажимать «Сохранить» не нужно. Отметка доступна врачу в рамках предоставленного доступа."
        />
      </Section>
    </ErrorChrome>
  );
}
