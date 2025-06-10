import { ISystem } from './interfaces';

/**
 * @description
 * Тип конструктора системы.
 * Используется для создания и кэширования систем в SystemsContainer.
 *
 * @template TClass Тип системы, наследующий ISystem
 * @template TData Тип дополнительных данных системы
 */
export type SystemType<TClass extends ISystem<TData>, TData> = new (...args: any[]) => TClass;
