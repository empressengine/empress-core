import { Timer } from './timer';
import { Interval } from './interval';
import { ISleep, ITimerController, IUpdatable } from './models';
import { DeferredPromise } from '@shared/deferred-promise';
import { Utils } from '@shared/utils';

/**
 * @description
 * Контроллер для управления таймерами и интервалами.
 * В отличие от стандартных setTimeout и setInterval, таймеры зависят от FPS игры
 * и работают на основе requestAnimationFrame, что делает их безопасными в фоновом режиме.
 *
 * @example Пример использования
 * ```typescript
 * import { TimerController } from '@shared/timer';
 *
 * const timerController = new TimerController();
 *
 * // Создание таймера
 * const timerId = timerController.setTimeout(
 *   () => console.log('Таймер завершен'), 
 *   1000
 * );
 *
 * // Удаление таймера по ID
 * timerController.clear(timerId);
 *
 * // Создание интервала
 * const intervalId = timerController.setInterval(
 *   () => console.log('Тик интервала'), 
 *   500
 * );
 *
 * // Удаление интервала по ID
 * timerController.clear(intervalId);
 * ```
 */
export class TimerController implements ITimerController {
    private _updatables: Map<string, IUpdatable> = new Map<string, IUpdatable>();

    /**
     * @description
     * Создает новый таймер, который выполнит колбэк после указанной задержки.
     * @param callback Функция, которая будет вызвана по завершению таймера
     * @param duration Длительность таймера в миллисекундах
     * @returns ID созданного таймера
     */
    public setTimeout(callback: () => void, duration: number): string {
        const id = Utils.uuid();
        const timer = new Timer(id, this, callback, duration);

        this._updatables.set(id, timer);
        return id;
    }

    /**
     * @description
     * Создает новый интервал, который будет периодически выполнять колбэк.
     * @param callback Функция, которая будет вызываться на каждом тике интервала
     * @param duration Период интервала в миллисекундах
     * @returns ID созданного интервала
     */
    public setInterval(callback: () => void, duration: number): string {
        const id = Utils.uuid();
        const interval = new Interval(id, callback, duration);

        this._updatables.set(id, interval);
        return id;
    }

    /**
     * @description
     * Создает новую задержку выполнения кода.
     * @param duration Длительность задержки в миллисекундах
     * @returns Объект с методами `wait` и `resolve`. Метод `wait` возвращает Promise, который разрешится после указанной задержки.
     * Метод `resolve` немедленно разрешает Promise и удаляет таймер из контроллера.
     */
    public sleep(duration: number): ISleep {
        const deferredPromise = new DeferredPromise<void>();
        const id = this.setTimeout(() => deferredPromise.resolve(), duration);

        return {
            id,
            wait: async () => await deferredPromise.promise,
            resolve: () => {
                deferredPromise.resolve();
                this.clear(id);
            },
        };
    }

    /**
     * @description
     * Останавливает таймер или интервал по его ID.
     * @param uuid ID таймера или интервала
     */
    public clear(uuid: string): void {
        if (this._updatables.has(uuid)) {
            this._updatables.delete(uuid);
        }
    }

    /**
     * @description
     * Обновляет все таймеры и интервалы.
     * @param deltaTime Время между кадрами в миллисекундах
     */
    public update(deltaTime: number): void {
        const updatables = Array.from(this._updatables.values());
        updatables.forEach((updatable) => updatable.update(deltaTime));
    }
}
