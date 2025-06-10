import { ComponentFilter, IEntity } from '@data/entity';
import { Filtered } from '@data/filtered';

/**
 * @description
 * Интерфейс хранилища сущностей.
 * Определяет основные методы для управления сущностями и их фильтрации.
 */
export interface IEntityStorage {
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
