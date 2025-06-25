import { ExecutionController } from "@execution/execution-queue";
import { Disposable, ISignal } from "@shared/signal";
import { IGroupWithId, ISignalConfig } from "./models";
import { SignalChain } from "./signal-chain";
import { Utils } from "@shared/utils";

/**
 * @description
 * Контроллер для связывания Signal и Групп Систем.
 * При срабатывании Signal запускает связанные с ним Группы в ExecutionController.
 * 
 * Особенности:
 * - Поддерживает привязку нескольких Групп к одному Signal
 * - Автоматически управляет подписками на Signal
 * - Отслеживает и останавливает выполнение Групп
 * 
 * @example
 * ```typescript
 * // Создание и настройка
 * const controller = new SignalsController(executionController);
 * 
 * // Настройка связей
 * controller.setup([
 *   { 
 *     signal: moveSignal, 
 *     groups: [MovementGroup, CollisionGroup]
 *   },
 *   {
 *     signal: attackSignal,
 *     groups: [CombatGroup]
 *   }
 * ]);
 * 
 * // Активация подписок
 * controller.subscribe();
 * ```
 */
export class SignalsController {

    private _pairs: Map<ISignal<any>, IGroupWithId[]> = new Map();
    private _disposables: Map<ISignal<any>, Disposable> = new Map();
    private _executionIds: string[] = [];

    constructor(
        private _executionController: ExecutionController,
    ) {}

    /**
     * @description
     * Настраивает связи между Signal и Группами Систем.
     * Можно привязать несколько Групп к одному Signal.
     * 
     * @param configs Массив конфигураций связей Signal-Группа.
     */
    public setup(configs: ISignalConfig[]): void {
        for(let config of configs) {
            const pair = this._pairs.get(config.signal) || [];
            const groups = config.groups.map((group) => ({ id: Utils.uuid(), group }));

            pair.push(...groups);
            this._pairs.set(config.signal, pair);
        }
    }

    /**
     * @description
     * Активирует подписки на все настроенные Signal.
     * При срабатывании Signal запускает связанные Группы в ExecutionController.
     */
    public subscribe(): void {
        // Отписываемся от всех сигналов перед новой подпиской
        this.unsubscribe();
        
        // Подписываемся на каждый сигнал
        for (const signal of this._pairs.keys()) {
            this._subscribeSignal(signal);
        }
    }

    /**
     * @description
     * Отключает все подписки на Signal и останавливает выполнение Групп.
     * Используется при остановке или перезапуске приложения.
     */
    public unsubscribe(): void {
        this._disposables.forEach((d) => d.dispose());
        this._disposables.clear()
        this._executionIds.forEach((id) => this._executionController.stop(id));
        this._executionIds.length = 0;
    }

    /**
     * @description
     * Настраивает связь между сигналом и группами систем
     * @param signal Сигнал
     * @param configurator Функция конфигурации
     */
    public configure(signal: ISignal<any>, configuratorFn: (configurator: SignalChain) => void): void {
        if (this._disposables.has(signal)) {
            this._disposables.get(signal)?.dispose();
            this._disposables.delete(signal);
        }
        
        const existingGroups = this._pairs.get(signal) || [];
        const chain = new SignalChain(existingGroups);
        
        configuratorFn(chain);
        this._pairs.set(signal, chain.providers);
        this._subscribeSignal(signal);
    }

    private _subscribeSignal(signal: ISignal<any>): void {
        const groupsWithId = this._pairs.get(signal) || [];
        const groups = groupsWithId.map(g => g.group);
        
        const disposable = signal.subscribe((data) => {
            const executionId = this._executionController.create(groups, data, signal.name);
            this._executionController.run(executionId);
            this._executionIds.push(executionId);
        });
        
        this._disposables.set(signal, disposable);
    }
}
