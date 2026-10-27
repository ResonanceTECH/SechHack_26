import { SmsErrorLayout } from "./SmsErrorLayout";

type Props = {
  phone?: string;
  onResend?: () => void;
  onChangePhone?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function SmsExpiredScreen({
  phone,
  onResend,
  onChangePhone,
  onBack,
  onDemoAll,
}: Props) {
  return (
    <SmsErrorLayout
      phone={phone}
      initialCode="4721"
      alertTitle="Срок действия кода истёк"
      alertBody="Запросите новое SMS. Используйте код из последнего сообщения."
      primaryLabel="Получить новый код"
      onPrimary={onResend}
      onChangePhone={onChangePhone}
      onBack={onBack}
      onDemoAll={onDemoAll}
    />
  );
}
