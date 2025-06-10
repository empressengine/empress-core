import { Utils } from '@shared/utils';
import { Disposable, ISignal } from './models';

/**
 * @description
 * Сигнал — это способ коммуникации между разными частями приложения.
 * Поддерживает как синхронные, так и асинхронные слушатели,
 * гарантируя завершение всех асинхронных операций
 * перед тем, как Promise от dispatch будет разрешён.
 *
 * @example Базовое использование
 * ```ts
 * import { Signal } from '@initiator/signal';
 *
 * // Создаём новый сигнал
 * const mySignal = new Signal<string>();
 *
 * // Подписываемся синхронно
 * mySignal.subscribe((data) => console.log('Sync received:', data));
 *
 * // Подписываемся асинхронно
 * mySignal.subscribe(async (data) => {
 *     await someAsyncOperation(data);
 *     console.log('Async completed:', data);
 * });
 *
 * // Диспатчим и ждём всех слушателей
 * await mySignal.dispatch('Hello world!');
 * console.log('Все слушатели завершены!');
 * ```
 *
 * @example Одноразовая подписка
 * ```ts
 * // Подписаться только на первый вызов
 * mySignal.once(async (data) => {
 *     await processDataOnce(data);
 * });
 * ```
 *
 * @example Очистка подписки
 * ```ts
 * // Использование Disposable для отписки
 * const disposable = mySignal.subscribe(async (data) => {
 *     await handleData(data);
 * });
 *
 * // Позже: отписываемся
 * disposable.dispose();
 * ```
 */
export class Signal<T> implements ISignal<T> {
    private listeners: Array<{
        callback: (data: T) => void | Promise<void>;
        once: boolean;
    }> = [];

    /**
     * @description
     * Имя сигнала. Необязательное поле, используется для отладки.
     */
    public get name(): string | undefined {
        return this._name;
    }

    /**
     * @description
     * Уникальный идентификатор сигнала.
     */
    public get uuid(): string {
        return this._uuid;
    }

    private _uuid: string = Utils.uuid();

    /**
     * @description
     * Создаёт новый сигнал.
     * @param name - Имя сигнала. Необязательное поле, используется для отладки.
     */
    constructor(private _name: string = 'Signal') {}

    /**
     * @description Подписывается на сигнал.
     * @param callback - Функция, которая будет вызвана при отправке сигнала.
     * @returns - Объект, который можно использовать для отписки от сигнала.
     */
    public subscribe(callback: (data: T) => void | Promise<void>): Disposable {
        this.listeners.push({ callback, once: false });

        return {
            dispose: () => {
                this.unsubscribe(callback);
            },
        };
    }

    /**
     * @description Подписывается на сигнал только один раз.
     * @param callback - Функция, которая будет вызвана при отправке сигнала.
     * @returns - Объект, который можно использовать для отписки от сигнала.
     */
    public once(callback: (data: T) => void | Promise<void>): Disposable {
        this.listeners.push({ callback, once: true });

        return {
            dispose: () => {
                this.unsubscribe(callback);
            },
        };
    }

    /**
     * @description Отписывается от сигнала.
     * @param callback - Функция, которая была подключена к сигналу.
     */
    public unsubscribe(callback: (data: T) => void | Promise<void>): void {
        this.listeners = this.listeners.filter((listener) => listener.callback !== callback);
    }

    /**
     * @description Отправляет сигнал.
     * @param data - Данные, которые будут переданы в функции обратного вызова.
     */
    public async dispatch(data: T): Promise<void> {
        const onceListeners: Array<(data: T) => void | Promise<void>> = [];
        const promises: Promise<void>[] = [];

        for (const listener of this.listeners) {
            const result = listener.callback(data);
            if (result instanceof Promise) {
                promises.push(result);
            }

            if (listener.once) {
                onceListeners.push(listener.callback);
            }
        }

        await Promise.all(promises);

        if (onceListeners.length > 0) {
            this.listeners = this.listeners.filter((l) => !onceListeners.includes(l.callback));
        }
    }
}
