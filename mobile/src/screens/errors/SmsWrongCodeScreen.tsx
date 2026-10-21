import { SmsErrorLayout } from "./SmsErrorLayout";

type Props = {
  phone?: string;
  onRetry?: () => void;
  onChangePhone?: () => void;
  onBack?: () => void;
  onDemoAll?: () => void;
};

export function SmsWrongCodeScreen({
  phone,
  onRetry,
  onChangePhone,
  onBack,
  onDemoAll,
}: Props) {
  return (
    <SmsErrorLayout
      phone={phone}
      initialCode="4720"
      alertTitle="Код не подошёл"
      alertBody="Проверьте четыре цифры и попробуйте снова. Осталось 2 попытки."
      primaryLabel="Ввести код заново"
      onPrimary={onRetry}
      onChangePhone={onChangePhone}
      onBack={onBack}
      onDemoAll={onDemoAll}
    />
  );
}
