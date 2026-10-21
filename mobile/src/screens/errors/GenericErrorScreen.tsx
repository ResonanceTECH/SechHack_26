import { StyleSheet, View } from "react-native";
import {
  ErrorChrome,
  IconTile,
  PrimaryButton,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline, WarningIcon } from "./parts";

type Props = {
  onBack?: () => void;
  onDemoAll?: () => void;
  onRetry?: () => void;
  onHome?: () => void;
};

export function GenericErrorScreen({
  onBack,
  onDemoAll,
  onRetry,
  onHome,
}: Props) {
  return (
    <ErrorChrome
      headerTitle="Ошибка"
      onBack={onBack}
      onDemoAll={onDemoAll}
      footer={
        <>
          <PrimaryButton label="Попробовать снова" onPress={onRetry} />
          <SecondaryButton label="На главную" onPress={onHome} />
        </>
      }
    >
      <View style={styles.center}>
        <IconTile bg={colors.iconErrorBg}>
          <WarningIcon color={colors.error} />
        </IconTile>
        <Headline center>Что-то пошло не так</Headline>
        <BodyText center>
          Не удалось выполнить действие. Попробуйте ещё раз чуть позже.
        </BodyText>
      </View>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
  },
});
