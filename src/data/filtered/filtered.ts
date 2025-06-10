import { IEntity } from '@data/entity';
import { EntityIterationCallback } from './models';

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
export class Filtered {
    /**
     * @description
     * Возвращает общее количество сущностей в коллекции.
     * @returns Количество сущностей.
     */
    public get count(): number {
        return this._entities.length;
    }

    /**
     * @description
     * Возвращает массив всех отфильтрованных сущностей.
     * @returns Массив сущностей.
     */
    public get items(): IEntity[] {
        return this._entities;
    }

    constructor(private _entities: IEntity[] = []) {}

    /**
     * @description
     * Синхронно перебирает все сущности и вызывает для каждой коллбэк-функцию.
     * Передает в коллбэк сущность и её индекс в массиве.
     *
     * @param callback Коллбэк-функция, которая будет вызвана для каждой сущности.
     */
    public forEach(callback: EntityIterationCallback): void {
        for (let i = 0; i < this._entities.length; i++) {
            callback(this._entities[i], i);
        }
    }

    /**
     * @description
     * Асинхронно перебирает все сущности последовательно.
     * Каждая следующая сущность обрабатывается только после завершения обработки предыдущей.
     *
     * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
     * @returns Promise, который разрешится после завершения всех итераций.
     */
    public async sequential(callback: EntityIterationCallback): Promise<void> {
        let index = 0;
        for (const entity of this._entities) {
            await callback(entity, index);
            index += 1;
        }
    }

    /**
     * @description
     * Асинхронно перебирает все сущности параллельно.
     * Все сущности обрабатываются одновременно, не дожидаясь завершения обработки предыдущих.
     *
     * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
     * @returns Promise, который разрешится после завершения всех итераций.
     */
    public async parallel(callback: EntityIterationCallback): Promise<void> {
        const promises = this._entities.map(callback);
        await Promise.all(promises);
    }
}
