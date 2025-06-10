# Модуль ServiceContainer

## Описание
Модуль `ServiceContainer` реализует паттерн Dependency Injection в ECS фреймворке. Он позволяет управлять зависимостями как на глобальном уровне, так и на уровне отдельных модулей.

## Назначение
- Управление зависимостями в приложении
- Внедрение зависимостей в Системы
- Поддержка модульной архитектуры
- Создание иммутабельных сервисов

## Архитектура

### Основные компоненты
1. **ServiceContainer** - синглтон для управления зависимостями
2. **Provider** - описание способа создания зависимости
3. **Token** - уникальный идентификатор зависимости
4. **@Inject** - декоратор для внедрения зависимостей в Системы

### Уровни зависимостей
```
ServiceContainer
  ├── Глобальные зависимости
  │   └── Доступны везде по умолчанию
  └── Модульные зависимости
      └── Переопределяют глобальные в рамках модуля
```

## Использование

### Регистрация глобальных зависимостей
```typescript
// В EmpressCore или другой точке инициализации
ServiceContainer.instance.registerGlobal([
    // Класс как зависимость
    {
        provide: AbstractAudioService,
        useClass: DefaultAudioService
    },
    // Объект как зависимость
    {
        provide: GameConfig,
        useFactory: () => ({
            width: 800,
            height: 600
        })
    },
    // Иммутабельный объект
    {
        provide: GameState,
        useFactory: () => ({ score: 0 }),
        immutable: true
    }
]);
```

### Переопределение в модуле
```typescript
class GameModule extends SystemGroup {
    protected setupDependencies(): Provider[] {
        return [
            // Переопределяем глобальный сервис
            {
                provide: AbstractAudioService,
                useClass: CustomAudioService
            }
        ];
    }
}
```

### Использование в Системах
```typescript
class MovementSystem extends System {
    // Внедрение зависимости через декоратор
    @Inject(AbstractAudioService)
    private _audio!: AbstractAudioService;

    @Inject(GameState)
    private _state!: GameState; // Иммутабельный объект

    public execute() {
        // Используем сервисы
        this._audio.playSound('move');
        
        // Попытка изменить иммутабельный объект вызовет предупреждение
        this._state.score = 100; // Warning: Direct state mutation is not allowed
    }
}
```

## API

### ServiceContainer

#### Методы
- `registerGlobal(providers: Provider[])` - регистрация глобальных зависимостей
- `registerModule(moduleId: string, providers: Provider[])` - регистрация зависимостей модуля
- `get<T>(token: Token<T>, moduleId?: string)` - получение зависимости
- `memorizeSystem(system, token, key)` - запоминание зависимости для Системы
- `getDependencyForSystem(moduleId, system)` - внедрение зависимостей в Систему

### Provider
```typescript
interface Provider<T = any> {
    provide: Token<T>;           // Токен зависимости
    useClass?: new () => T;      // Класс для создания
    useFactory?: () => T;        // Фабричная функция
    immutable?: boolean;         // Флаг иммутабельности
}
```

## FAQ

### Как работает поиск зависимостей?
1. Сначала ищется в зависимостях текущего модуля
2. Если не найдено, ищется в глобальных зависимостях
3. Если нигде не найдено, выбрасывается ошибка

### Как работает иммутабельность?
Если провайдер помечен как `immutable: true`:
1. Создается Proxy вокруг объекта
2. Попытки изменения свойств блокируются
3. Выводится предупреждение в консоль

### Когда создаются инстансы зависимостей?
1. При первом запросе через `get`
2. Созданный инстанс кэшируется
3. Последующие запросы возвращают кэшированный инстанс

### Как переопределять зависимости?
1. Глобальные зависимости регистрируются через `registerGlobal`
2. Модульные зависимости через `registerModule` или `setupDependencies`
3. Модульные имеют приоритет над глобальными

### Как использовать декоратор @Inject?
1. Пометить свойство Системы декоратором
2. Указать токен зависимости
3. Зависимость будет внедрена автоматически при создании Системы
