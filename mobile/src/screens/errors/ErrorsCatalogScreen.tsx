import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ErrorChrome,
  SecondaryButton,
} from "../../components/errors/ErrorChrome";
import { colors } from "../../theme/colors";
import { BodyText, Headline } from "./parts";

export type ErrorDemoId =
  | "generic"
  | "offline"
  | "service"
  | "checkInSaveFailed"
  | "checkInRetrySuccess"
  | "phoneIncomplete"
  | "smsWrong"
  | "smsExpired"
  | "rateLimit"
  | "inviteInvalid"
  | "sessionExpired"
  | "reloginPhone"
  | "reloginSms"
  | "messageFailed"
  | "photoFailed"
  | "micUnavailable"
  | "cameraUnavailable"
  | "cameraSettings"
  | "questionnaireNoAnswer";

type Item = { id: ErrorDemoId; label: string };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  { items: [{ id: "generic", label: "Общая ошибка" }] },
  {
    title: "Связь и сохранение",
    items: [
      { id: "offline", label: "Нет подключения" },
      { id: "service", label: "Сбой сервиса" },
      { id: "checkInSaveFailed", label: "Отметка не сохранена" },
      { id: "checkInRetrySuccess", label: "Отметка сохранена после повтора" },
    ],
  },
  {
    title: "Вход и подключение",
    items: [
      { id: "phoneIncomplete", label: "Неверный номер телефона" },
      { id: "smsWrong", label: "Неверный код из SMS" },
      { id: "smsExpired", label: "Код из SMS устарел" },
      { id: "rateLimit", label: "Слишком много попыток" },
      { id: "inviteInvalid", label: "Приглашение не действует" },
      { id: "sessionExpired", label: "Сессия истекла" },
      { id: "reloginPhone", label: "Вернуться в аккаунт" },
      { id: "reloginSms", label: "Подтвердите вход (SMS)" },
    ],
  },
  {
    title: "Чат и вложения",
    items: [
      { id: "messageFailed", label: "Сообщение не отправлено" },
      { id: "photoFailed", label: "Фото не загрузилось" },
      { id: "micUnavailable", label: "Микрофон недоступен" },
    ],
  },
  {
    title: "Права доступа",
    items: [
      { id: "cameraUnavailable", label: "Камера недоступна" },
      { id: "cameraSettings", label: "Настройки камеры (внешний шаг)" },
    ],
  },
  {
    title: "Опрос",
    items: [{ id: "questionnaireNoAnswer", label: "Ответ не выбран" }],
  },
];

type Props = {
  onBack?: () => void;
  onOpen?: (id: ErrorDemoId) => void;
};

export function ErrorsCatalogScreen({ onBack, onOpen }: Props) {
  return (
    <ErrorChrome headerTitle="Ошибки · прототип" onBack={onBack}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Headline noMargin>Ошибки и восстановление</Headline>
        <BodyText>
          ПРОТОТИП · выберите состояние. Все кнопки восстановления ведут к
          соответствующему шагу приложения.
        </BodyText>

        {GROUPS.map((group, gi) => (
          <View key={group.title ?? `g${gi}`} style={styles.group}>
            {group.title ? (
              <Text style={styles.sectionTitle} accessibilityRole="header">
                {group.title}
              </Text>
            ) : null}
            <View style={styles.items}>
              {group.items.map((item) => (
                <SecondaryButton
                  key={item.id}
                  label={item.label}
                  onPress={() => onOpen?.(item.id)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ErrorChrome>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
  },
  group: {
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.ink,
    opacity: 0.8,
  },
  items: {
    gap: 12,
  },
});
