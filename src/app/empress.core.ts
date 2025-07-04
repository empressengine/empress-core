import { Provider, ServiceContainer } from "@containers/services-container";
import { SystemsContainer } from "@containers/systems-container";
import { GroupsContainer } from "@containers/groups-container";
import { EntityStorage } from "@data/entity-storage";
import { ExecutionController } from "@execution/execution-queue";
import { ISignalConfig, SignalChain, SignalsController } from "@execution/signals-controller";
import { TimerController } from "@shared/timer";
import { LifeCycle } from "@flow/lifecycle";
import { ISignal } from "@shared/signal";

/**
 * @description
 * Точка входа в приложение. Отвечает за инициализацию и настройку всех модулей.
 * Предоставляет методы для управления жизненным циклом приложения.
 *
 * @example Инициализация приложения
 * ```typescript
 * const empress = new EmpressCore();
 *
 * // Инициализация модулей
 * empress.init();
 *
 * // Подписка на сигналы
 * // Конфигурация сигналов
 * const baseSignals = [
 *   {
 *     signal: OnUpdateSignal,
 *     groups: [UpdateGroup]
 *   }
 * ];
 * 
 * // Регистрация сигналов
 * empress.listenSignals(baseSignals);
 * 
 * // Подписка на сигналы
 * empress.subscribe();
 *
 * // Запуск приложения
 * empress.start();
 * ```
 */
export class EmpressCore {

    /**
     * @description
     * Инициализирует все модули приложения.
     * Создает и регистрирует все необходимые сервисы.
     */
    public init(): void {
        this.registerServices();

        const lifecycle = ServiceContainer.instance.get(LifeCycle);
        const timerController = ServiceContainer.instance.get(TimerController);

        lifecycle.addUpdateCallback((deltaTime) => {
            timerController.update(deltaTime);
        });
    }

    /**
     * @description
     * Запускает приложение, инициируя жизненный цикл.
     */
    public start(): void {
        const lifecycle = ServiceContainer.instance.get(LifeCycle);
        lifecycle.start();
    }

    /**
     * @description
     * Устанавливает связи между сигналами и группами систем.
     * @param configs Конфигурации связей между сигналами и группами
     */
    public listenSignals(configs: ISignalConfig[]): void {
        const signalsController = ServiceContainer.instance.get(SignalsController);
        signalsController.setup(configs);
    }

    /**
     * @description
     * Более тонкая настрйока связей между Signal и Группами Систем.
     * ПОзволяет переопределять существующие связи.
     * 
     * @param signal Signal для настройки
     * @param configuratorFn Функция настройки связей Signal-Группа
     */
    public configureSignal(signal: ISignal<any>, configuratorFn: (configurator: SignalChain) => void): void {
        const signalsController = ServiceContainer.instance.get(SignalsController);
        signalsController.configure(signal, configuratorFn);
    }

    /**
     * @description
     * Активирует подписки на все настроенные Signal.
     * При срабатывании Signal запускает связанные Группы в ExecutionController.
     */
    public subscribe(): void {
        const signalsController = ServiceContainer.instance.get(SignalsController);
        signalsController.subscribe();
    }

    /**
     * @description
     * Регистрирует глобальные сервисы в контейнере зависимостей.
     * @param providers Массив провайдеров сервисов
     */
    public registerGlobalServices(providers: Provider[]): void {
        ServiceContainer.instance.registerGlobal(providers);
    }

    /**
     * @description
     * Создает и регистрирует основные сервисы приложения:
     * - EntityStorage для хранения сущностей
     * - SystemsContainer для кэширования систем
     * - LifeCycle для управления жизненным циклом
     * - TimerController для управления таймерами
     * - ExecutionController для управления выполнением систем
     * - SignalsController для управления сигналами
     */
    protected registerServices(): void {
        const entityStorage = new EntityStorage();
        const systemsContainer = new SystemsContainer();
        const groupsContainer = new GroupsContainer();
        const lifecycle = new LifeCycle();
        const timerController = new TimerController();
        const executionController = new ExecutionController(systemsContainer, groupsContainer, entityStorage);
        const signalController = new SignalsController(executionController);

        this.registerGlobalServices([
            { provide: EntityStorage, useFactory: () => entityStorage }, 
            { provide: SystemsContainer, useFactory: () => systemsContainer },
            { provide: GroupsContainer, useFactory: () => groupsContainer },
            { provide: LifeCycle, useFactory: () => lifecycle },
            { provide: TimerController, useFactory: () => timerController },
            { provide: ExecutionController, useFactory: () => executionController },
            { provide: SignalsController, useFactory: () => signalController },
        ]);
    }
}