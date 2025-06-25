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
  ├── SystemChain (цепочка систем)
  └── ServiceContainer (внедрение зависимостей)
```

## Использование

### Создание группы
```typescript
class MovementGroup extends SystemGroup<Vec2> {
    public setup(chain: SystemChain, data: Vec2): void {
        chain
            // Простая регистрация
            .add(MovementSystem)
            
            // С передачей данных
            .add(VelocitySystem, data)
            
            // С дополнительным фильтром
            .add(CollisionSystem, null, { includes: [ColliderComponent], excludes: [DisabledComponent] })
            
            // С повторным выполнением
            .add(PhysicsSystem, null, { repeat: 3 })
            
            // С условным выполнением
            .add(AnimationSystem, null, { canExecute: (data) => data.x !== 0 || data.y !== 0 })
        };
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

## API

### Класс SystemGroup<T>

#### Методы
- `setup(chain: SystemChain, data: T): void` - определяет порядок и настройки выполнения Систем
- `setupDependencies(): Provider[]` - определяет зависимости для Систем в группе

### Интерфейс IGroupOption
```typescript
interface IGroupOption {
    id: string;                     // Уникальный идентификатор системы
    instance: ISystemProvider;      // Провайдер системы
    includes?: ComponentType[];     // Дополнительные компоненты для фильтрации
    excludes?: ComponentType[];     // Исключаемые компоненты
    repeat?: number;                // Количество повторений
    withDisabled?: boolean;         // Включать ли неактивные сущности
    canExecute?: (data: any) => boolean; // Условие выполнения
}
```

## FAQ

### Как определяется порядок выполнения Систем?
1. По порядку объявления в методе `setup`.

### Как работают повторения Систем?
Система будет выполнена указанное в `repeat` количество раз перед переходом к следующей системе.

### Как переопределяются зависимости?
1. Зависимости определяются в методе `setupDependencies`
2. Они регистрируются в ServiceContainer с уникальным ID группы
3. При запросе зависимости через @Inject, сначала ищутся зависимости группы, затем глобальные

### Можно ли изменить порядок выполнения динамически?
Да, метод `setup` вызывается при каждом срабатывании Signal, поэтому порядок может меняться на основе входных данных.
