import { ISystem, SystemType } from '@logic/system';
import { ISystemsContainer } from './models';

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
export class SystemsContainer implements ISystemsContainer {
    private _cache: Map<SystemType<any, any>, ISystem<any>> = new Map();

    /**
     * @description
     * Получает инстанс Системы из кэша или создает новый.
     * Если Система уже существует, возвращает её из кэша.
     * Если нет - создает новый инстанс и кэширует его.
     * 
     * @param ctor Класс Системы.
     * @returns Инстанс Системы.
     */
    public get(ctor: SystemType<any, any>): ISystem<any> {
        let item = this._cache.get(ctor);
        if (!item) {
            item = new ctor() as ISystem<any>;
            this._cache.set(ctor, item);
        }

        return item;
    }
}
