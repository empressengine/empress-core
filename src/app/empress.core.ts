import { Provider, ServiceContainer } from "@containers/services-container";
import { SystemsContainer } from "@containers/systems-container";
import { EntityStorage } from "@data/entity-storage";
import { ExecutionController } from "@execution/execution-queue";
import { ISignalConfig, SignalsController } from "@execution/signals-controller";
import { TimerController } from "@shared/timer";
import { LifeCycle } from "@flow/lifecycle";

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
 * const baseSignals = [
 *   {
 *     signal: OnUpdateSignal,
 *     groups: [UpdateGroup]
 *   }
 * ];
 * empress.listen(baseSignals);
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
    public listen(configs: ISignalConfig[]): void {
        const signalsController = ServiceContainer.instance.get(SignalsController);
        signalsController.setup(configs);
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
        const lifecycle = new LifeCycle();
        const timerController = new TimerController();
        const executionController = new ExecutionController(systemsContainer, entityStorage);
        const signalController = new SignalsController(executionController);

        this.registerGlobalServices([
            { provide: EntityStorage, useFactory: () => entityStorage }, 
            { provide: SystemsContainer, useFactory: () => systemsContainer },
            { provide: LifeCycle, useFactory: () => lifecycle },
            { provide: TimerController, useFactory: () => timerController },
            { provide: ExecutionController, useFactory: () => executionController },
            { provide: SignalsController, useFactory: () => signalController },
        ]);
    }
}