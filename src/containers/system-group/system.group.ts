import { Utils } from '@shared/utils';
import { IGroupOption, ISystemGroup, ISystemProvider, SystemData, IGroupSortedOption } from './models';
import { SystemType } from '@logic/system';
import { Provider, ServiceContainer } from '@containers/services-container';

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
 *     public setup(data: MyData): IGroupOption[] {
 *         return [
 *             // Простая регистрация Системы
 *             {
 *                 instance: this.provide(FirstSystem),
 *             },
 *             // Регистрация с передачей данных
 *             {
 *                 instance: this.provide(SecondSystem, data),
 *             },
 *             // Расширение фильтра Системы
 *             {
 *                 instance: this.provide(ThirdSystem),
 *                 includes: [AdditionalComponent]
 *             },
 *             // Повторное и условное выполнение
 *             {
 *                 instance: this.provide(FourthSystem),
 *                 repeat: 3,
 *                 canExecute: (data) => data.someCondition
 *             },
 *         ];
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

    private _uuid: string = Utils.uuid();

    /**
     * @description
     * Определяет порядок и настройки выполнения Систем в группе.
     * Этот метод вызывается при каждом срабатывании Signal.
     * 
     * @param data Данные, полученные от Signal.
     * @returns Массив опций для настройки Систем.
     */
    public abstract setup(data: T): IGroupOption[];

    /**
     * @description
     * Сортирует и подготавливает опции Систем для выполнения.
     * Устанавливает значения по умолчанию и сортирует по порядку.
     * 
     * @param data Данные от Signal.
     * @returns Отсортированный массив опций Систем.
     */
    public sorted(data: T): IGroupSortedOption[] {
        const providers = this.setup(data);
        const orderStep = 10000;

        providers.forEach((provider, index) => {
            if (provider.withDisabled === undefined) provider.withDisabled = false;
            if (provider.includes === undefined) provider.includes = [];
            if (provider.excludes === undefined) provider.excludes = [];
            if (!provider.repeat) provider.repeat = 1;
            if (!provider.canExecute) provider.canExecute = () => true;
            if (provider.order === undefined) provider.order = (index + 1) * orderStep;
        });

        return providers.sort((a, b) => (a.order || 0) - (b.order || 0)) as IGroupSortedOption[];
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

    /**
     * @description
     * Создает провайдер для Системы.
     * Используется в методе setup для регистрации Систем.
     * 
     * @param system Класс Системы.
     * @param data Данные для передачи в Систему.
     * @returns Провайдер для Системы.
     */
    public provide<T extends SystemType<any, any>>(
        system: T,
        data: SystemData<InstanceType<T>>,
    ): ISystemProvider {
        return {
            system,
            data,
        };
    }

    protected setupDependencies(): Provider[] {
        return [];
    }
}
