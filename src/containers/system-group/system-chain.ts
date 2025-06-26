import { SystemType } from "@logic/system";
import { IGroupOption, ISystemOptions, SystemData } from "./models";
import { Utils } from "@shared/utils";

/**
 * @description
 * Класс для создания цепочки Систем.
 * 
 * @example
 * ```typescript
 * const chain = new SystemChain();
 * chain.add(SomeSystem, { id: 'SomeSystem' });
 * chain.add(SomeOtherSystem, { id: 'SomeOtherSystem' });
 * ```
 */
export class SystemChain {

    /**
     * @description
     * Получает массив опций Систем в группе.
     * 
     * @returns Массив опций Систем.
     */
    public get providers(): IGroupOption[] {
        return this._providers;
    }

    private _providers: IGroupOption[] = [];

    /**
     * @description
     * Добавляет Систему в конец группы.
     * 
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    public add<T extends SystemType<any, any>>(system: T, data?: SystemData<InstanceType<T>>, options: Partial<ISystemOptions> = {}): SystemChain {
        const id = options.id || Utils.uuid();
        const provider = {
            ...options,
            id,
            instance: { system, data }
        };

        this._providers.push(provider);
        return this;
    }

    /**
     * @description
     * Добавляет Систему в начало группы.
     * 
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    public prepend<T extends SystemType<any, any>>(
        system: T, 
        data?: SystemData<InstanceType<T>>,
        options: Partial<ISystemOptions> = {}
    ): SystemChain {
        const id = options.id || Utils.uuid();
        const provider = {
            ...options,
            id,
            instance: { system, data }
        };
        
        this._providers.unshift(provider);
        return this;
    }

    /**
     * @description
     * Вставляет Систему перед определенной Системой в группе.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    public insertBefore<T extends SystemType<any, any>>(
        targetId: string, 
        system: T, 
        data?: SystemData<InstanceType<T>>,
        options: Partial<ISystemOptions> = {}
    ): SystemChain {
        const index = this._providers.findIndex(opt => opt.id === targetId);

        if (index >= 0) {
            const id = options.id || Utils.uuid();
            const provider = {
                ...options,
                id,
                instance: { system, data }
            };

            this._providers.splice(index, 0, provider);
        }

        return this;
    }

    /**
     * @description
     * Вставляет Систему после определенной Системы в группе.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    public insertAfter<T extends SystemType<any, any>>(
        targetId: string, 
        system: T, 
        data?: SystemData<InstanceType<T>>,
        options: Partial<ISystemOptions> = {}
    ): SystemChain {
        const index = this._providers.findIndex(opt => opt.id === targetId);

        if (index >= 0) {
            const id = options.id || Utils.uuid();
            const provider = {
                ...options,
                id,
                instance: { system, data }
            };

            this._providers.splice(index + 1, 0, provider);
        }

        return this;
    }

    /**
     * @description
     * Заменяет определенную Систему в группе.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @param system Конструктор Системы.
     * @param data Данные для передачи в Систему.
     * @param options Опции для настройки Системы.
     * @returns Экземпляр SystemChain.
     */
    public replace<T extends SystemType<any, any>>(
        targetId: string, 
        system: T, 
        data?: SystemData<InstanceType<T>>,
        options: Partial<ISystemOptions> = {}
    ): SystemChain {
        const index = this._providers.findIndex(opt => opt.id === targetId);

        if (index >= 0) {
            const existingOption = Object.keys(options).length ? options : this._providers[index];
            const provider = {
                ...existingOption,
                instance: { system, data }
            };

            this._providers[index] = provider;
        }

        return this;
    }

    /**
     * @description
     * Удаляет определенную Систему из группы.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @returns Экземпляр SystemChain.
     */
    public remove(targetId: string): SystemChain {
        const index = this._providers.findIndex(opt => opt.id === targetId);
        if (index >= 0) this._providers.splice(index, 1);
        return this;
    }

    /**
     * @description
     * Получает определенную Систему из группы.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @returns Опция Системы или undefined.
     */
    public get(targetId: string): IGroupOption | undefined {
        return this._providers.find(opt => opt.id === targetId);
    }

    /**
     * @description
     * Проверяет наличие определенной Системы в группе.
     * 
     * @param targetId Идентификатор целевой Системы.
     * @returns true, если Система найдена, иначе false.
     */
    public has(targetId: string): boolean {
        return this._providers.some(opt => opt.id === targetId);
    }

    /**
     * @description
     * Возвращает количество Систем в группе.
     * 
     * @returns Количество Систем.
     */
    public count(): number {
        return this._providers.length;
    }

    /**
     * @description
     * Очищает массив провайдеров для повтороного переопределения
     */
    public clear(): void {
        this._providers.length = 0;
    }
}