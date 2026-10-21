import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, DocumentIcon, Headline, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onEnterCode?: () => void;
};

export function InviteInvalidScreen({ onBack, onDemoAll, onEnterCode }: Props) {
  return (
    <ErrorChrome
      headerTitle="Подключение к врачу"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={<PrimaryButton label="Ввести другой код" onPress={onEnterCode} />}
    >
      <IconTile bg={colors.iconErrorBg}>
        <DocumentIcon color={colors.error} />
      </IconTile>
      <Headline>Приглашение не действует</Headline>
      <BodyText>
        Срок действия кода мог закончиться или клиника отозвала приглашение.
        Проверьте, что открываете последнее приглашение.
      </BodyText>
      <Section>
        <InfoCard
          title="Попросите новый код у клиники"
          body="Пока приглашение не подтверждено, доступ к вашим данным врачу не открывается."
        />
      </Section>
    </ErrorChrome>
  );
}
