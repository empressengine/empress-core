import { ISystemsContainer } from "@containers/systems-container";
import { EntityStorage } from "@data/entity-storage";
import { GroupType } from "@containers/system-group";
import { IQueueItem } from "./models";
import { ServiceContainer } from "@containers/services-container";
import { GroupsContainer } from "@containers/groups-container";
import { ISystem } from "@logic/system";

/**
 * @description
 * Очередь выполнения управляет последовательным выполнением групп систем и их систем.
 * Предоставляет контроль над потоком выполнения с такими функциями как пауза, возобновление и остановка.
 * Каждая система в очереди выполняется по порядку, с поддержкой асинхронных операций.
 *
 * Основные возможности:
 * - Последовательное выполнение систем
 * - Поддержка async/await
 * - Управление выполнением (пауза/возобновление/остановка)
 * - Внедрение зависимостей в системы
 * - Фильтрация выполнения
 * - Именованные очереди для отладки
 * 
 * @example Простое использование
 * ```typescript
 * // Создание очереди выполнения
 * const queue = new ExecutionQueue(
 *     Utils.uuid(),
 *     systemsContainer,
 *     entityStorage,
 *     'animation-queue'
 * );
 *
 * // Настройка очереди с системами
 * queue.setup([AnimationGroup], gameState);
 *
 * // Запуск при готовности
 * await queue.execute();
 * ```
 *
 * @example Управление потоком
 * ```typescript
 * const queue = new ExecutionQueue(id, container, storage, 'physics-queue');
 * 
 * // Настройка систем
 * queue.setup([PhysicsGroup], data);
 *
 * // Запуск выполнения
 * const execution = queue.execute();
 *
 * // Управление выполнением
 * queue.pause();
 * queue.resume();
 * queue.stop();
 *
 * // Ожидание завершения
 * await execution;
 * 
 * // Информация об очереди
 * console.log(`Очередь ${queue.name} (${queue.id}) завершена`);
 * ```
 */
export class ExecutionQueue {

    /**
     * @description Уникальный идентификатор очереди выполнения.
     */
    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    private _queue: IQueueItem[] = [];
    private _currentSystem: ISystem<any> | null = null;
    private _isPaused: boolean = false;
    private _resumePromise: Promise<void> | null = null;
    private _resolveResume: (() => void) | null = null;
    private _abortController: AbortController | null = null;
    
    constructor(
        private _id: string,
        private _systemsContainer: ISystemsContainer,
        private _groupsContainer: GroupsContainer,
        private _entityStorage: EntityStorage,
        private _name: string
    ) {}

    /**
     * @description
     * Настраивает очередь для выполнения Групп Систем.
     * Создает инстансы Групп и подготавливает Системы к выполнению.
     * 
     * @param groups Массив конструкторов Групп.
     * @param data Данные для передачи в Группы.
     */
    public setup<T>(groups: GroupType<T>[], data: T): void {
        this._queue = this.getExecutionQueue(groups, data);
    }

    public async execute(asyncAlowed: boolean = true): Promise<void> {
        this._abortController = new AbortController();
        
        try {
            while (this._queue.length > 0) {
                if (this._isPaused) await this.waitForResume();
                if (this._abortController.signal.aborted) break;

                const item = this._queue.shift();
                if (item) {
                    const canExecute = item.canExecute();

                    if (canExecute) {
                        const filter = { includes: item.includes, excludes: item.excludes };
                        item.system.setContext(item.groupId, item.executionId, this._entityStorage);
                        
                        ServiceContainer.instance.getDependencyForSystem(item.groupId, item.system);
                        this._currentSystem = item.system;
                        const returnType = item.system.run(item.data, filter, item.withDisabled);

                        if (returnType instanceof Promise) {
                            if(asyncAlowed) {
                                await Promise.race([
                                    returnType,
                                    new Promise((_, reject) => {
                                        this._abortController!.signal.addEventListener('abort', () => {
                                            reject(new Error('Queue execution was stopped'));
                                        });
                                    })
                                ]);
                            }
                            else throw new Error(`Execution of asynchronous system '${item.system.constructor.name}' in queue '${this.name}' is prohibited!`)
                        }

                        this._currentSystem = null;
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Queue execution was stopped') {
                return;
            }
            throw error;
        }
    }

    /**
     * @description Останавливает все группы.
     */
    public stop(): void {
        this._queue = [];
        this._currentSystem?.forceStop();
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
    }

    /**
     * @description Ставит все группы на паузу.
     */
    public pause(): void {
        if (!this._isPaused) {
            this._isPaused = true;
        }
    }

    /**
     * @description Возобновляет выполнение всех групп.
     */
    public resume(): void {
        if (this._isPaused) {
            this._isPaused = false;
            if (this._resolveResume) {
                this._resolveResume();
                this._resolveResume = null;
                this._resumePromise = null;
            }
        }
    }

    /**
     * @description
     * Создает Promise для ожидания возобновления очереди.
     * Используется при постановке на паузу.
     * 
     * @returns Promise, который разрешится при возобновлении.
     */
    private waitForResume(): Promise<void> {
        if (!this._resumePromise) {
            this._resumePromise = new Promise<void>((resolve) => {
                this._resolveResume = resolve;
            });
        }
        return this._resumePromise;
    }

    /**
     * @description
     * Создает очередь выполнения из Групп Систем.
     * Создает инстансы Групп, получает Системы из кэша.
     * 
     * @param ctors Массив конструкторов Групп.
     * @param data Данные для передачи в Группы.
     * @returns Массив элементов очереди для выполнения.
     */
    private getExecutionQueue<T>(ctors: GroupType<T>[], data: T): IQueueItem[] {
        const groups = ctors.map(group => {
            const instance = this._groupsContainer.get(group);
            return instance;
        });

        const queue: IQueueItem[] = [];

        groups.forEach((group) => {
            const sorted = group.sorted(data);
            const groupId = group.uuid;

            sorted.forEach((provider) => {
                const system = this._systemsContainer.get(provider.instance.system);

                for (let i = 0; i < provider.repeat; i++) {
                    queue.push({
                        ...provider,
                        groupId,
                        data: provider.instance.data,
                        executionId: this._id,
                        system,
                    });
                }
            });
        });
        
        return queue;
    }
}