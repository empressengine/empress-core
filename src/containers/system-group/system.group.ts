import { Utils } from '@shared/utils';
import { ISystemGroup, IGroupSortedOption } from './models';
import { Provider, ServiceContainer } from '@containers/services-container';
import { SystemChain } from './system-chain';

/**
 * @description
 * Абстрактный класс для группировки и управления порядком выполнения Систем.
 * 
 * Основные возможности:
 * - Управление порядком выполнения Систем
 * - Передача данных в Системы от Signal
 * - Переопределение зависимостей для Систем
 * 
 * Дополнительные функции:
 * - Расширение фильтров Систем
 * - Повторное выполнение Систем
 * - Условное выполнение Систем
 *
 * Зависимости:
 * - Группа может определять собственные зависимости
 * - Зависимости группы переопределяют глобальные зависимости из EmpressCore
 * - Системы могут получать зависимости через декоратор @Inject
 *
 * @example
 * ```typescript
 * class MyGroup extends SystemGroup<MyData> {
 *     // Настройка порядка выполнения Систем
 *     public setup(chain: SystemChain, data: MyData): void {
 *         chain
 *             // Простая регистрация Системы
 *             .add(FirstSystem)
 *             // Регистрация с передачей данных
 *             .add(SecondSystem, data)
 *             // Расширение фильтра Системы
 *             .add(ThirdSystem, null, { includes: [AdditionalComponent] })
 *             // Повторное и условное выполнение
 *             .add(FourthSystem, null, { repeat: 3, canExecute: (data) => data.someCondition });
 *     }
 *
 *     // Настройка зависимостей для Систем
 *     protected setupDependencies(): Provider[] {
 *         return [
 *             {
 *                 provide: AbstractService,
 *                 useClass: ConcreteService
 *             }
 *         ];
 *     }
 * }
 * ```
 */
export abstract class SystemGroup<T = any> implements ISystemGroup<T> {
    /**
     * @description
     * Уникальный идентификатор группы.
     */
    public get uuid(): string {
        return this._uuid;
    }

    /**
     * @description
     * Экземпляр SystemChain для настройки порядка выполнения Систем.
     */
    public get chain(): SystemChain {
        return this._chain;
    }

    private _uuid: string = Utils.uuid();
    private _chain: SystemChain = new SystemChain();

    /**
     * @description
     * Определяет порядок и настройки выполнения Систем в группе.
     * Этот метод вызывается при каждом срабатывании Signal.
     * 
     * @param data Данные, полученные от Signal.
     * @returns Массив опций для настройки Систем.
     */
    public abstract setup(chain: SystemChain, data: T): void;

    /**
     * @description
     * Сортирует и подготавливает опции Систем для выполнения.
     * Устанавливает значения по умолчанию и сортирует по порядку.
     * 
     * @param data Данные от Signal.
     * @returns Отсортированный массив опций Систем.
     */
    public sorted(data: T): IGroupSortedOption[] {
        this._chain.clear();
        this.setup(this._chain, data);
        const providers = this._chain.providers;

        providers.forEach((provider) => {
            if (provider.withDisabled === undefined) provider.withDisabled = false;
            if (provider.includes === undefined) provider.includes = [];
            if (provider.excludes === undefined) provider.excludes = [];
            if (!provider.repeat) provider.repeat = 1;
            if (!provider.canExecute) provider.canExecute = () => true;
        });

        return providers as IGroupSortedOption[];
    }

    /**
     * @description
     * Регистрирует зависимости группы в ServiceContainer.
     * Зависимости группы переопределяют глобальные зависимости из EmpressCore.
     */
    public registerGroupDependencies(): void {
        const providers = this.setupDependencies();
        ServiceContainer.instance.registerModule(this.uuid, providers);
    }

    protected setupDependencies(): Provider[] {
        return [];
    }
}