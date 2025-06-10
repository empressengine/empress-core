import { ComponentType } from '@data/component';
import { IEntity } from '@data/entity';

/**
 * @description
 * Тип функции-фильтра для проверки соответствия сущности критериям фильтрации.
 * @param entity Сущность для проверки.
 * @returns true, если сущность соответствует критериям, иначе false.
 */
type CompileFilterReturs = (entity: IEntity) => boolean;

/**
 * @description
 * Создает функцию-фильтр для проверки соответствия сущности критериям фильтрации.
 * Сущность соответствует критериям, если:
 * 1. Имеет все компоненты из includes
 * 2. Не имеет ни одного компонента из excludes (если они указаны)
 *
 * @param includes Массив конструкторов обязательных компонентов.
 * @param excludes Массив конструкторов исключаемых компонентов.
 * @returns Функция для проверки соответствия сущности критериям.
 *
 * @example
 * ```typescript
 * const filter = compileFilter(
 *   [PositionComponent, HealthComponent], // должны быть в сущности
 *   [DisabledComponent] // не должны присутствовать
 * );
 *
 * // Проверяем сущность
 * if (filter(entity)) {
 *   // Сущность прошла фильтр
 * }
 * ```
 */
export const compileFilter = (
    includes: ComponentType<any>[],
    excludes?: ComponentType<any>[],
): CompileFilterReturs => {
    return (entity: IEntity): boolean => {
        if (!entity.hasComponents(includes)) return false;

        if (excludes && entity.hasComponents(excludes)) return false;

        return true;
    };
};
