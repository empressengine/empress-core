import { ComponentFilter, IEntity } from '@data/entity';
import { IEntityStorage } from './models';
import { compileFilter } from './utils';
import { Filtered } from '@data/filtered';
import { ComponentsRaritySorter } from '@data/component';

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
export class EntityStorage implements IEntityStorage {
    private _entities: Map<string, IEntity> = new Map();

    /**
     * @description
     * Добавляет новую сущность в хранилище.
     * Проверяет уникальность UUID сущности.
     *
     * @param entity Сущность для добавления в хранилище.
     * @throws {Error} Если сущность с таким UUID уже существует.
     */
    public addEntity(entity: IEntity): void {
        const { uuid, name } = entity;
        if (this._entities.has(uuid)) {
            throw new Error(`Entity with UUID [${name}-${uuid}] already exists in the storage.`);
        }
        this._entities.set(uuid, entity);
    }

    /**
     * @description
     * Удаляет сущность из хранилища по её UUID.
     *
     * @param uuid UUID сущности для удаления.
     * @returns Удаленная сущность или undefined, если сущность не найдена.
     */
    public removeEntity(uuid: string): IEntity | undefined {
        const removed = this._entities.get(uuid);
        if (!removed) return;

        this._entities.delete(uuid);
        return removed;
    }

    /**
     * @description
     * Получает сущность из хранилища по её UUID.
     *
     * @param uuid UUID искомой сущности.
     * @returns Найденная сущность или undefined, если сущность не найдена.
     */
    public getEntity(uuid: string): IEntity | undefined {
        return this._entities.get(uuid);
    }

    /**
     * @description
     * Возвращает массив всех сущностей в хранилище.
     *
     * @returns Массив всех сущностей.
     */
    public getAllEntities(): IEntity[] {
        return Array.from(this._entities.values());
    }

    /**
     * @description
     * Возвращает массив всех активных сущностей (entity.active === true).
     *
     * @returns Массив активных сущностей.
     */
    public getActiveEntities(): IEntity[] {
        return Array.from(this._entities.values()).filter((e) => e.active);
    }

    /**
     * @description
     * Возвращает массив всех неактивных сущностей (entity.active === false).
     *
     * @returns Массив неактивных сущностей.
     */
    public getInactiveEntities(): IEntity[] {
        return Array.from(this._entities.values()).filter((e) => !e.active);
    }

    /**
     * @description
     * Фильтрует сущности по заданным критериям компонентов.
     * Использует ComponentsRaritySorter для оптимизации порядка проверки компонентов.
     *
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @param withDisabled Если true, фильтрует все сущности, включая неактивные. По умолчанию false.
     * @returns Объект Filtered с отфильтрованными сущностями.
     */
    public filter(filter: ComponentFilter, withDisabled?: boolean): Filtered {
        let allEntities = withDisabled
            ? this.getAllEntities()
            : this.getActiveEntities();
    
        if (!filter.excludes) filter.excludes = [];
    
        if (filter?.includes.length || filter?.excludes.length) {
            const sortedIncludes = ComponentsRaritySorter.sortByRarity(filter.includes);
            const sortedExcludes = filter.excludes.length
                ? ComponentsRaritySorter.sortByRarity(filter.excludes)
                : undefined;
    
            const filterFunction = compileFilter(sortedIncludes, sortedExcludes);
            allEntities = allEntities.filter(filterFunction);
        }
    
        return new Filtered(allEntities);
    }

}
