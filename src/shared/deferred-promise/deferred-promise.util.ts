/**
 * @description
 * Утилита для создания Promise, которым можно управлять вне его тела.
 * Позволяет разделить создание Promise и его разрешение/отклонение.
 *
 * @example Пример использования
 * ```typescript
 * const deferred = new DeferredPromise<string>();
 *
 * // Подписываемся на разрешение Promise
 * deferred.promise.then(result => console.log(result));
 *
 * // Где-то в другом месте разрешаем Promise
 * deferred.resolve('Готово!');
 * ```
 *
 * @example Работа с массивом Promise
 * ```typescript
 * const deferreds = [
 *   new DeferredPromise<number>(),
 *   new DeferredPromise<number>()
 * ];
 *
 * // Разрешаем все Promise одним значением
 * DeferredPromise.resolveAll(deferreds, 42);
 *
 * // Или ждём завершения всех
 * const results = await DeferredPromise.all(deferreds);
 * ```
 */
export class DeferredPromise<T> {

    /**
     * @description
     * Promise, которым мы управляем.
     */
    public promise: Promise<T>;
    /**
     * @description
     * Функция для разрешения Promise с указанным значением.
     */
    public resolve!: (value: T | PromiseLike<T>) => void;
    /**
     * @description
     * Функция для отклонения Promise с указанной причиной.
     */
    public reject!: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }

    /**
     * @description
     * Разрешает все Promise в массиве одним и тем же значением.
     * @param deferred Массив DeferredPromise для разрешения
     * @param data Значение, которым будут разрешены все Promise
     */
    public static resolveAll<K>(deferred: DeferredPromise<any>[], data: K): void {
        deferred.forEach((d) => d.resolve(data));
    }

    /**
     * @description
     * Отклоняет все Promise в массиве с одной и той же причиной.
     * @param deferred Массив DeferredPromise для отклонения
     * @param reason Причина отклонения
     */
    public static rejectAll(deferred: DeferredPromise<any>[], reason?: any): void {
        deferred.forEach((d) => d.reject(reason));
    }

    /**
     * @description
     * Возвращает Promise, который разрешится, когда все Promise в массиве будут разрешены.
     * @param deferred Массив DeferredPromise для ожидания
     * @returns Promise с массивом результатов
     */
    public static all(deferred: DeferredPromise<any>[]): Promise<any[]> {
        return Promise.all(deferred.map((d) => d.promise));
    }

    /**
     * @description
     * Возвращает Promise, который разрешится, когда все Promise в массиве будут завершены (разрешены или отклонены).
     * @param deferred Массив DeferredPromise для ожидания
     * @returns Promise с массивом результатов
     */
    public static allSettled(deferred: DeferredPromise<any>[]): Promise<any[]> {
        return Promise.allSettled(deferred.map((d) => d.promise));
    }

    /**
     * @description
     * Возвращает Promise, который разрешится, когда любой из Promise в массиве будет разрешён.
     * @param deferred Массив DeferredPromise для гонки
     * @returns Promise с результатом первого разрешённого Promise
     */
    public static race(deferred: DeferredPromise<any>[]): Promise<any> {
        return Promise.race(deferred.map((d) => d.promise));
    }
}
