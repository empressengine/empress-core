/**
 * Тип для функции обратного вызова, принимающей любые аргументы
 */
declare type Callback = (...args: any[]) => void;

export declare interface ClassProvider<T = any> {
    provide: Token<T>;
    useClass: Constructor<T> | T;
    immutable?: boolean;
}

/**
 * @description
 * Component (Компонент) - это простой JavaScript объект, который не требует реализации интерфейсов
 * или наследования базовых классов.
 *
 * Компоненты используются как контейнеры данных для игровых сущностей (Entity). Они содержат всю информацию
 * о конкретном аспекте состояния и поведения сущности. Например, можно определить такие компоненты как Position
 * (позиция), Velocity (скорость), Health (здоровье), Inventory (инвентарь) и т.д., каждый со своим набором
 * свойств, специфичных для этих аспектов.
 *
 * Компоненты должны содержать только данные, без какой-либо функциональности.
 *
 * В EmpressCore компоненты обычно создаются с использованием классов. Это позволяет легко расширять и настраивать их,
 * добавляя дополнительные свойства.
 *
 * @example
 * ```ts
 * // Определяем компонент "Position" с координатами x,y:
 * export class Position {
 *   public x!: number;
 *   public y!: number;
 *
 *   constructor(x: number, y: number) {
 *     this.x = x;
 *     this.y = y;
 *   }
 * }
 *
 * // Создаем сущность с компонентом позиции:
 * const playerEntity = new Entity();
 * playerEntity.addComponent(new Position(10, 20));
 *
 * // Получаем компонент позиции из сущности:
 * const positionComponent = playerEntity.getComponent(Position);
 * console.log(positionComponent.x); // Вывод: 10
 *
 * // Обновляем значения компонента позиции:
 * positionComponent.x += 5;
 * positionComponent.y -= 3;
 *
 * ```
 */
export declare type Component = object & {
    length?: never;
    constructor: any;
};

/**
 * @description
 * Интерфейс для фильтрации сущностей по их компонентам.
 * Используется для отбора сущностей, которые должны обрабатываться системами.
 *
 * @example
 * ```ts
 * // Фильтр для поиска движущихся объектов, которые не заморожены
 * const filter: ComponentFilter = {
 *   includes: [PositionComponent, MovementComponent],  // Должны быть оба компонента
 *   excludes: [FrozenComponent]  // Не должно быть компонента заморозки
 * };
 * ```
 */
export declare interface ComponentFilter {
    /**
     * @description
     * Массив типов компонентов, которые должны присутствовать в сущности.
     * Сущность должна иметь ВСЕ перечисленные компоненты.
     */
    includes: ComponentType<any>[];
    /**
     * @description
     * Массив типов компонентов, которые НЕ должны присутствовать в сущности.
     * Сущность не должна иметь НИ ОДИН из перечисленных компонентов.
     */
    excludes?: ComponentType<any>[];
}

/**
 * @description
 * Утилитарный класс, который отслеживает, как часто каждый компонент используется в игре.
 * Необходим для сортировщика компонентов, чтобы иметь возможность сортировать компоненты на основе их редкости.
 *
 * @example
 * ```ts
 * // Создаем несколько сущностей с разными компонентами
 * const entity1 = new Entity();
 * const entity2 = new Entity();
 * const entity3 = new Entity();
 *
 * // Добавляем компоненты (автоматически увеличивает частоту через Entity.addComponent)
 * entity1.addComponent(new Position());
 * entity1.addComponent(new Health());
 *
 * entity2.addComponent(new Position());
 * entity2.addComponent(new Velocity());
 *
 * entity3.addComponent(new Position());
 *
 * // Теперь Position используется 3 раза, Health и Velocity по 1 разу
 * console.log(ComponentsRaritySorter.rarity(Position)); // Вывод: 3
 * console.log(ComponentsRaritySorter.rarity(Health));  // Вывод: 1
 *
 * // Сортируем компоненты по редкости (от самых редких к частым)
 * const components = [Position, Health, Velocity];
 * const sorted = ComponentsRaritySorter.sortByRarity(components);
 * // sorted: [Health, Velocity, Position]
 * ```
 */
export declare class ComponentsRaritySorter {
    private static _componentFrequency;
    /**
     * @description
     * Увеличивает частоту использования указанного типа компонента.
     *
     * @param component Компонент, для которого увеличивается частота использования.
     */
    static increment(component: ComponentType<any>): void;
    /**
     * @description
     * Уменьшает частоту использования указанного типа компонента. Если частота
     * достигает нуля, компонент удаляется из карты.
     *
     * @param component Компонент, для которого уменьшается частота использования.
     */
    static decrement(component: ComponentType<any>): void;
    /**
     * @description
     * Получает редкость указанного типа компонента.
     *
     * @param component Компонент, для которого запрашивается редкость.
     */
    static rarity(component: ComponentType<any>): number;
    /**
     * @description
     * Сортирует массив типов компонентов по их редкости.
     *
     * @param components Массив типов компонентов для сортировки.
     * @returns Отсортированный массив типов компонентов.
     */
    static sortByRarity(components: ComponentType<any>[]): ComponentType<any>[];
}

/**
 * @description
 * ComponentType - это функция-конструктор, которая создает экземпляры определенного типа компонента.
 *
 * @template T Тип создаваемого компонента.
 *
 * @param args Аргументы, необходимые для создания экземпляра компонента.
 *
 * @returns Экземпляр указанного типа компонента.
 *
 */
export declare type ComponentType<T extends Component> = new (...args: any[]) => T;

export declare type Constructor<T = any> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);

/**
 * @description
 * Утилита для создания Promise, которым можно управлять вне его тела.
 * Позволяет разделить создание Promise и его разрешение/отклонение.
 *
 * @example Пример использования
 * ```typescript
 * const deferred = new DeferredPromise<string>();
 *
 * // Подписываемся на разрешение Promise
 * deferred.promise.then(result => console.log(result));
 *
 * // Где-то в другом месте разрешаем Promise
 * deferred.resolve('Готово!');
 * ```
 *
 * @example Работа с массивом Promise
 * ```typescript
 * const deferreds = [
 *   new DeferredPromise<number>(),
 *   new DeferredPromise<number>()
 * ];
 *
 * // Разрешаем все Promise одним значением
 * DeferredPromise.resolveAll(deferreds, 42);
 *
 * // Или ждём завершения всех
 * const results = await DeferredPromise.all(deferreds);
 * ```
 */
export declare class DeferredPromise<T> {
    /**
     * @description
     * Promise, которым мы управляем.
     */
    promise: Promise<T>;
    /**
     * @description
     * Функция для разрешения Promise с указанным значением.
     */
    resolve: (value: T | PromiseLike<T>) => void;
    /**
     * @description
     * Функция для отклонения Promise с указанной причиной.
     */
    reject: (reason?: any) => void;
    constructor();
    /**
     * @description
     * Разрешает все Promise в массиве одним и тем же значением.
     * @param deferred Массив DeferredPromise для разрешения
     * @param data Значение, которым будут разрешены все Promise
     */
    static resolveAll<K>(deferred: DeferredPromise<any>[], data: K): void;
    /**
     * @description
     * Отклоняет все Promise в массиве с одной и той же причиной.
     * @param deferred Массив DeferredPromise для отклонения
     * @param reason Причина отклонения
     */
    static rejectAll(deferred: DeferredPromise<any>[], reason?: any): void;
    /**
     * @description
     * Возвращает Promise, который разрешится, когда все Promise в массиве будут разрешены.
     * @param deferred Массив DeferredPromise для ожидания
     * @returns Promise с массивом результатов
     */
    static all(deferred: DeferredPromise<any>[]): Promise<any[]>;
    /**
     * @description
     * Возвращает Promise, который разрешится, когда все Promise в массиве будут завершены (разрешены или отклонены).
     * @param deferred Массив DeferredPromise для ожидания
     * @returns Promise с массивом результатов
     */
    static allSettled(deferred: DeferredPromise<any>[]): Promise<any[]>;
    /**
     * @description
     * Возвращает Promise, который разрешится, когда любой из Promise в массиве будет разрешён.
     * @param deferred Массив DeferredPromise для гонки
     * @returns Promise с результатом первого разрешённого Promise
     */
    static race(deferred: DeferredPromise<any>[]): Promise<any>;
}

declare type Disposable_2 = {
    dispose: () => void;
};
export { Disposable_2 as Disposable }

/**
 * @description
 * Точка входа в приложение. Отвечает за инициализацию и настройку всех модулей.
 * Предоставляет методы для управления жизненным циклом приложения.
 *
 * @example Инициализация приложения
 * ```typescript
 * const empress = new EmpressCore();
 *
 * // Инициализация модулей
 * empress.init();
 *
 * // Подписка на сигналы
 * // Конфигурация сигналов
 * const baseSignals = [
 *   {
 *     signal: OnUpdateSignal,
 *     groups: [UpdateGroup]
 *   }
 * ];
 *
 * // Регистрация сигналов
 * empress.listenSignals(baseSignals);
 *
 * // Подписка на сигналы
 * empress.subscribe();
 *
 * // Запуск приложения
 * empress.start();
 * ```
 */
export declare class EmpressCore {
    /**
     * @description
     * Инициализирует все модули приложения.
     * Создает и регистрирует все необходимые сервисы.
     */
    init(): void;
    /**
     * @description
     * Запускает приложение, инициируя жизненный цикл.
     */
    start(): void;
    /**
     * @description
     * Устанавливает связи между сигналами и группами систем.
     * @param configs Конфигурации связей между сигналами и группами
     */
    listenSignals(configs: ISignalConfig[]): void;
    /**
     * @description
     * Более тонкая настрйока связей между Signal и Группами Систем.
     * ПОзволяет переопределять существующие связи.
     *
     * @param signal Signal для настройки
     * @param configuratorFn Функция настройки связей Signal-Группа
     */
    configureSignal(signal: ISignal<any>, configuratorFn: (configurator: SignalChain) => void): void;
    /**
     * @description
     * Активирует подписки на все настроенные Signal.
     * При срабатывании Signal запускает связанные Группы в ExecutionController.
     */
    subscribe(): void;
    /**
     * @description
     * Регистрирует глобальные сервисы в контейнере зависимостей.
     * @param providers Массив провайдеров сервисов
     */
    registerGlobalServices(providers: Provider[]): void;
    /**
     * @description
     * Создает и регистрирует основные сервисы приложения:
     * - EntityStorage для хранения сущностей
     * - SystemsContainer для кэширования систем
     * - LifeCycle для управления жизненным циклом
     * - TimerController для управления таймерами
     * - ExecutionController для управления выполнением систем
     * - SignalsController для управления сигналами
     */
    protected registerServices(): void;
}

/**
 * @description
 * Базовый класс сущности в ECS архитектуре.
 * Реализует интерфейс IEntity.
 * Содержит коллекцию компонентов и предоставляет методы для управления ими.
 * Каждая сущность имеет уникальный идентификатор, имя и может быть активной или неактивной.
 *
 * @example
 * ```ts
 * // Создаем сущность с двумя компонентами
 * const entity = new Entity('my-entity');
 * entity.addComponent(new PositionComponent());
 * entity.addComponent(new VelocityComponent());
 *
 * // Получаем компонент позиции
 * const position = entity.getComponent(PositionComponent);
 *
 * // Удаляем компонент скорости
 * entity.removeComponent(VelocityComponent);
 *
 * // Отключаем все компоненты сущности
 * entity.disableAllComponents();
 */
export declare class Entity implements IEntity {
    private readonly _uuid;
    private _name;
    /**
     * @description
     * Уникальный идентификатор сущности.
     * Используется для однозначной идентификации сущности в игре.
     */
    get uuid(): string;
    /**
     * @description
     * Имя сущности.
     * Используется для удобной идентификации сущности человеком.
     */
    get name(): string;
    set name(value: string);
    /**
     * @description
     * Флаг активности сущности.
     * Определяет, должна ли сущность обрабатываться игровыми системами.
     */
    get active(): boolean;
    set active(value: boolean);
    /**
     * @description
     * Список всех активных компонентов, прикрепленных к сущности.
     * Включает только компоненты, которые в данный момент включены.
     */
    get components(): Component[];
    /**
     * @description
     * Список всех отключенных компонентов сущности.
     * Включает компоненты, которые временно деактивированы.
     */
    get disabledComponents(): Component[];
    private _active;
    private readonly _components;
    private readonly _disabledComponents;
    constructor(_uuid: string, _name?: string);
    /**
     * @description
     * Добавляет компонент к сущности.
     * Компонент может быть добавлен либо как активный, либо как отключенный.
     * Один тип компонента может быть добавлен к сущности только один раз.
     *
     * @param component Экземпляр компонента для добавления.
     * @param enabled Должен ли компонент быть изначально включен или отключен. По умолчанию true.
     * @throws {Error} Если компонент данного типа уже существует в сущности.
     */
    addComponent(component: Component, enabled?: boolean): void;
    /**
     * @description Получает компонент по его конструктору.
     * @param ctor Конструктор компонента.
     * @returns Экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    getComponent<T extends Component>(ctor: ComponentType<T>): T;
    /**
     * @description Проверяет, имеет ли сущность все указанные компоненты.
     * @param types Массив конструкторов компонентов для проверки.
     * @returns true, если сущность имеет все указанные компоненты, иначе false.
     */
    hasComponents(types: ComponentType<any>[]): boolean;
    /**
     * @description Удаляет компонент из сущности.
     * Может удалить как активный, так и отключенный компонент.
     * @param ctor Конструктор компонента для удаления.
     * @returns Удаленный экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    removeComponent(ctor: ComponentType<any>): Component;
    /**
     * @description
     * Включает ранее отключенный компонент.
     * Перемещает компонент из списка отключенных в список активных.
     *
     * @param ctor Конструктор компонента для включения.
     * @throws {Error} Если компонент не существует или уже включен.
     */
    enableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Отключает компонент.
     * Перемещает компонент из списка активных в список отключенных.
     *
     * @param ctor Конструктор компонента для отключения.
     * @throws {Error} Если компонент не существует или уже отключен.
     */
    disableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Отключает все компоненты сущности.
     * Перемещает все компоненты из активного списка в список отключенных.
     */
    disableAllComponents(): void;
    /**
     * @description
     * Включает все ранее отключенные компоненты.
     * Перемещает все компоненты из списка отключенных в список активных.
     */
    enableAllComponents(): void;
    /**
     * @description
     * Проверяет, соответствует ли сущность указанным критериям фильтрации.
     * Сущность должна иметь все компоненты из includes и не иметь ни одного из excludes.
     *
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @returns true, если сущность удовлетворяет фильтру, иначе false.
     */
    isSatisfiedFilter(filter: ComponentFilter): boolean;
    private extractConstructor;
}

/**
 * @description
 * Тип коллбэк-функции для итерации по сущностям.
 * Может быть как синхронной, так и асинхронной функцией.
 * Используется в методах forEach, sequential и parallel класса Filtered.
 *
 * @param entity Сущность, над которой выполняется операция.
 * @param index Опциональный индекс сущности в массиве. Предоставляется только в forEach и sequential.
 * @returns void для синхронных операций или Promise<void> для асинхронных.
 *
 * @example
 * ```typescript
 * // Синхронная коллбэк-функция
 * const syncCallback: EntityIterationCallback = (entity, index) => {
 *   console.log(`Сущность ${index}: ${entity.name}`);
 * };
 *
 * // Асинхронная коллбэк-функция
 * const asyncCallback: EntityIterationCallback = async (entity) => {
 *   await someAsyncOperation(entity);
 * };
 * ```
 */
declare type EntityIterationCallback = (entity: IEntity, index?: number) => void | Promise<void>;

/**
 * @description
 * Основное хранилище сущностей в ECS фреймворке.
 * Предоставляет методы для управления сущностями и их фильтрации.
 * Хранит все созданные сущности и обеспечивает уникальность их UUID.
 *
 * @example
 * ```typescript
 * const storage = new EntityStorage();
 *
 * // Добавляем сущность
 * storage.addEntity(entity);
 *
 * // Получаем сущность по UUID
 * const entity = storage.getEntity(uuid);
 *
 * // Фильтруем сущности по компонентам
 * const filtered = storage.filter({
 *   includes: [PositionComponent],
 *   excludes: [DisabledComponent]
 * });
 * ```
 */
export declare class EntityStorage implements IEntityStorage {
    private _entities;
    /**
     * @description
     * Добавляет новую сущность в хранилище.
     * Проверяет уникальность UUID сущности.
     *
     * @param entity Сущность для добавления в хранилище.
     * @throws {Error} Если сущность с таким UUID уже существует.
     */
    addEntity(entity: IEntity): void;
    /**
     * @description
     * Удаляет сущность из хранилища по её UUID.
     *
     * @param uuid UUID сущности для удаления.
     * @returns Удаленная сущность или undefined, если сущность не найдена.
     */
    removeEntity(uuid: string): IEntity | undefined;
    /**
     * @description
     * Получает сущность из хранилища по её UUID.
     *
     * @param uuid UUID искомой сущности.
     * @returns Найденная сущность или undefined, если сущность не найдена.
     */
    getEntity(uuid: string): IEntity | undefined;
    /**
     * @description
     * Возвращает массив всех сущностей в хранилище.
     *
     * @returns Массив всех сущностей.
     */
    getAllEntities(): IEntity[];
    /**
     * @description
     * Возвращает массив всех активных сущностей (entity.active === true).
     *
     * @returns Массив активных сущностей.
     */
    getActiveEntities(): IEntity[];
    /**
     * @description
     * Возвращает массив всех неактивных сущностей (entity.active === false).
     *
     * @returns Массив неактивных сущностей.
     */
    getInactiveEntities(): IEntity[];
    /**
     * @description
     * Фильтрует сущности по заданным критериям компонентов.
     * Использует ComponentsRaritySorter для оптимизации порядка проверки компонентов.
     *
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @param withDisabled Если true, фильтрует все сущности, включая неактивные. По умолчанию false.
     * @returns Объект Filtered с отфильтрованными сущностями.
     */
    filter(filter: ComponentFilter, withDisabled?: boolean): Filtered;
}

/**
 * @description
 * Контроллер для управления несколькими очередями выполнения.
 * Предоставляет централизованное управление выполнением групп систем с возможностью
 * управления отдельными очередями или массовыми операциями.
 *
 * @example Простое использование
 * ```typescript
 * const controller = new ExecutionController(systemsContainer, entityStorage);
 *
 * // Создание очередей для разных подсистем
 * const animationQueueId = controller.create([AnimationGroup], gameState, 'animation');
 * const physicsQueueId = controller.create([PhysicsGroup], gameState, 'physics');
 *
 * // Запуск очередей
 * await controller.run(animationQueueId);
 * await controller.run(physicsQueueId);
 * ```
 *
 * @example Расширенное управление
 * ```typescript
 * // Создание нескольких очередей
 * const queues = [
 *   controller.create([AIGroup], gameState, 'ai'),
 *   controller.create([PhysicsGroup], gameState, 'physics'),
 *   controller.create([AnimationGroup], gameState, 'animation')
 * ];
 *
 * // Проверка статуса очередей
 * console.log('Активные очереди:', controller.activeQueues);
 * console.log('Всего очередей:', controller.queueSize);
 *
 * // Управление отдельными очередями
 * controller.pause(queues[1]); // пауза физики
 * if (controller.hasQueue(queues[1])) {
 *   const status = controller.getQueueStatus(queues[1]);
 *   console.log('Физика на паузе:', status?.isPaused);
 * }
 *
 * // Массовые операции
 * controller.pauseAll();
 * controller.resumeAll();
 * controller.stopAll();
 * ```
 */
export declare class ExecutionController {
    private _systemsContainer;
    private _groupsContainer;
    private _entityStorage;
    private _queues;
    /**
     * @description Получает массив ID активных очередей
     * @returns Массив ID очередей, которые в данный момент выполняются
     */
    get activeQueues(): string[];
    /**
     * @description Получает текущее количество активных очередей
     */
    get queueSize(): number;
    constructor(_systemsContainer: ISystemsContainer, _groupsContainer: GroupsContainer, _entityStorage: EntityStorage);
    /**
     * @description Creates and sets up a new execution queue.
     * The queue is created, configured with systems, but not started.
     * Use this when you need to prepare queues before execution or need fine-grained control.
     *
     * @example
     * ```typescript
     * // Create named queues for better debugging
     * const physicsQueueId = controller.create([PhysicsGroup], gameState, 'physics');
     * const renderQueueId = controller.create([RenderGroup], gameState, 'render');
     *
     * // Later start them in specific order
     * await controller.run(physicsQueueId);
     * await controller.run(renderQueueId);
     * ```
     *
     * @param groups Array of system group constructors to be executed by this queue
     * @param data Data to be passed to the systems
     * @param name Optional name for the queue, useful for debugging. Defaults to 'unnamed'
     * @returns ID of the created queue, can be used for further queue management
     */
    create<T>(groups: GroupType<T>[], data: T, name?: string): string;
    /**
     * @description Executes a previously created queue identified by its ID.
     * The queue must have been created using the create() method.
     * After execution completes, the queue is automatically removed.
     *
     * @example
     * ```typescript
     * // Create and run a queue
     * const queueId = controller.create([LoadingGroup], gameState, 'loader');
     * await controller.run(queueId);
     *
     * // Queue is automatically removed after completion
     * console.log(controller.hasQueue(queueId)); // false
     * ```
     *
     * @param queueId ID of the queue to execute, obtained from create()
     * @throws Error if queue with provided ID is not found
     * @returns Promise that resolves when all systems have finished executing
     */
    run(queueId: string, asyncAlowed?: boolean): Promise<void>;
    /**
     * @description Останавливает выполнение очереди и удаляет её.
     * Текущая Система будет принудительно остановлена.
     *
     * @param executionId ID очереди для остановки
     */
    stop(executionId: string): void;
    /**
     * @description Ставит очередь на паузу.
     * Выполнение приостановится после завершения текущей Системы.
     *
     * @param executionId ID очереди для паузы
     */
    pause(executionId: string): void;
    /**
     * @description Возобновляет выполнение приостановленной очереди.
     *
     * @param executionId ID очереди для возобновления
     */
    resume(executionId: string): void;
    /**
     * @description Останавливает и удаляет все очереди.
     * Все текущие Системы будут принудительно остановлены.
     */
    stopAll(): void;
    /**
     * @description Ставит все очереди на паузу.
     * Каждая очередь приостановится после завершения текущей Системы.
     */
    pauseAll(): void;
    /**
     * @description Возобновляет выполнение всех приостановленных очередей.
     */
    resumeAll(): void;
    /**
     * @description Проверяет наличие очереди с указанным ID
     * @param executionId ID очереди для проверки
     */
    hasQueue(executionId: string): boolean;
    /**
     * @description Получает статус конкретной очереди
     * @param executionId ID очереди для проверки
     * @returns Объект статуса очереди или null, если очередь не найдена
     */
    getQueueStatus(executionId: string): {
        isPaused: boolean;
    } | null;
}

export declare type Factory<T = any> = () => T;

export declare interface FactoryProvider<T = any> {
    provide: Token<T>;
    useFactory: Factory<T>;
    immutable?: boolean;
}

/**
 * @description
 * Класс для работы с отфильтрованными сущностями.
 * Хранит список сущностей, которые прошли фильтрацию по компонентам.
 * Предоставляет методы для синхронной и асинхронной итерации по списку.
 *
 * @example
 * ```typescript
 * // Создаем объект с отфильтрованными сущностями
 * const filteredEntities = new Filtered([entity1, entity2]);
 *
 * // Синхронный перебор сущностей
 * filteredEntities.forEach((entity) => {
 *   console.log(`UUID сущности: ${entity.uuid}`);
 * });
 *
 * // Асинхронный последовательный перебор
 * await filteredEntities.sequential(async (entity) => {
 *   console.log(`Имя сущности: ${entity.name}`);
 * });
 *
 * // Асинхронный параллельный перебор
 * await filteredEntities.parallel(async (entity) => {
 *   console.log(`Статус активности: ${entity.active}`);
 * });
 * ```
 */
export declare class Filtered {
    private _entities;
    /**
     * @description
     * Возвращает общее количество сущностей в коллекции.
     * @returns Количество сущностей.
     */
    get count(): number;
    /**
     * @description
     * Возвращает массив всех отфильтрованных сущностей.
     * @returns Массив сущностей.
     */
    get items(): IEntity[];
    constructor(_entities?: IEntity[]);
    /**
     * @description
     * Синхронно перебирает все сущности и вызывает для каждой коллбэк-функцию.
     * Передает в коллбэк сущность и её индекс в массиве.
     *
     * @param callback Коллбэк-функция, которая будет вызвана для каждой сущности.
     */
    forEach(callback: EntityIterationCallback): void;
    /**
     * @description
     * Асинхронно перебирает все сущности последовательно.
     * Каждая следующая сущность обрабатывается только после завершения обработки предыдущей.
     *
     * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
     * @returns Promise, который разрешится после завершения всех итераций.
     */
    sequential(callback: EntityIterationCallback): Promise<void>;
    /**
     * @description
     * Асинхронно перебирает все сущности параллельно.
     * Все сущности обрабатываются одновременно, не дожидаясь завершения обработки предыдущих.
     *
     * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
     * @returns Promise, который разрешится после завершения всех итераций.
     */
    parallel(callback: EntityIterationCallback): Promise<void>;
}

export declare type GroupData<T extends ISystemGroup> = T extends ISystemGroup<infer U> ? U : never;

export declare class GroupsContainer {
    private _cache;
    get(ctor: GroupType<any>): SystemGroup<any>;
    set(ctor: GroupType<any>, item: SystemGroup<any>): void;
    has(ctor: GroupType<any>): boolean;
    remove(ctor: GroupType<any>): void;
}

export declare type GroupType<T> = new (...args: any[]) => ISystemGroup<T>;

/**
 * @description
 * Интерфейс сущности в ECS архитектуре.
 * Определяет основной контракт для работы с игровыми объектами.
 * Содержит коллекцию компонентов и предоставляет методы для управления ими.
 *
 * @example
 * ```ts
 * // Создаем сущность с двумя компонентами
 * const entity = new Entity('my-entity');
 * entity.addComponent(new PositionComponent());
 * entity.addComponent(new VelocityComponent());
 *
 * // Получаем компонент позиции
 * const position = entity.getComponent(PositionComponent);
 *
 * // Удаляем компонент скорости
 * entity.removeComponent(VelocityComponent);
 *
 * // Отключаем все компоненты сущности
 * entity.disableAllComponents();
 */
export declare interface IEntity {
    /**
     * @description
     * Уникальный идентификатор сущности.
     * Используется для однозначной идентификации сущности в игре.
     */
    readonly uuid: string;
    /**
     * @description
     * Имя сущности.
     * Используется для удобной идентификации сущности человеком.
     */
    name: string;
    /**
     * @description
     * Флаг активности сущности.
     * Определяет, должна ли сущность обрабатываться игровыми системами.
     */
    active: boolean;
    /**
     * @description
     * Список всех активных компонентов, прикрепленных к сущности.
     * Включает только компоненты, которые в данный момент включены.
     */
    readonly components: Component[];
    /**
     * @description
     * Список всех отключенных компонентов сущности.
     * Включает компоненты, которые временно деактивированы.
     */
    readonly disabledComponents: Component[];
    /**
     * @description
     * Добавляет компонент к сущности.
     * Компонент может быть добавлен либо как активный, либо как отключенный.
     * Один тип компонента может быть добавлен к сущности только один раз.
     *
     * @param component Экземпляр компонента для добавления.
     * @param enabled Должен ли компонент быть изначально включен или отключен. По умолчанию true.
     * @throws {Error} Если компонент данного типа уже существует в сущности.
     */
    addComponent(component: Component, enabled?: boolean): void;
    /**
     * @description Получает компонент по его конструктору.
     * @param ctor Конструктор компонента.
     * @returns Экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    getComponent<T extends Component>(ctor: ComponentType<T>): T;
    /**
     * @description Проверяет, имеет ли сущность все указанные компоненты.
     * @param types Массив конструкторов компонентов для проверки.
     * @returns true, если сущность имеет все указанные компоненты, иначе false.
     */
    hasComponents(types: ComponentType<any>[]): boolean;
    /**
     * @description Удаляет компонент из сущности.
     * Может удалить как активный, так и отключенный компонент.
     * @param ctor Конструктор компонента для удаления.
     * @returns Удаленный экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    removeComponent(ctor: ComponentType<any>): Component;
    /**
     * @description
     * Включает ранее отключенный компонент.
     * Перемещает компонент из списка отключенных в список активных.
     *
     * @param ctor Конструктор компонента для включения.
     * @throws {Error} Если компонент не существует или уже включен.
     */
    enableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Отключает компонент.
     * Перемещает компонент из списка активных в список отключенных.
     *
     * @param ctor Конструктор компонента для отключения.
     * @throws {Error} Если компонент не существует или уже отключен.
     */
    disableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Отключает все компоненты сущности.
     * Перемещает все компоненты из активного списка в список отключенных.
     */
    disableAllComponents(): void;
    /**
     * @description
     * Включает все ранее отключенные компоненты.
     * Перемещает все компоненты из списка отключенных в список активных.
     */
    enableAllComponents(): void;
    /**
     * @description
     * Проверяет, соответствует ли сущность указанным критериям фильтрации.
     * Сущность должна иметь все компоненты из includes и не иметь ни одного из excludes.
     *
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @returns true, если сущность удовлетворяет фильтру, иначе false.
     */
    isSatisfiedFilter(filter: ComponentFilter): boolean;
}

/**
 * @description
 * Интерфейс хранилища сущностей.
 * Определяет основные методы для управления сущностями и их фильтрации.
 */
export declare interface IEntityStorage {
    /**
     * @description Добавляет новую сущность в хранилище.
     * @param entity Сущность для добавления.
     * @throws {Error} Если сущность с таким UUID уже существует.
     */
    addEntity(entity: IEntity): void;
    /**
     * @description Удаляет сущность из хранилища.
     * @param uuid UUID сущности для удаления.
     * @returns Удаленная сущность или undefined, если сущность не найдена.
     */
    removeEntity(uuid: string): IEntity | undefined;
    /**
     * @description Получает сущность из хранилища.
     * @param uuid UUID искомой сущности.
     * @returns Найденная сущность или undefined, если сущность не найдена.
     */
    getEntity(uuid: string): IEntity | undefined;
    /**
     * @description Возвращает массив всех сущностей в хранилище.
     * @returns Массив всех сущностей.
     */
    getAllEntities(): IEntity[];
    /**
     * @description Возвращает массив всех активных сущностей (entity.active === true).
     * @returns Массив активных сущностей.
     */
    getActiveEntities(): IEntity[];
    /**
     * @description Возвращает массив всех неактивных сущностей (entity.active === false).
     * @returns Массив неактивных сущностей.
     */
    getInactiveEntities(): IEntity[];
    /**
     * @description Фильтрует сущности по заданным критериям компонентов.
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @param withDisabled Если true, фильтрует все сущности, включая неактивные. По умолчанию false.
     * @returns Объект Filtered с отфильтрованными сущностями.
     */
    filter(filter: ComponentFilter, withDisabled?: boolean): Filtered;
}

export declare interface IGroupOption extends Partial<ISystemOptions> {
    instance?: ISystemProvider;
}

export declare interface IGroupSortedOption extends ISystemOptions {
    order: number;
    instance: ISystemProvider;
}

export declare interface IGroupWithId {
    id: string;
    group: GroupType<any>;
}

/**
 * @description
 * Декоратор для внедрения зависимостей в Системы и SystemGroup.
 *
 * Особенности:
 * - Для Систем зависимости внедряются при создании инстанса
 * - Для SystemGroup зависимости внедряются через геттеры
 * - Поддерживает иммутабельные зависимости
 *
 * @example
 * ```typescript
 * // В Системе
 * class MovementSystem extends System {
 *     @Inject(AbstractAudioService)
 *     private _audio!: AbstractAudioService;
 *
 *     @Inject(GameState)
 *     private _state!: GameState; // Иммутабельный объект
 * }
 *
 * // В SystemGroup
 * class GameGroup extends SystemGroup {
 *     @Inject(GameConfig)
 *     private _config!: GameConfig;
 * }
 * ```
 *
 * @template T Тип внедряемой зависимости
 * @param token Токен зависимости (класс или символ)
 * @throws Если токен не предоставлен
 */
export declare function Inject<T>(token: Token<T>): (target: any, propertyKey: string) => void;

export declare interface IQueueItem extends ISystemInstance {
    groupId: string;
    system: ISystem<any>;
    executionId: string;
}

export declare interface ISignal<T = any> {
    uuid: string;
    name: string | undefined;
    subscribe(callback: (data: T) => void): Disposable_2;
    once(callback: (data: T) => void): Disposable_2;
    unsubscribe(callback: (data: T) => void): void;
    dispatch(data: T): void;
}

export declare interface ISignalConfig {
    signal: ISignal<any>;
    groups: GroupType<any>[];
}

export declare interface ISleep {
    id: string;
    wait(): Promise<void>;
    resolve(): void;
}

/**
 * @description
 * Интерфейс для реализации систем в ECS фреймворке.
 * Системы обрабатывают сущности, отфильтрованные по компонентам.
 *
 * Особенности:
 * - Каждая система существует в единственном экземпляре (кэшируется в SystemsContainer)
 * - Системы группируются в SystemGroup для управления порядком выполнения
 * - Поддерживается асинхронное выполнение
 * - Доступно внедрение зависимостей через ServiceContainer
 *
 * @example
 * ```typescript
 * // Простая система без дополнительных данных
 * export class ExampleSystem extends System {
 *     public async execute() {
 *         // Фильтруем сущности по компонентам
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         // Обрабатываем каждую сущность
 *         entities.forEach(entity => {
 *             // ... логика здесь ...
 *         })
 *     }
 * }
 *
 * // Система с дополнительными данными от SystemGroup
 * export class VelocitySystem extends System<Vec2> {
 *     public async execute(data: Vec2) {
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         // Используем данные из SystemGroup
 *         entities.forEach(entity => {
 *             const position = entity.getComponent(PositionComponent);
 *             position.x += data.x;
 *             position.y += data.y;
 *         })
 *     }
 * }
 * ```
 */
export declare interface ISystem<TData> {
    /**
     * @description
     * Идентификатор SystemGroup, к которой принадлежит система.
     * Устанавливается автоматически при добавлении системы в группу.
     */
    groupId: string;
    /**
     * @description
     * Устанавливает контекст выполнения системы.
     * Вызывается автоматически при запуске системы в SystemGroup.
     *
     * @param groupId Идентификатор группы, в которой выполняется система.
     * @param executionId Идентификатор текущего выполнения группы.
     * @param entityStorage Хранилище сущностей, которое будет использоваться для фильтрации.
     */
    setContext(groupId: string, executionId: string, entityStorage: IEntityStorage): void;
    /**
     * @description
     * Запускает выполнение системы.
     * Этот метод вызывается из SystemGroup и не должен вызываться напрямую.
     *
     * @param data Дополнительные данные для передачи в метод execute.
     * @param externalFilter Дополнительный фильтр от SystemGroup.
     * @param withDisabled Включать ли неактивные сущности.
     * @returns void | Promise<void> Система может быть асинхронной.
     */
    run(data: TData, externalFilter: ComponentFilter, withDisabled: boolean): void | Promise<void>;
    /**
     * @description
     * Фильтрует сущности по компонентам.
     * Автоматически объединяет фильтр системы с фильтром группы.
     *
     * @param filter Фильтр для применения к сущностям.
     * @returns Объект Filtered со списком отфильтрованных сущностей.
     */
    filter(filter: ComponentFilter): Filtered;
    /**
     * @description
     * Фильтрует сущности по компонентам без учета фильтра группы.
     * Используется, когда нужно проигнорировать фильтр группы.
     *
     * @param filter Фильтр для применения к сущностям.
     * @returns Объект Filtered со списком отфильтрованных сущностей.
     */
    cleanFilter(filter: ComponentFilter): Filtered;
    /**
     * @description
     * Точка входа для системы, где реализуется вся логика.
     * Этот метод должен быть реализован в каждой конкретной системе.
     *
     * @param data Дополнительные данные, переданные из SystemGroup.
     * @returns void | Promise<void> Метод может быть асинхронным.
     */
    execute(data: TData): void | Promise<void>;
    /**
     * @description
     * Вызывается при принудительной остановке системы.
     * Может быть переопределен для очистки ресурсов.
     */
    forceStop(): void;
}

export declare interface ISystemExternalData {
    data: any;
}

/**
 * @description
 * Интерфейс для реализации групп Систем в ECS фреймворке.
 *
 * Основные возможности:
 * - Управление порядком выполнения Систем
 * - Передача данных в Системы от Signal
 * - Переопределение зависимостей для Систем
 *
 * Дополнительные функции:
 * - Расширение фильтров Систем
 * - Повторное выполнение Систем
 * - Условное выполнение Систем
 *
 * Зависимости:
 * - Группа может определять собственные зависимости
 * - Зависимости группы переопределяют глобальные зависимости из EmpressCore
 * - Системы могут получать зависимости через декоратор @Inject
 *
 * @example
 * ```typescript
 * class MyGroup extends SystemGroup<MyData> {
 *     // Настройка порядка выполнения Систем
 *     public setup(chain: SystemChain, data: MyData): void {
 *         chain
 *             // Простая регистрация Системы
 *             .add(FirstSystem)
 *             // Регистрация с передачей данных
 *             .add(SecondSystem, data)
 *             // Расширение фильтра Системы
 *             .add(ThirdSystem, null, { includes: [AdditionalComponent] })
 *             // Повторное и условное выполнение
 *             .add(FourthSystem, null, { repeat: 3, canExecute: (data) => data.someCondition });
 *     }
 *
 *     // Настройка зависимостей для Систем
 *     protected setupDependencies(): Provider[] {
 *         return [
 *             {
 *                 provide: AbstractService,
 *                 useClass: ConcreteService
 *             }
 *         ];
 *     }
 * }
 * ```
 */
export declare interface ISystemGroup<T = any> {
    /**
     * @description
     * Уникальный идентификатор группы.
     */
    uuid: string;
    /**
     * @description
     * Экземпляр SystemChain для настройки порядка выполнения Систем.
     */
    chain: SystemChain;
    /**
     * @description
     * Регистрирует зависимости группы в ServiceContainer.
     * Зависимости группы переопределяют глобальные зависимости из EmpressCore.
     */
    registerGroupDependencies(): void;
    /**
     * @description
     * Определяет порядок и настройки выполнения Систем в группе.
     * Этот метод вызывается при каждом срабатывании Signal.
     *
     * @param data Данные, полученные от Signal.
     */
    setup(chain: SystemChain, data: T): void;
    /**
     * @description
     * Сортирует и подготавливает опции Систем для выполнения.
     * Устанавливает значения по умолчанию и сортирует по порядку.
     *
     * @param data Данные от Signal.
     * @returns Отсортированный массив опций Систем.
     */
    sorted(data: T): IGroupSortedOption[];
}

export declare interface ISystemInstance extends ISystemExternalData, ISystemOptions {
    system: ISystem<any>;
    groupId: string;
}

export declare interface ISystemOptions {
    id: string;
    withDisabled: boolean;
    includes: ComponentType<any>[];
    excludes: ComponentType<any>[];
    repeat: number;
    canExecute: () => boolean;
}

export declare interface ISystemProvider extends ISystemExternalData {
    system: SystemType<any, any>;
}

/**
 * @description
 * Контейнер для кэширования инстансов Систем.
 * Гарантирует, что в приложении существует только один экземпляр каждой Системы.
 *
 * Особенности:
 * - Создает Системы при первом запросе
 * - Хранит созданные инстансы в кэше
 * - Возвращает существующие инстансы при повторных запросах
 */
export declare interface ISystemsContainer {
    /**
     * @description
     * Получает инстанс Системы из кэша или создает новый.
     * Если Система уже существует, возвращает её из кэша.
     * Если нет - создает новый инстанс и кэширует его.
     *
     * @param ctor Класс Системы.
     * @returns Инстанс Системы.
     */
    get(ctor: SystemType<any, any>): ISystem<any>;
}

export declare interface ITimerController {
    setTimeout(callback: () => void, duration: number): string;
    setInterval(callback: () => void, duration: number): string;
    sleep(duration: number): ISleep;
    clear(uuid: string): void;
    update(deltaTime: number): void;
}

export declare interface IUpdatable {
    uuid: string;
    update(deltaTime: number): void;
}

/**
 * @description
 * Данные, передаваемые в сигнал обновления.
 */
export declare interface IUpdateLoopData {
    deltaTime: number;
    speedMultiplier: number;
    multipliedDelta: number;
}

/**
 * @description
 * Управляет жизненным циклом игры через два основных хука: start и update.
 * Предоставляет возможности для управления игровым циклом: пауза, изменение скорости,
 * регистрация колбэков на старт и обновление.
 *
 * @example Базовое использование
 * ```typescript
 * const lifecycle = new LifeCycle();
 *
 * // Подписка на обновления
 * lifecycle.addUpdateCallback((deltaTime) => {
 *   // Обновление игровой логики
 * });
 *
 * // Подписка на старт
 * lifecycle.addStartCallback(() => {
 *   // Инициализация при старте
 * });
 *
 * // Инициализация и запуск
 * lifecycle.init();
 * lifecycle.start();
 * ```
 *
 * @example Управление игровым циклом
 * ```typescript
 * // Пауза/возобновление
 * lifecycle.pause(true);
 * lifecycle.pause(false);
 *
 * // Изменение скорости
 * lifecycle.setSpeedMultiplier(2); // Ускорение в 2 раза
 * lifecycle.setSpeedMultiplier(0.5); // Замедление в 2 раза
 * ```
 */
export declare class LifeCycle {
    private _lastTime;
    private _paused;
    private _speedMultiplier;
    private _onUpdate;
    private _onStart;
    /**
     * @description
     * Запускает игру, вызывая все зарегистрированные колбэки старта
     * и отправляя сигнал OnStartSignal.
     * Запускает requestAnimationFrame для начала обновлений.
     */
    start(): void;
    /**
     * @description
     * Добавляет колбэк, который будет вызван при старте игры.
     * @param callback Функция для выполнения при старте
     */
    addStartCallback(callback: () => void): void;
    /**
     * @description
     * Добавляет колбэк, который будет вызываться каждый кадр.
     * @param callback Функция для выполнения каждый кадр, получает deltaTime в секундах
     */
    addUpdateCallback(callback: (deltaTime: number) => void): void;
    /**
     * @description
     * Удаляет ранее добавленный колбэк обновления.
     * @param callback Функция для удаления
     */
    removeUpdateCallback(callback: (deltaTime: number) => void): void;
    /**
     * @description
     * Ставит игру на паузу или возобновляет её выполнение.
     * @param paused true для паузы, false для возобновления
     */
    pause(paused: boolean): void;
    /**
     * @description
     * Устанавливает множитель скорости игры.
     * @param speedMultiplier Множитель скорости (1 - нормальная скорость, <1 - замедление, >1 - ускорение)
     */
    setSpeedMultiplier(speedMultiplier: number): void;
    private animate;
    private update;
}

/**
 * @description
 * Сигнал, отправляемый при старте игры.
 * Используется для выполнения групп систем при старте.
 */
export declare const OnStartSignal: Signal<void>;

/**
 * @description
 * Сигнал, отправляемый каждый кадр.
 * Используется для выполнения групп систем при обновлении.
 */
export declare const OnUpdateSignal: Signal<IUpdateLoopData>;

export declare type Provider<T = any> = ClassProvider<T> | FactoryProvider<T>;

/**
 * @description
 * Контейнер для управления зависимостями в ECS фреймворке.
 * Реализует паттерн Dependency Injection с поддержкой модулей.
 *
 * Особенности:
 * - Поддерживает глобальные и модульные зависимости
 * - Позволяет переопределять зависимости на уровне модулей
 * - Поддерживает классы и объекты как зависимости
 * - Позволяет создавать иммутабельные зависимости
 *
 * @example
 * ```typescript
 * // Регистрация глобальных зависимостей
 * ServiceContainer.instance.registerGlobal([
 *   { provide: AudioService, useClass: DefaultAudioService },
 *   { provide: GameState, useFactory: () => ({ score: 0 }), immutable: true }
 * ]);
 *
 * // Переопределение в модуле
 * ServiceContainer.instance.registerModule('gameModule', [
 *   { provide: AudioService, useClass: CustomAudioService }
 * ]);
 * ```
 */
export declare class ServiceContainer {
    private static _instance;
    /**
     * @description
     * Получает или создает единственный экземпляр контейнера.
     * Реализует паттерн Singleton.
     */
    static get instance(): ServiceContainer;
    private providers;
    private instances;
    private systemTokens;
    private constructor();
    /**
     * @description
     * Регистрирует провайдеры для конкретного модуля.
     * Может переопределять глобальные зависимости.
     *
     * @param moduleId Идентификатор модуля.
     * @param providers Массив провайдеров.
     */
    registerModule(moduleId: string, providers: Provider[]): void;
    /**
     * @description
     * Регистрирует глобальные провайдеры.
     * Эти провайдеры доступны во всех модулях, если не переопределены.
     *
     * @param providers Массив провайдеров.
     */
    registerGlobal(providers: Provider[]): void;
    /**
     * @description
     * Получает зависимость по токену.
     * Сначала ищет в модуле, затем в глобальных зависимостях.
     *
     * @param token Токен зависимости.
     * @param moduleId Идентификатор модуля.
     * @returns Инстанс зависимости.
     * @throws Если зависимость не найдена.
     */
    get<T>(token: Token<T>, moduleId?: string): T;
    /**
     * @description
     * Запоминает зависимости для Системы.
     * Используется декоратором @Inject для внедрения зависимостей в Системы.
     *
     * @param system Класс Системы.
     * @param token Токен зависимости.
     * @param key Ключ свойства в Системе.
     */
    memorizeSystem(system: SystemType<any, any>, token: Token<any>, key: string): void;
    /**
     * @description
     * Внедряет зависимости в Систему.
     * Создает иммутабельные прокси для помеченных зависимостей.
     *
     * @param moduleId Идентификатор модуля.
     * @param system Система, в которую внедряются зависимости.
     */
    getDependencyForSystem(moduleId: string, system: ISystem<any>): void;
}

/**
 * @description
 * Сигнал — это способ коммуникации между разными частями приложения.
 * Поддерживает как синхронные, так и асинхронные слушатели,
 * гарантируя завершение всех асинхронных операций
 * перед тем, как Promise от dispatch будет разрешён.
 *
 * @example Базовое использование
 * ```ts
 * import { Signal } from '@initiator/signal';
 *
 * // Создаём новый сигнал
 * const mySignal = new Signal<string>();
 *
 * // Подписываемся синхронно
 * mySignal.subscribe((data) => console.log('Sync received:', data));
 *
 * // Подписываемся асинхронно
 * mySignal.subscribe(async (data) => {
 *     await someAsyncOperation(data);
 *     console.log('Async completed:', data);
 * });
 *
 * // Диспатчим и ждём всех слушателей
 * await mySignal.dispatch('Hello world!');
 * console.log('Все слушатели завершены!');
 * ```
 *
 * @example Одноразовая подписка
 * ```ts
 * // Подписаться только на первый вызов
 * mySignal.once(async (data) => {
 *     await processDataOnce(data);
 * });
 * ```
 *
 * @example Очистка подписки
 * ```ts
 * // Использование Disposable для отписки
 * const disposable = mySignal.subscribe(async (data) => {
 *     await handleData(data);
 * });
 *
 * // Позже: отписываемся
 * disposable.dispose();
 * ```
 */
export declare class Signal<T> implements ISignal<T> {
    private _name;
    private listeners;
    /**
     * @description
     * Имя сигнала. Необязательное поле, используется для отладки.
     */
    get name(): string | undefined;
    /**
     * @description
     * Уникальный идентификатор сигнала.
     */
    get uuid(): string;
    private _uuid;
    /**
     * @description
     * Создаёт новый сигнал.
     * @param name - Имя сигнала. Необязательное поле, используется для отладки.
     */
    constructor(_name?: string);
    /**
     * @description Подписывается на сигнал.
     * @param callback - Функция, которая будет вызвана при отправке сигнала.
     * @returns - Объект, который можно использовать для отписки от сигнала.
     */
    subscribe(callback: (data: T) => void | Promise<void>): Disposable_2;
    /**
     * @description Подписывается на сигнал только один раз.
     * @param callback - Функция, которая будет вызвана при отправке сигнала.
     * @returns - Объект, который можно использовать для отписки от сигнала.
     */
    once(callback: (data: T) => void | Promise<void>): Disposable_2;
    /**
     * @description Отписывается от сигнала.
     * @param callback - Функция, которая была подключена к сигналу.
     */
    unsubscribe(callback: (data: T) => void | Promise<void>): void;
    /**
     * @description Отправляет сигнал.
     * @param data - Данные, которые будут переданы в функции обратного вызова.
     */
    dispatch(data: T): Promise<void>;
}

export declare class SignalChain {
    private _existingProviders;
    /**
     * @description
     * Возвращает массив настроенных групп
     *
     * @returns Массив настроенных групп
     */
    get providers(): IGroupWithId[];
    private _providers;
    constructor(_existingProviders?: IGroupWithId[]);
    /**
     * @description
     * Добавляет группу в конец списка
     * @param group Класс группы
     * @param id Идентификатор группы (опционально)
     */
    add(group: GroupType<any>, id?: string): SignalChain;
    /**
     * @description
     * Добавляет группу в начало списка
     * @param group Класс группы
     * @param id Идентификатор группы (опционально)
     */
    prepend(group: GroupType<any>, id?: string): SignalChain;
    /**
     * @description
     * Вставляет группу перед указанной группой
     * @param targetId Идентификатор целевой группы
     * @param group Класс группы для вставки
     * @param id Идентификатор новой группы (опционально)
     */
    insertBefore(targetId: string, group: GroupType<any>, id?: string): SignalChain;
    /**
     * @description
     * Вставляет группу после указанной группы
     * @param targetId Идентификатор целевой группы
     * @param group Класс группы для вставки
     * @param id Идентификатор новой группы (опционально)
     */
    insertAfter(targetId: string, group: GroupType<any>, id?: string): SignalChain;
    /**
     * @description
     * Заменяет указанную группу
     * @param targetId Идентификатор группы для замены
     * @param group Новый класс группы
     */
    replace(targetId: string, group: GroupType<any>): SignalChain;
    /**
     * @description
     * Удаляет указанную группу
     * @param targetId Идентификатор группы для удаления
     */
    remove(targetId: string): SignalChain;
}

/**
 * @description
 * Контроллер для связывания Signal и Групп Систем.
 * При срабатывании Signal запускает связанные с ним Группы в ExecutionController.
 *
 * Особенности:
 * - Поддерживает привязку нескольких Групп к одному Signal
 * - Автоматически управляет подписками на Signal
 * - Отслеживает и останавливает выполнение Групп
 *
 * @example
 * ```typescript
 * // Создание и настройка
 * const controller = new SignalsController(executionController);
 *
 * // Настройка связей
 * controller.setup([
 *   {
 *     signal: moveSignal,
 *     groups: [MovementGroup, CollisionGroup]
 *   },
 *   {
 *     signal: attackSignal,
 *     groups: [CombatGroup]
 *   }
 * ]);
 *
 * // Активация подписок
 * controller.subscribe();
 * ```
 */
export declare class SignalsController {
    private _executionController;
    private _pairs;
    private _disposables;
    private _executionIds;
    constructor(_executionController: ExecutionController);
    /**
     * @description
     * Настраивает связи между Signal и Группами Систем.
     * Можно привязать несколько Групп к одному Signal.
     *
     * @param configs Массив конфигураций связей Signal-Группа.
     */
    setup(configs: ISignalConfig[]): void;
    /**
     * @description
     * Активирует подписки на все настроенные Signal.
     * При срабатывании Signal запускает связанные Группы в ExecutionController.
     */
    subscribe(): void;
    /**
     * @description
     * Отключает все подписки на Signal и останавливает выполнение Групп.
     * Используется при остановке или перезапуске приложения.
     */
    unsubscribe(): void;
    /**
     * @description
     * Настраивает связь между сигналом и группами систем
     * @param signal Сигнал
     * @param configurator Функция конфигурации
     */
    configure(signal: ISignal<any>, configuratorFn: (configurator: SignalChain) => void): void;
    private _subscribeSignal;
}

/**
 * @description
 * Абстрактный класс для реализации игровой логики в ECS фреймворке.
 * Системы обрабатывают сущности, отфильтрованные по компонентам.
 *
 * Особенности:
 * - Каждая система существует в единственном экземпляре (кэшируется в SystemsContainer)
 * - Системы группируются в SystemGroup для управления порядком выполнения
 * - Поддерживается асинхронное выполнение
 * - Доступно внедрение зависимостей через ServiceContainer
 *
 * @example
 * ```typescript
 * // Простая система без дополнительных данных
 * export class ExampleSystem extends System {
 *     public async execute() {
 *         // Фильтруем сущности по компонентам
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         // Обрабатываем каждую сущность
 *         entities.forEach(entity => {
 *             // ... логика здесь ...
 *         })
 *     }
 * }
 *
 * // Система с дополнительными данными от SystemGroup
 * export class VelocitySystem extends System<Vec2> {
 *     public async execute(data: Vec2) {
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         // Используем данные из SystemGroup
 *         entities.forEach(entity => {
 *             const position = entity.getComponent(PositionComponent);
 *             position.x += data.x;
 *             position.y += data.y;
 *         })
 *     }
 * }
 * ```
 */
export declare abstract class System<TData = any> implements ISystem<TData> {
    /**
     * @description
     * Идентификатор SystemGroup, к которой принадлежит система.
     * Устанавливается автоматически при добавлении системы в группу.
     */
    get groupId(): string;
    protected get executionId(): string;
    private _groupId;
    private _executionId;
    protected withDisabled: boolean;
    protected externalFilter: ComponentFilter;
    private _entityStorage;
    /**
     * @description
     * Устанавливает контекст выполнения системы.
     * Вызывается автоматически при запуске системы в SystemGroup.
     *
     * @param groupId Идентификатор группы, в которой выполняется система.
     * @param executionId Идентификатор текущего выполнения группы.
     * @param entityStorage Хранилище сущностей, которое будет использоваться для фильтрации.
     */
    setContext(groupId: string, executionId: string, entityStorage: IEntityStorage): void;
    /**
     * @description
     * Запускает выполнение системы.
     * Этот метод вызывается из SystemGroup и не должен вызываться напрямую.
     *
     * @param data Дополнительные данные для передачи в метод execute.
     * @param externalFilter Дополнительный фильтр от SystemGroup.
     * @param withDisabled Включать ли неактивные сущности.
     * @returns void | Promise<void> Система может быть асинхронной.
     */
    run(data: TData, externalFilter: ComponentFilter, withDisabled: boolean): void | Promise<void>;
    /**
     * @description
     * Фильтрует сущности по компонентам.
     * Автоматически объединяет фильтр системы с фильтром группы.
     *
     * @param filter Фильтр для применения к сущностям.
     * @returns Объект Filtered со списком отфильтрованных сущностей.
     */
    filter(filter: ComponentFilter): Filtered;
    /**
     * @description
     * Фильтрует сущности по компонентам без учета фильтра группы.
     * Используется, когда нужно проигнорировать фильтр группы.
     *
     * @param filter Фильтр для применения к сущностям.
     * @returns Объект Filtered со списком отфильтрованных сущностей.
     */
    cleanFilter(filter: ComponentFilter): Filtered;
    /**
     * @description
     * Точка входа для системы, где реализуется вся логика.
     * Этот метод должен быть реализован в каждой конкретной системе.
     *
     * @param data Дополнительные данные, переданные из SystemGroup.
     * @returns void | Promise<void> Метод может быть асинхронным.
     */
    abstract execute(data: TData): void | Promise<void>;
    /**
     * @description
     * Вызывается при принудительной остановке системы.
     * Может быть переопределен для очистки ресурсов.
     */
    forceStop(): void;
}

/**
 * @description
 * Класс для создания цепочки Систем.
 *
 * @example
 * ```typescript
 * const chain = new SystemChain();
 * chain.add(SomeSystem, { id: 'SomeSystem' });
 * chain.add(SomeOtherSystem, { id: 'SomeOtherSystem' });
 * ```
 */
export declare class SystemChain {
    /**
     * @description
     * Получает массив опций Систем в группе.
     *
     * @returns Массив опций Систем.
     */
    get providers(): IGroupOption[];
    private _providers;
    /**
     * @description
     * Добавляет Систему в конец группы.
     *
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    add<T extends SystemType<any, any>>(system: T, data?: SystemData<InstanceType<T>>, options?: Partial<ISystemOptions>): SystemChain;
    /**
     * @description
     * Добавляет Систему в начало группы.
     *
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    prepend<T extends SystemType<any, any>>(system: T, data?: SystemData<InstanceType<T>>, options?: Partial<ISystemOptions>): SystemChain;
    /**
     * @description
     * Вставляет Систему перед определенной Системой в группе.
     *
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    insertBefore<T extends SystemType<any, any>>(targetId: string, system: T, data?: SystemData<InstanceType<T>>, options?: Partial<ISystemOptions>): SystemChain;
    /**
     * @description
     * Вставляет Систему после определенной Системы в группе.
     *
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    insertAfter<T extends SystemType<any, any>>(targetId: string, system: T, data?: SystemData<InstanceType<T>>, options?: Partial<ISystemOptions>): SystemChain;
    /**
     * @description
     * Заменяет определенную Систему в группе.
     *
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    replace<T extends SystemType<any, any>>(targetId: string, system: T, data?: SystemData<InstanceType<T>>, options?: Partial<ISystemOptions>): SystemChain;
    /**
     * @description
     * Удаляет определенную Систему из группы.
     *
     * @param targetId Идентификатор целевой Системы.
     * @returns Экземпляр SystemChain.
     */
    remove(targetId: string): SystemChain;
    /**
     * @description
     * Получает определенную Систему из группы.
     *
     * @param targetId Идентификатор целевой Системы.
     * @returns Опция Системы или undefined.
     */
    get(targetId: string): IGroupOption | undefined;
    /**
     * @description
     * Проверяет наличие определенной Системы в группе.
     *
     * @param targetId Идентификатор целевой Системы.
     * @returns true, если Система найдена, иначе false.
     */
    has(targetId: string): boolean;
    /**
     * @description
     * Возвращает количество Систем в группе.
     *
     * @returns Количество Систем.
     */
    count(): number;
    /**
     * @description
     * Очищает массив провайдеров для повтороного переопределения
     */
    clear(): void;
}

export declare type SystemData<T extends ISystem<any>> = T extends ISystem<infer U> ? U : never;

/**
 * @description
 * Абстрактный класс для группировки и управления порядком выполнения Систем.
 *
 * Основные возможности:
 * - Управление порядком выполнения Систем
 * - Передача данных в Системы от Signal
 * - Переопределение зависимостей для Систем
 *
 * Дополнительные функции:
 * - Расширение фильтров Систем
 * - Повторное выполнение Систем
 * - Условное выполнение Систем
 *
 * Зависимости:
 * - Группа может определять собственные зависимости
 * - Зависимости группы переопределяют глобальные зависимости из EmpressCore
 * - Системы могут получать зависимости через декоратор @Inject
 *
 * @example
 * ```typescript
 * class MyGroup extends SystemGroup<MyData> {
 *     // Настройка порядка выполнения Систем
 *     public setup(chain: SystemChain, data: MyData): void {
 *         chain
 *             // Простая регистрация Системы
 *             .add(FirstSystem)
 *             // Регистрация с передачей данных
 *             .add(SecondSystem, data)
 *             // Расширение фильтра Системы
 *             .add(ThirdSystem, null, { includes: [AdditionalComponent] })
 *             // Повторное и условное выполнение
 *             .add(FourthSystem, null, { repeat: 3, canExecute: (data) => data.someCondition });
 *     }
 *
 *     // Настройка зависимостей для Систем
 *     protected setupDependencies(): Provider[] {
 *         return [
 *             {
 *                 provide: AbstractService,
 *                 useClass: ConcreteService
 *             }
 *         ];
 *     }
 * }
 * ```
 */
export declare abstract class SystemGroup<T = any> implements ISystemGroup<T> {
    /**
     * @description
     * Уникальный идентификатор группы.
     */
    get uuid(): string;
    /**
     * @description
     * Экземпляр SystemChain для настройки порядка выполнения Систем.
     */
    get chain(): SystemChain;
    set chain(chain: SystemChain);
    private _uuid;
    private _chain;
    /**
     * @description
     * Определяет порядок и настройки выполнения Систем в группе.
     * Этот метод вызывается при каждом срабатывании Signal.
     *
     * @param data Данные, полученные от Signal.
     * @returns Массив опций для настройки Систем.
     */
    abstract setup(chain: SystemChain, data: T): void;
    /**
     * @description
     * Сортирует и подготавливает опции Систем для выполнения.
     * Устанавливает значения по умолчанию и сортирует по порядку.
     *
     * @param data Данные от Signal.
     * @returns Отсортированный массив опций Систем.
     */
    sorted(data: T): IGroupSortedOption[];
    /**
     * @description
     * Регистрирует зависимости группы в ServiceContainer.
     * Зависимости группы переопределяют глобальные зависимости из EmpressCore.
     */
    registerGroupDependencies(): void;
    protected setupDependencies(): Provider[];
}

/**
 * @description
 * Контейнер для кэширования инстансов Систем.
 * Гарантирует, что в приложении существует только один экземпляр каждой Системы.
 *
 * Особенности:
 * - Создает Системы при первом запросе
 * - Хранит созданные инстансы в кэше
 * - Возвращает существующие инстансы при повторных запросах
 */
export declare class SystemsContainer implements ISystemsContainer {
    private _cache;
    /**
     * @description
     * Получает инстанс Системы из кэша или создает новый.
     * Если Система уже существует, возвращает её из кэша.
     * Если нет - создает новый инстанс и кэширует его.
     *
     * @param ctor Класс Системы.
     * @returns Инстанс Системы.
     */
    get(ctor: SystemType<any, any>): ISystem<any>;
}

/**
 * @description
 * Тип конструктора системы.
 * Используется для создания и кэширования систем в SystemsContainer.
 *
 * @template TClass Тип системы, наследующий ISystem
 * @template TData Тип дополнительных данных системы
 */
export declare type SystemType<TClass extends ISystem<TData>, TData> = new (...args: any[]) => TClass;

/**
 * @description
 * Контроллер для управления таймерами и интервалами.
 * В отличие от стандартных setTimeout и setInterval, таймеры зависят от FPS игры
 * и работают на основе requestAnimationFrame, что делает их безопасными в фоновом режиме.
 *
 * @example Пример использования
 * ```typescript
 * import { TimerController } from '@shared/timer';
 *
 * const timerController = new TimerController();
 *
 * // Создание таймера
 * const timerId = timerController.setTimeout(
 *   () => console.log('Таймер завершен'),
 *   1000
 * );
 *
 * // Удаление таймера по ID
 * timerController.clear(timerId);
 *
 * // Создание интервала
 * const intervalId = timerController.setInterval(
 *   () => console.log('Тик интервала'),
 *   500
 * );
 *
 * // Удаление интервала по ID
 * timerController.clear(intervalId);
 * ```
 */
export declare class TimerController implements ITimerController {
    private _updatables;
    /**
     * @description
     * Создает новый таймер, который выполнит колбэк после указанной задержки.
     * @param callback Функция, которая будет вызвана по завершению таймера
     * @param duration Длительность таймера в миллисекундах
     * @returns ID созданного таймера
     */
    setTimeout(callback: () => void, duration: number): string;
    /**
     * @description
     * Создает новый интервал, который будет периодически выполнять колбэк.
     * @param callback Функция, которая будет вызываться на каждом тике интервала
     * @param duration Период интервала в миллисекундах
     * @returns ID созданного интервала
     */
    setInterval(callback: () => void, duration: number): string;
    /**
     * @description
     * Создает новую задержку выполнения кода.
     * @param duration Длительность задержки в миллисекундах
     * @returns Объект с методами `wait` и `resolve`. Метод `wait` возвращает Promise, который разрешится после указанной задержки.
     * Метод `resolve` немедленно разрешает Promise и удаляет таймер из контроллера.
     */
    sleep(duration: number): ISleep;
    /**
     * @description
     * Останавливает таймер или интервал по его ID.
     * @param uuid ID таймера или интервала
     */
    clear(uuid: string): void;
    /**
     * @description
     * Обновляет все таймеры и интервалы.
     * @param deltaTime Время между кадрами в миллисекундах
     */
    update(deltaTime: number): void;
}

export declare type Token<T = any> = Constructor<T> | symbol;

/**
 * @description
 * Класс с утилитарными функциями общего назначения.
 * Содержит методы для генерации UUID, дебаунсинга и создания Proxy-декораторов.
 */
export declare class Utils {
    private static counter;
    private static lastTime;
    /**
     * @description
     * Генерирует гарантированно уникальный идентификатор.
     * Использует комбинацию времени, счётчика и случайного числа.
     * Гарантирует уникальность даже при многократной генерации в пределах одной миллисекунды.
     *
     * @returns Строка с уникальным идентификатором в формате 'timestamp-counter-random'
     */
    static uuid(): string;
    /**
     * @description
     * Создаёт функцию с задержкой выполнения (дебаунсинг).
     * При многократном вызове выполнится только последний вызов после задержки.
     *
     * @param callback Функция для выполнения
     * @param delay Задержка в миллисекундах
     * @returns Функция с дебаунсингом
     */
    static debounce(callback: Callback, delay?: number): Callback;
    /**
     * @description
     * Создаёт Proxy-декоратор для объекта, который запрещает прямое изменение свойств.
     * Используется для контроля изменений состояния.
     *
     * @param data Объект для обёртывания в Proxy
     * @returns Proxy-объект, запрещающий прямые изменения
     */
    static createProxyDecorator<T extends object>(data: T): T;
}

export { }
