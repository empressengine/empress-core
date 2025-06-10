# Модуль SystemGroup

## Описание
Модуль `SystemGroup` предоставляет механизм для группировки и управления порядком выполнения Систем в ECS фреймворке. Группы систем связаны с Signal и получают данные для передачи в Системы.

## Назначение
- Управление порядком выполнения Систем
- Передача данных от Signal в Системы
- Переопределение зависимостей для Систем
- Расширение фильтрации Систем
- Условное и повторное выполнение Систем

## Архитектура

### Основные классы
1. **SystemGroup** - абстрактный класс для создания групп
2. **IGroupOption** - интерфейс настроек для Системы
3. **ISystemProvider** - провайдер для создания Системы

### Диаграмма зависимостей
```
SystemGroup
  ├── Signal (источник данных)
  ├── System (исполняемые системы)
  └── ServiceContainer (внедрение зависимостей)
```

## Использование

### Создание группы
```typescript
class MovementGroup extends SystemGroup<Vec2> {
    public setup(data: Vec2): IGroupOption[] {
        return [
            // Простая регистрация
            {
                instance: this.provide(MovementSystem)
            },
            
            // С передачей данных
            {
                instance: this.provide(VelocitySystem, data)
            },
            
            // С дополнительным фильтром
            {
                instance: this.provide(CollisionSystem),
                includes: [ColliderComponent],
                excludes: [DisabledComponent]
            },
            
            // С повторным выполнением
            {
                instance: this.provide(PhysicsSystem),
                repeat: 3
            },
            
            // С условным выполнением
            {
                instance: this.provide(AnimationSystem),
                canExecute: (data) => data.x !== 0 || data.y !== 0
            }
        ];
    }

    // Переопределение зависимостей
    protected setupDependencies(): Provider[] {
        return [
            {
                provide: AbstractPhysicsService,
                useClass: CustomPhysicsService
            }
        ];
    }
}
```

### Порядок выполнения
```typescript
// Явное указание порядка через свойство order
{
    instance: this.provide(FirstSystem),
    order: 100
},
{
    instance: this.provide(SecondSystem),
    order: 200
}

// Если order не указан, системы выполняются в порядке объявления
// с шагом 10000 между ними
```

## API

### Класс SystemGroup<T>

#### Методы
- `setup(data: T): IGroupOption[]` - определяет порядок и настройки выполнения Систем
- `provide(system: SystemType, data?: any): ISystemProvider` - создает провайдер для Системы
- `setupDependencies(): Provider[]` - определяет зависимости для Систем в группе

### Интерфейс IGroupOption
```typescript
interface IGroupOption {
    instance: ISystemProvider;      // Провайдер системы
    includes?: ComponentType[];     // Дополнительные компоненты для фильтрации
    excludes?: ComponentType[];     // Исключаемые компоненты
    order?: number;                 // Порядок выполнения
    repeat?: number;                // Количество повторений
    withDisabled?: boolean;         // Включать ли неактивные сущности
    canExecute?: (data: any) => boolean; // Условие выполнения
}
```

## FAQ

### Как определяется порядок выполнения Систем?
1. По свойству `order`, если оно указано
2. По порядку объявления в методе `setup`, с шагом 10000 между системами

### Как работают повторения Систем?
Система будет выполнена указанное в `repeat` количество раз перед переходом к следующей системе.

### Как переопределяются зависимости?
1. Зависимости определяются в методе `setupDependencies`
2. Они регистрируются в ServiceContainer с уникальным ID группы
3. При запросе зависимости через @Inject, сначала ищутся зависимости группы, затем глобальные

### Можно ли изменить порядок выполнения динамически?
Да, метод `setup` вызывается при каждом срабатывании Signal, поэтому порядок может меняться на основе входных данных.
