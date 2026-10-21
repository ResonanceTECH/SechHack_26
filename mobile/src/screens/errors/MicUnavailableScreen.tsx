import {
  ErrorChrome,
  IconTile,
  InfoCard,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, MicOffIcon, Section } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onHowToAllow?: () => void;
  onWriteText?: () => void;
};

export function MicUnavailableScreen({
  onBack,
  onDemoAll,
  onHowToAllow,
  onWriteText,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Сообщение врачу"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Как разрешить доступ" onPress={onHowToAllow} />
          <SecondaryButton label="Написать текстом" onPress={onWriteText} />
        </>
      }
    >
      <IconTile bg={colors.iconWarnBg}>
        <MicOffIcon color={colors.warn} />
      </IconTile>
      <Headline>Микрофон недоступен</Headline>
      <BodyText>
        Чтобы записать голосовое сообщение, разрешите приложению доступ к
        микрофону.
      </BodyText>
      <Section>
        <InfoCard
          title="Вы можете написать текстом"
          body="Чат и остальные функции приложения остаются доступны без микрофона."
        />
      </Section>
    </ErrorChrome>
  );
}
