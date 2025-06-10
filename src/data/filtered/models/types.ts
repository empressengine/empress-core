import { IEntity } from '@data/entity';

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
export type EntityIterationCallback = (entity: IEntity, index?: number) => void | Promise<void>;
