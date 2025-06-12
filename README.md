# Empress Core

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

![Empress Logo](https://empressengine.github.io/empress-documentation/assets/images/empress_logo_big-469677dee942cbc8bbc7f8fa54689abd.png)

Empress Core - это легковесный и гибкий игровой фреймворк на TypeScript, построенный на принципах ECS (Entity-Component-System) архитектуры. Является частью экосистемы Empress Engine. Фреймворк предоставляет мощный набор инструментов для создания масштабируемых игровых приложений с чистой и поддерживаемой кодовой базой.

## Содержание

- [Особенности](#особенности)
- [Установка](#установка)
- [Документация](#документация)
- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
  - [Основные Концепции](#основные-концепции)
  - [Почему ECS?](#почему-ecs)
  - [Недостатки ECS](#недостатки-ecs)
  - [Основные компоненты](#основные-компоненты)
  - [Дополнительные модули](#дополнительные-модули)
  - [Утилитарные модули](#утилитарные-модули)
- [API Фреймворка](#api-фреймворка)
  - [EmpressCore](#empresscore)
  - [Component](#component)
  - [Entity](#entity)
  - [System](#system)
  - [SystemGroup](#systemgroup)
  - [SignalController](#signalcontroller)
  - [ServiceContainer](#servicecontainer)
- [Расширенные примеры](#расширенные-примеры)
  - [Создание игрового мира](#создание-игрового-мира)
- [Лицензия](#лицензия)

## Особенности

- **Строгая типизация**: Полная поддержка TypeScript для безопасной разработки
- **ECS архитектура**: 
  - Чистое разделение данных и логики
  - Эффективная система компонентов
  - Гибкая фильтрация сущностей
  - Асинхронные системы
- **Производительность**:
  - Оптимизированная работа с коллекциями
  - Эффективное управление памятью
  - Кэширование систем
- **Расширяемость**:
  - Встроенная система внедрения зависимостей (DI)
  - Поддержка сигналов (Signal System)
  - Группировка систем для контроля порядка выполнения
- **Удобство разработки**:
  - Подробная документация
  - Строгие контракты через интерфейсы
  - Поддержка горячей замены компонентов
- **Управление потоками выполнения**:
  - Гибкая система очередей выполнения
  - Контроль параллельного выполнения систем
  - Поддержка асинхронных систем
  - Возможность паузы и возобновления выполнения
  - Приоритизация и группировка систем
- **Управление игровым циклом**:
  - Встроенный LifeCycle для управления игровым циклом
  - Система сигналов для старта и обновления (OnStartSignal, OnUpdateSignal)
  - Контроль скорости выполнения через speedMultiplier
  - FPS-зависимый TimerController для точного тайминга
  - Поддержка requestAnimationFrame с deltaTime
  - Безопасная работа в фоновом режиме

## Установка

### NPM

```bash
npm install empress-core
```

### Использование в TypeScript

```typescript
import { Entity, Component, System } from 'empress-core';
```

### Зависимости

- TypeScript 5.6+

### Настройка проекта

Добавьте необходимые настройки TypeScript в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": false,
  }
}
```

## Документация

Вся техническая документация доступна по ссылке [Empress Engine](https://empressengine.github.io/empress-documentation/intro).

## Быстрый старт

Создадим простую игру с движущимися объектами:

### 1. Определение компонентов

```typescript
// components.ts
export class Position {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}

export class Velocity {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}
}
```

### 2. Создание системы

```typescript
// movement.system.ts
import { System } from 'empress-core';
import { Position, Velocity } from './components';

export class MovementSystem extends System {
  public execute(deltaTime: number): void {
    // Получаем все сущности с Position и Velocity
    const entities = this.filter({
      includes: [Position, Velocity]
    });

    // Обновляем позицию каждой сущности
    entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const velocity = entity.getComponent(Velocity);

      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
    });
  }
}
```

### 3. Создание группы систем

```typescript
// game.group.ts
import { SystemGroup } from 'empress-core';
import { MovementSystem } from './movement.system';

export class GameGroup extends SystemGroup {
  public setup(): void {
    this.add(MovementSystem);
  }
}
```

### 4. Запуск игры

```typescript
// main.ts
import { Entity, ExecutionController, LifeCycle, EmpressCore } from 'empress-core';
import { Position, Velocity } from './components';
import { GameGroup } from './game.group';

// Создаем сущность
const player = new Entity('player');
player.addComponent(new Position(100, 100));
player.addComponent(new Velocity(50, 0)); // Движение вправо

const empress = new EmpressCore(); // Создание инстанса
empress.init(); // Инициализация

const entityStorage = ServiceContainer.instance.get(EntityStorage);
entityStorage.addEntity(player);

// При каждом обновлении запускаем группу систем
empress.listen([
    {
        signal: OnUpdateSignal,
        groups: [GameGroup]
    }
]);

// Запускаем игру
empress.start();
```

Этот пример демонстрирует:

1. Создание компонентов для хранения данных
2. Реализацию системы для обработки логики
3. Группировку систем для организации
4. Интеграцию с игровым циклом

## Архитектура

Empress построен на принципах Entity Component System (ECS), обеспечивая четкое разделение данных и логики.

### Основные Концепции

Entity-Component-System (ECS) — это архитектурный паттерн, разделяющий логику игры или приложения на три отдельных понятия:

- **Entity (Сущность)**: уникальный идентификатор без собственных данных, представляет объект в мире (игровой объект, элемент UI и т. д.). В Empress представлен классом Entity с помощью которого можно управлять Компонентами внутри.

- **Component (Компонент)**: структура данных, описывающая конкретные характеристики или состояние сущности (позиция, скорость, здоровье и т. д.). В Empress представлен типом Component, который может являются любым объектом.

- **System (Система)**: набор функций или методов, выполняющих логику над сущностями, которые имеют определённый набор компонентов. В Empress представлен классом System, который может быть асинхронным и иметь возможность быть приостановленным.

### Почему ECS?

- **Модульность и повторное использование**: компоненты и системы легко переиспользовать между разными сущностями и проектами.

- **Быстрое прототипирование**: добавление нового компонента или системы не требует изменений в остальных частях кода.

- **Упрощённое тестирование**: изолированная логика систем и компонентов позволяет писать юнит-тесты без зависимости от остального окружения.

### Недостатки ECS

- **Сложность архитектуры**: для небольших проектов ECS может оказаться избыточным и усложнить простой код.

- **Крутая кривая обучения**: программистам, не привыкшим к Data-Oriented Design, требуется время для адаптации.

- **Небольшие накладные расходы**: управление списками компонентов и сущностей добавляет дополнительный слой абстракции.

- **Отсутствие явной иерархии**: в традиционном ООП-стиле легко проследить наследование, тогда как в ECS логику нужно искать в системах.

### Основные компоненты

#### Entity (Сущность)
- Контейнер для компонентов, которые определяют тип игрового объекта
- Предоставляет методы для управления компонентами: от создания до кеширования

#### Component (Компонент)
- Хранит данные сущности
- Не содержит логики
- Компонентом может выступать любой объект

#### System (Система)
- Реализует игровую логику
- Обрабатывает сущности с определенными компонентами
- Поддерживает асинхронное выполнение

### Дополнительные модули

#### EntityStorage
- Хранилище всех сущностей
- Реализует быстрый поиск по компонентам

#### SystemGroup
- Объединяет системы в единую очередь вызовов
- Управляет порядком выполнения

#### ServiceContainer
- Встроенный DI-контейнер
- Управление зависимостями

#### SignalController
- Управление сигналами
- Связывание Сигналов с Группами Систем

#### Lifecycle
- Управление жизненным циклом
- Возможность ускорять и замедлять игру

#### ExecutionController
- Управление выполнением систем
- Возможность приостанавливать и возобновлять выполнение

### Утилитарные модули

#### TimerController
- Управление таймерами
- Все таймеры зависимы от FPS

#### DeferredPromise
- Promise, который может быть отложенным
- Возможность отмены

#### Signal
- Сигналы для связи между компонентами
- Поддержка подписки на сигналы

#### Utils
- Утилиты для работы с компонентами
- Поддержка подписки на сигналы

## API Фреймворка

### EmpressCore

Основной класс приложения:

```typescript
const empress = new EmpressCore();

// Инициализация
empress.init();

// Подписка на сигналы
empress.listen([
  {
    signal: OnUpdateSignal,
    groups: [GameGroup]
  }
]);

// Запуск приложения
empress.start();
```

### Component

```typescript
class Position {
    constructor(public x: number, public y: number) {}
}
```

### Entity

Работа с сущностями:

```typescript
// Создание
const entity = new Entity('player');

// Добавление компонента
entity.addComponent(new Position(0, 0));

// Получение компонента
const position = entity.getComponent(Position);

// Проверка наличия компонента
const hasPosition = entity.hasComponent(Position);

// Удаление компонента
entity.removeComponent(Position);
```

### System

Создание системы:

```typescript
class MovementSystem extends System {
  // Фильтрация сущностей
  public filter = {
    includes: [Position, Velocity],
    excludes: [Frozen]
  };

  // Основная логика
  public execute(deltaTime: number): void {
    const entities = this.filter({
      includes: [Position, Velocity]
    });

    entities.forEach(entity => {
      // Обработка сущности
    });
  }

  // Хуки жизненного цикла
  public onInit(): void {}
  public onDestroy(): void {}
}
```

### SystemGroup

Группировка систем:

```typescript
class GameGroup extends SystemGroup {
  public setup(): void {
    // Добавление систем
    this.add(MovementSystem);
    this.add(CollisionSystem);

    // Добавление вложенной группы
    this.addGroup(PhysicsGroup);
  }
}
```

### SignalController

Работа с сигналами:

```typescript
// Создание сигнала
const GameStartSignal = new Signal();

// Подписка на сигнал
empress.listen([
  {
    signal: GameStartSignal,
    groups: [InitGroup, GameGroup]
  }
]);

// Отправка сигнала
GameStartSignal.dispatch();
```

### ServiceContainer

Управление зависимостями:

```typescript
// Регистрация сервиса
const empress = new EmpressApp();
empress.init();
empress.registerGlobalServices([
    { provide: GameService, useClass: GameService },
]);

// Внедрение в систему
class GameSystem extends System {
  @inject(GameService)
  private gameService!: GameService;
}
```

## Расширенные примеры

### Создание игрового мира

```typescript
// Компоненты
class TransformComponent {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public rotation: number = 0
  ) {}
}

class RigidBodyComponent {
  constructor(
    public velocity: { x: number; y: number } = { x: 0, y: 0 },
    public mass: number = 1
  ) {}
}

class SpriteComponent {
  constructor(public texture: string) {}
}

// Системы
class PhysicsSystem extends System<{deltaTime: number}> {
  public filter = {
    includes: [TransformComponent, RigidBodyComponent]
  };

  public execute({deltaTime}: {deltaTime: number}): void {
    const entities = this.filter();

    entities.forEach(entity => {
      const transform = entity.getComponent(TransformComponent);
      const body = entity.getComponent(RigidBodyComponent);

      transform.x += body.velocity.x * deltaTime;
      transform.y += body.velocity.y * deltaTime;
    });
  }
}

class RenderSystem extends System {
  public filter = {
    includes: [TransformComponent, SpriteComponent]
  };

  public execute(): void {
    const entities = this.filter();

    entities.forEach(entity => {
      const transform = entity.getComponent(TransformComponent);
      const sprite = entity.getComponent(SpriteComponent);
      // Отрисовка спрайта в позиции transform
    });
  }
}

// Группы систем
class PhysicsGroup extends SystemGroup<{deltaTime: number}> {
  public setup(data: {deltaTime: number}): void {
    return [
      // Передача внешних данных внутрь Системы
      { this.provide(PhysicsSystem, data) }
    ];
  }
}

class RenderGroup extends SystemGroup {
  public setup(): void {
    return [
      { this.provide(RenderSystem, null) }
    ];
  }
}

// Создание игры
const empress = new EmpressApp();
empress.init();

// Создание игрока
const player = new Entity('player');
player.addComponent(new Transform(100, 100));
player.addComponent(new RigidBody({ x: 0, y: 0 }, 1));
player.addComponent(new Sprite('player.png'));

// Добавление в мир
const entityStorage = ServiceContainer.instance.get(EntityStorage);
entityStorage.addEntity(player);

// Настройка сигналов
empress.listen([
  {
    signal: OnUpdateSignal,
    groups: [PhysicsGroup, RenderGroup]
  }
]);

// Запуск
empress.start();
```

## Лицензия

EmpressApp распространяется под лицензией MIT.

```text
MIT License

Copyright (c) 2025 EmpressApp Game Framework

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
