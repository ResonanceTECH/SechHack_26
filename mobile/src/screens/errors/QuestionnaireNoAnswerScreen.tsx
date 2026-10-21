import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, InfoCircleIcon, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onReturn?: () => void;
  onContinueLater?: () => void;
  questionLabel?: string;
};

export function QuestionnaireNoAnswerScreen({
  onBack,
  onDemoAll,
  onReturn,
  onContinueLater,
  questionLabel = "Вопрос 1 из 16",
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Опросник"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Вернуться к вопросу" onPress={onReturn} />
          <SecondaryButton label="Продолжить позже" onPress={onContinueLater} />
        </>
      }
    >
      <IconTile bg={colors.iconWarnBg}>
        <InfoCircleIcon color={colors.warn} />
      </IconTile>
      <Headline>Ответ пока не выбран</Headline>
      <BodyText>
        Выберите один вариант ответа или воспользуйтесь действием «Пропустить
        вопрос». Без ответа кнопка «Далее» не продолжает опрос.
      </BodyText>
      <Section>
        <InfoCard
          title={questionLabel}
          body="Предыдущие ответы остаются в черновике. Пропуск не считается ответом «Ни разу» и не подменяет результат."
        />
      </Section>
    </ErrorChrome>
  );
}
