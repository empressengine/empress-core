import { ComponentFilter } from '@data/entity';
import { IEntityStorage } from '@data/entity-storage';
import { Filtered } from '@data/filtered';

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
export interface ISystem<TData> {
    /**
     * @description Gets the identifier of the group to which this system belongs.
     */
    groupId: string;

    /**
     * @description Sets the context for the system.
     */
    setContext(groupId: string, executionId: string, entityStorage: IEntityStorage): void;

    /**
     * Runs the System.
     *
     * @param groupId - The identifier of the group to which this system belongs.
     * @param data - The data to be passed to the `execute` method.
     * @param externalFilter - An additional filter for the system.
     * @param withDisabled - Whether to include entities marked as disabled.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    run(
        data: TData,
        externalFilter: ComponentFilter,
        withDisabled: boolean,
    ): void | Promise<void>;

    /**
     * Filters entities by their components.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    filter(filter: ComponentFilter): Filtered;

    /**
     * The entry point for the system, where all logic is performed.
     *
     * @param data - Additional data passed from the Group.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    execute(data: TData): void | Promise<void>;

    /**
     * @description Called when a system thread is forcibly stopped.
     */
    forceStop(): void;
}
