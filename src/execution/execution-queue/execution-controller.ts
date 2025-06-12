import { ISystemsContainer } from "@containers/systems-container";
import { EntityStorage } from "@data/entity-storage";
import { GroupType } from "@containers/system-group";
import { GroupsContainer } from "@containers/groups-container";
import { ExecutionQueue } from "./execution-queue";
import { Utils } from "@shared/utils";

/**
 * @description
 * Контроллер для управления несколькими очередями выполнения.
 * Предоставляет централизованное управление выполнением групп систем с возможностью
 * управления отдельными очередями или массовыми операциями.
 *
 * @example Простое использование
 * ```typescript
 * const controller = new ExecutionController(systemsContainer, entityStorage);
 *
 * // Создание очередей для разных подсистем
 * const animationQueueId = controller.create([AnimationGroup], gameState, 'animation');
 * const physicsQueueId = controller.create([PhysicsGroup], gameState, 'physics');
 * 
 * // Запуск очередей
 * await controller.run(animationQueueId);
 * await controller.run(physicsQueueId);
 * ```
 *
 * @example Расширенное управление
 * ```typescript
 * // Создание нескольких очередей
 * const queues = [
 *   controller.create([AIGroup], gameState, 'ai'),
 *   controller.create([PhysicsGroup], gameState, 'physics'),
 *   controller.create([AnimationGroup], gameState, 'animation')
 * ];
 *
 * // Проверка статуса очередей
 * console.log('Активные очереди:', controller.activeQueues);
 * console.log('Всего очередей:', controller.queueSize);
 *
 * // Управление отдельными очередями
 * controller.pause(queues[1]); // пауза физики
 * if (controller.hasQueue(queues[1])) {
 *   const status = controller.getQueueStatus(queues[1]);
 *   console.log('Физика на паузе:', status?.isPaused);
 * }
 *
 * // Массовые операции
 * controller.pauseAll();
 * controller.resumeAll();
 * controller.stopAll();
 * ```
 */
export class ExecutionController {

    private _queues: Map<string, ExecutionQueue> = new Map();

    /**
     * @description Получает массив ID активных очередей
     * @returns Массив ID очередей, которые в данный момент выполняются
     */
    public get activeQueues(): string[] {
        return Array.from(this._queues.keys());
    }

    /**
     * @description Получает текущее количество активных очередей
     */
    public get queueSize(): number {
        return this._queues.size;
    }

    constructor(
        private _systemsContainer: ISystemsContainer,
        private _groupsContainer: GroupsContainer,
        private _entityStorage: EntityStorage
    ) {}

    /**
     * @description Creates and sets up a new execution queue.
     * The queue is created, configured with systems, but not started.
     * Use this when you need to prepare queues before execution or need fine-grained control.
     * 
     * @example
     * ```typescript
     * // Create named queues for better debugging
     * const physicsQueueId = controller.create([PhysicsGroup], gameState, 'physics');
     * const renderQueueId = controller.create([RenderGroup], gameState, 'render');
     * 
     * // Later start them in specific order
     * await controller.run(physicsQueueId);
     * await controller.run(renderQueueId);
     * ```
     * 
     * @param groups Array of system group constructors to be executed by this queue
     * @param data Data to be passed to the systems
     * @param name Optional name for the queue, useful for debugging. Defaults to 'unnamed'
     * @returns ID of the created queue, can be used for further queue management
     */
    public create<T>(groups: GroupType<T>[], data: T, name: string = 'unnamed'): string {
        const queue = new ExecutionQueue(
            Utils.uuid(), 
            this._systemsContainer, 
            this._groupsContainer, 
            this._entityStorage, 
            name
        );

        queue.setup(groups, data);
        this._queues.set(queue.id, queue);
        return queue.id;
    }

    /**
     * @description Executes a previously created queue identified by its ID.
     * The queue must have been created using the create() method.
     * After execution completes, the queue is automatically removed.
     * 
     * @example
     * ```typescript
     * // Create and run a queue
     * const queueId = controller.create([LoadingGroup], gameState, 'loader');
     * await controller.run(queueId);
     * 
     * // Queue is automatically removed after completion
     * console.log(controller.hasQueue(queueId)); // false
     * ```
     * 
     * @param queueId ID of the queue to execute, obtained from create()
     * @throws Error if queue with provided ID is not found
     * @returns Promise that resolves when all systems have finished executing
     */
    public async run(queueId: string, asyncAlowed: boolean = true): Promise<void> {
        const queue = this._queues.get(queueId);
        if (!queue) {
            throw new Error(`Queue with id ${queueId} not found`);
        }

        await queue.execute(asyncAlowed);
        this._queues.delete(queue.id);
    }

    /**
     * @description Останавливает выполнение очереди и удаляет её.
     * Текущая Система будет принудительно остановлена.
     * 
     * @param executionId ID очереди для остановки
     */
    public stop(executionId: string): void {
        const queue = this._queues.get(executionId);
        if (queue) {
            queue.stop();
            this._queues.delete(executionId);
        }
    }

    /**
     * @description Ставит очередь на паузу.
     * Выполнение приостановится после завершения текущей Системы.
     * 
     * @param executionId ID очереди для паузы
     */
    public pause(executionId: string): void {
        const queue = this._queues.get(executionId);
        if (queue) {
            queue.pause();
        }
    }

    /**
     * @description Возобновляет выполнение приостановленной очереди.
     * 
     * @param executionId ID очереди для возобновления
     */
    public resume(executionId: string): void {
        const queue = this._queues.get(executionId);
        if (queue) {
            queue.resume();
        }
    }

    /**
     * @description Останавливает и удаляет все очереди.
     * Все текущие Системы будут принудительно остановлены.
     */
    public stopAll(): void {
        this._queues.forEach((queue) => {
            queue.stop();
        });
        this._queues.clear();
    }

    /**
     * @description Ставит все очереди на паузу.
     * Каждая очередь приостановится после завершения текущей Системы.
     */
    public pauseAll(): void {
        this._queues.forEach((queue) => {
            queue.pause();
        });
    }

    /**
     * @description Возобновляет выполнение всех приостановленных очередей.
     */
    public resumeAll(): void {
        this._queues.forEach((queue) => {
            queue.resume();
        });
    }

    /**
     * @description Проверяет наличие очереди с указанным ID
     * @param executionId ID очереди для проверки
     */
    public hasQueue(executionId: string): boolean {
        return this._queues.has(executionId);
    }

    /**
     * @description Получает статус конкретной очереди
     * @param executionId ID очереди для проверки
     * @returns Объект статуса очереди или null, если очередь не найдена
     */
    public getQueueStatus(executionId: string): { isPaused: boolean } | null {
        const queue = this._queues.get(executionId);
        return queue ? { isPaused: queue['_isPaused'] } : null;
    }
}