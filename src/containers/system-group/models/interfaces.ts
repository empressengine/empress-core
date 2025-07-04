import { ComponentType } from '@data/component';
import { ISystem, SystemType } from '@logic/system';
import { SystemChain } from '../system-chain';

export interface ISystemOptions {
    id: string;
    withDisabled: boolean;
    includes: ComponentType<any>[];
    excludes: ComponentType<any>[];
    repeat: number;
    canExecute: () => boolean;
}

export interface ISystemExternalData {
    data: any;
}

export interface ISystemProvider extends ISystemExternalData {
    system: SystemType<any, any>;
}

export interface ISystemInstance extends ISystemExternalData, ISystemOptions {
    system: ISystem<any>;
    groupId: string;
}

export interface IGroupOption extends Partial<ISystemOptions> {
    instance?: ISystemProvider;
}

export interface IGroupSortedOption extends ISystemOptions {
    order: number;
    instance: ISystemProvider;
}

/**
 * @description
 * Интерфейс для реализации групп Систем в ECS фреймворке.
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
export interface ISystemGroup<T = any> {
    /**
     * @description
     * Уникальный идентификатор группы.
     */
    uuid: string;

    /**
     * @description
     * Экземпляр SystemChain для настройки порядка выполнения Систем.
     */
    chain: SystemChain;

    /**
     * @description
     * Регистрирует зависимости группы в ServiceContainer.
     * Зависимости группы переопределяют глобальные зависимости из EmpressCore.
     */
    registerGroupDependencies(): void;

    /**
     * @description
     * Определяет порядок и настройки выполнения Систем в группе.
     * Этот метод вызывается при каждом срабатывании Signal.
     * 
     * @param data Данные, полученные от Signal.
     */
    setup(chain: SystemChain, data: T): void;

    /**
     * @description
     * Сортирует и подготавливает опции Систем для выполнения.
     * Устанавливает значения по умолчанию и сортирует по порядку.
     * 
     * @param data Данные от Signal.
     * @returns Отсортированный массив опций Систем.
     */
    sorted(data: T): IGroupSortedOption[];
}
