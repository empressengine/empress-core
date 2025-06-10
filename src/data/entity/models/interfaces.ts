import { Component, ComponentType } from '../../component/component';

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
export interface ComponentFilter {
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
export interface IEntity {
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
