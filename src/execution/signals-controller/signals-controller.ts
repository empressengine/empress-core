import { ExecutionController } from "@execution/execution-queue";
import { GroupType } from "@containers/system-group";
import { Disposable, ISignal } from "@shared/signal";
import { ISignalConfig } from "./models";

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

    private _pairs: Map<ISignal<any>, GroupType<any>[]> = new Map();
    private _disposables: Disposable[] = [];
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
            pair.push(...config.groups);
            this._pairs.set(config.signal, pair);
        }
    }

    /**
     * @description
     * Активирует подписки на все настроенные Signal.
     * При срабатывании Signal запускает связанные Группы в ExecutionController.
     */
    public subscribe(): void {
        const signals = Array.from(this._pairs.keys());
        const groups = Array.from(this._pairs.values());

        for(let i = 0; i < signals.length; i++) {
            const signal = signals[i];
            const group = groups[i];

            const disposable = signal.subscribe((data) => {
                const executionId = this._executionController.create(group, data, signal.name);
                this._executionController.run(executionId);
                this._executionIds.push(executionId);
            });
            
            this._disposables.push(disposable);
        }
    }

    /**
     * @description
     * Отключает все подписки на Signal и останавливает выполнение Групп.
     * Используется при остановке или перезапуске приложения.
     */
    public unsubscribe(): void {
        this._disposables.forEach((d) => d.dispose());
        this._disposables.length = 0;
        this._executionIds.forEach((id) => this._executionController.stop(id));
        this._executionIds.length = 0;
    }
}
