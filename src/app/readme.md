# EmpressCore

Точка входа в приложение. Отвечает за инициализацию и настройку всех модулей фреймворка, управление жизненным циклом и связывание сигналов с группами систем.

## Назначение

Модуль решает следующие задачи:
- Инициализация всех модулей фреймворка
- Регистрация и управление зависимостями
- Связывание сигналов с группами систем
- Управление жизненным циклом приложения

## Архитектура

EmpressCore является фасадом для всех основных модулей фреймворка:

1. **Модули данных**:
   - `EntityStorage` - хранилище игровых сущностей
   - `SystemsContainer` - кэш систем

2. **Модули выполнения**:
   - `ExecutionController` - управление выполнением систем
   - `SignalsController` - управление сигналами
   - `LifeCycle` - управление жизненным циклом

3. **Вспомогательные модули**:
   - `TimerController` - управление таймерами
   - `ServiceContainer` - контейнер зависимостей

## Использование

### Базовая инициализация

```typescript
// Создание приложения
const empress = new EmpressCore();

// Инициализация модулей
empress.init();

// Запуск
empress.start();
```

### Связывание сигналов и групп

```typescript
// Конфигурация связей
const baseSignals: ISignalConfig[] = [
    {
        signal: OnUpdateSignal,
        groups: [PhysicsGroup, AnimationGroup]
    },
    {
        signal: OnStartSignal,
        groups: [InitializationGroup]
    }
];

// Установка связей
empress.listen(baseSignals);
```

### Регистрация глобальных сервисов

```typescript
// Регистрация пользовательских сервисов
empress.registerGlobalServices([
    { 
        provide: GameState, 
        useFactory: () => new GameState() 
    },
    { 
        provide: ResourceLoader, 
        useFactory: () => new ResourceLoader() 
    }
]);
```

## API

### EmpressCore

#### Методы

- `init(): void` - инициализирует все модули приложения
- `start(): void` - запускает приложение
- `listen(configs: ISignalConfig[]): void` - устанавливает связи между сигналами и группами
- `registerGlobalServices(providers: Provider[]): void` - регистрирует глобальные сервисы

#### Интерфейсы

```typescript
interface ISignalConfig {
    signal: Signal<any>;
    groups: GroupType<any>[];
}

interface Provider {
    provide: any;
    useFactory: () => any;
}
```

## Порядок инициализации

1. **Создание приложения**:
   ```typescript
   const empress = new EmpressCore();
   ```

2. **Инициализация модулей**:
   ```typescript
   empress.init();
   ```
   - Создаются основные сервисы
   - Регистрируются зависимости
   - Настраивается жизненный цикл

3. **Установка связей сигналов**:
   ```typescript
   empress.listen(baseSignals);
   ```
   - Связываются сигналы и группы систем
   - Устанавливаются подписки

4. **Запуск приложения**:
   ```typescript
   empress.start();
   ```
   - Запускается жизненный цикл
   - Отправляется сигнал старта
   - Начинается выполнение систем

## Доступ к сервисам

Все основные модули фреймворка регистрируются как глобальные сервисы и доступны через внедрение зависимостей:

### Основные сервисы

- `EntityStorage` - хранилище сущностей
- `SystemsContainer` - контейнер систем
- `LifeCycle` - управление жизненным циклом
- `TimerController` - управление таймерами
- `ExecutionController` - управление выполнением
- `SignalsController` - управление сигналами

### Способы получения сервисов

1. **Через декоратор @Inject в Системах и Группах:**
```typescript
class PhysicsSystem extends System {
    @Inject(TimerController)
    private timerController!: TimerController;

    @Inject(EntityStorage)
    private entityStorage!: EntityStorage;
}
```

2. **Через ServiceContainer напрямую:**
```typescript
const lifecycle = ServiceContainer.instance.get(LifeCycle);
const entityStorage = ServiceContainer.instance.get(EntityStorage);
```

### Подключение пользовательских сервисов

Все дополнительные модули и аддоны для фреймворка рекомендуется регистрировать как глобальные сервисы. Это обеспечивает:
- Единую точку доступа к сервису
- Возможность внедрения в любую Систему или Группу
- Управление жизненным циклом сервиса

```typescript
// Регистрация пользовательского сервиса
empress.registerGlobalServices([
    { 
        provide: GameStateManager,
        useFactory: () => new GameStateManager()
    }
]);

// Использование в системе
class GameSystem extends System {
    @Inject(GameStateManager)
    private gameState!: GameStateManager;
}
```

## FAQ

### Когда регистрировать пользовательские сервисы?

Пользовательские сервисы лучше регистрировать после `init()`, но до `start()`:

```typescript
empress.init();
empress.registerGlobalServices([...custom-services]);
empress.start();
```

### Как добавить системы, выполняемые при старте?

Используйте `OnStartSignal` в конфигурации сигналов:

```typescript
const signals = [{
    signal: OnStartSignal,
    groups: [LoadingGroup, InitGroup]
}];
empress.listen(signals);
```

### Можно ли добавлять сигналы после старта?

Да, метод `listen()` можно вызывать в любой момент:

```typescript
// Добавление новых сигналов
empress.listen([{
    signal: customSignal,
    groups: [CustomGroup]
}]);
```
