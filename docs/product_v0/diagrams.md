# Диаграммы системы «Клинический компас» (Mermaid)

Ниже приведены диаграммы, дополняющие техническое задание v1.0.  
Их можно отрендерить в любом редакторе с поддержкой Mermaid (VS Code, Notion, Obsidian, GitLab/GitHub и др.).

---

## 1. Высокоуровневая архитектура

```mermaid
graph TD
    subgraph Clients["Клиенты (мобилка / Web)"]
        PA[Пациент: Android / iOS / Web]:::client
        DR[Врач-психиатр / психотерапевт: Web]:::clinical
        PS[Психолог: Web]:::clinical
        CO[Координатор: Web]:::clinical
        ADM[Администратор клиники: Web]:::admin
        SA[Суперадминистратор: Web]:::admin
    end

    subgraph Gateway["Шлюз и защита"]
        API[API-шлюз: OIDC / OAuth 2.0, RBAC]:::gw
        LOG[Журнал доступа / аудит]:::gw
        ENC[Шифрование каналов]:::gw
    end

    subgraph Platform["Платформа (общий контур, concept01)"]
        AUTH[auth / consents]:::svc
        PAT[patients / practitioners]:::svc
        SCR[screening: PHQ-9, GAD-7]:::svc
        MON[monitoring: дневник, временные ряды]:::svc
        CP[care_plans: программы, задания]:::svc
        MSG[appointments / messaging]:::svc
        NOT[notifications / safety]:::svc
        AUD[audit]:::svc
    end

    subgraph RegContour["Рецептурный контур (concept02, изолирован)"]
        RX[Инструкции ГРЛС: Авиандр и др.]:::rx
        SAFE[Безопасность терапии, алертинг]:::rx
    end

    subgraph Data["Данные и инфраструктура"]
        DB[(PostgreSQL: общий контур)]:::data
        DBRX[(PostgreSQL: рецептурный контур)]:::data
        REDIS[(Redis + Celery: уведомления, задачи)]:::data
        FILE[Объектное хранение: контент / медиа]:::data
    end

    Clients --> Gateway
    Gateway --> Platform
    Platform -->|DTO / события через API-границу| RegContour
    Platform --> Data
    RegContour --> DBRX
    LOG -.->|события доступа| AUD

    classDef client fill:#e1f5fe,stroke:#01579b,color:#01579b
    classDef clinical fill:#e8f5e9,stroke:#1b5e20,color:#1b5e20
    classDef admin fill:#fff3e0,stroke:#e65100,color:#e65100
    classDef gw fill:#ede7f6,stroke:#4527a0,color:#4527a0
    classDef svc fill:#f3e5f5,stroke:#6a1b9a,color:#6a1b9a
    classDef rx fill:#fce4ec,stroke:#ad1457,color:#ad1457
    classDef data fill:#eceff1,stroke:#455a64,color:#37474f
```

---

## 2. Последовательность скрининга и уведомления врача

```mermaid
sequenceDiagram
    autonumber
    participant P as Пациент (мобильное приложение)
    participant S as Система (бэкенд)
    participant D as Врач (Web-кабинет)
    participant A as Алертинг / безопасность

    P->>S: Пройти первичный скрининг (PHQ-9, GAD-7)
    S->>S: Подсчитать баллы, сохранить версию опросника
    S->>D: Отобразить результат в карточке пациента

    alt Результат в норме
        S-->>P: Показать обобщённый отчёт без диагноза
    else Потенциально опасный ответ
        rect rgb(255, 235, 238)
            S->>A: Сработал сигнал о риске
            A->>D: Экстренное уведомление (визуальное выделение)
            D->>P: Связаться с пациентом по плану безопасности
        end
    end

    P->>S: Вести ежедневный дневник (настроение, сон, энергия)
    S->>D: Накопленная динамика между консультациями
    D->>S: Назначить упражнения / скорректировать план
    S->>P: Доставить программу и напоминания
```

---

## 3. Дорожная карта с условными переходами (go / no-go)

```mermaid
flowchart TD
    A["Этап 0: Основа<br>Заявление о назначении, команда,<br>риск, каркас QMS"]:::stage
    B["Этап 1: Прототип курса<br>Черновик 6-недельной программы,<br>тесты с врачами и пациентами"]:::stage
    C["Этап 2: Платформа<br>Регуляторный контур, управляемая<br>разработка, версия для пилота"]:::stage
    D["Этап 3: Пилот<br>20–50 пациентов, 1–2 клиники,<br>приверженность, безопасность"]:::stage
    E["Этап 4: Исследование<br>Протокол, этика, центры,<br>рандомизация, анализ эффекта"]:::stage
    F["Этап 5: Регистрация и запуск<br>Регистрационное удостоверение,<br>договор с плательщиками"]:::stage
    Z["Остановить /<br>пересмотреть концепцию"]:::stop

    A -->|go| B
    B -->|go| C
    C -->|go| D
    D -->|go| E
    E -->|go| F
    A -.->|no-go| Z
    B -.->|no-go| Z
    C -.->|no-go| Z
    D -.->|no-go| Z
    E -.->|no-go| Z

    linkStyle default stroke:#1565c0,stroke-width:2px
    classDef stage fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    classDef stop fill:#ffebee,stroke:#c62828,color:#b71c1c
```

---

## 4. Роли и права доступа

```mermaid
graph LR
    subgraph Patients["Пациенты и близкие"]
        PA[Пациент]:::patient
        CL["Близкий человек<br>(по согласию пациента)"]:::patient
    end

    subgraph Clinical["Клинические роли"]
        DR["Врач-психиатр /<br>психотерапевт"]:::clinical
        PS[Психолог]:::clinical
        CO[Координатор]:::clinical
    end

    subgraph Admin["Административные роли"]
        ADM["Администратор<br>клиники"]:::admin
        SA["Суперадминистратор"]:::admin
    end

    PA -->|свой дневник, скрининг, программа| DR
    CL -->|ограниченный доступ<br>по согласию| DR
    DR -->|решение, назначения, мониторинг| PA
    PS -->|упражнения, обратная связь| PA
    CO -->|запись, организационные контакты| PA
    ADM -->|роли, права, аналитика| DR
    SA -->|безопасность, аудит, интеграции| ADM

    classDef patient fill:#e1f5fe,stroke:#01579b,color:#01579b
    classDef clinical fill:#e8f5e9,stroke:#1b5e20,color:#1b5e20
    classDef admin fill:#fff3e0,stroke:#e65100,color:#e65100
```

---

## 5. Разделение контуров (платформа vs рецептурный модуль)

```mermaid
graph TD
    subgraph Core["Ядро платформы (concept01)"]
        SCR1[Скрининг PHQ-9 / GAD-7]:::core
        MON1[Дневник состояния]:::core
        CP1["Персональная программа КПТ<br>(назначения врача)"]:::core
        MSG1[Записи и сообщения]:::core
    end

    subgraph Rx["Рецептурный цифровой модуль (concept02)"]
        RX1["Инструкции ГРЛС:<br>Авиандр и др."]:::rx
        RX2["Режим дозирования<br>и отмены"]:::rx
        RX3["Алертинг по<br>безопасности терапии"]:::rx
    end

    subgraph Boundary["API-граница (DTO / события, без прямого доступа к таблицам)"]
        GW[Изолированный шлюз обмена]:::gw
    end

    Core -->|данные для рабочего процесса врача| GW
    GW -->|рекомендации и предупреждения| Rx
    Rx -.->|только через API-границу| Core

    classDef core fill:#f3e5f5,stroke:#6a1b9a,color:#6a1b9a
    classDef rx fill:#fce4ec,stroke:#ad1457,color:#ad1457
    classDef gw fill:#ede7f6,stroke:#4527a0,color:#4527a0
```
