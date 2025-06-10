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
    run(
        data: TData,
        externalFilter: ComponentFilter,
        withDisabled: boolean,
    ): void | Promise<void>;

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
    cleanFilter(filter: ComponentFilter): Filtered

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
