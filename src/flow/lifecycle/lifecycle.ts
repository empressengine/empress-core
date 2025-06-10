import { OnUpdateSignal, OnStartSignal } from "./signals";

/**
 * @description
 * Управляет жизненным циклом игры через два основных хука: start и update.
 * Предоставляет возможности для управления игровым циклом: пауза, изменение скорости,
 * регистрация колбэков на старт и обновление.
 *
 * @example Базовое использование
 * ```typescript
 * const lifecycle = new LifeCycle();
 *
 * // Подписка на обновления
 * lifecycle.addUpdateCallback((deltaTime) => {
 *   // Обновление игровой логики
 * });
 *
 * // Подписка на старт
 * lifecycle.addStartCallback(() => {
 *   // Инициализация при старте
 * });
 *
 * // Инициализация и запуск
 * lifecycle.init();
 * lifecycle.start();
 * ```
 *
 * @example Управление игровым циклом
 * ```typescript
 * // Пауза/возобновление
 * lifecycle.pause(true);
 * lifecycle.pause(false);
 *
 * // Изменение скорости
 * lifecycle.setSpeedMultiplier(2); // Ускорение в 2 раза
 * lifecycle.setSpeedMultiplier(0.5); // Замедление в 2 раза
 * ```
 */
export class LifeCycle {
    private _lastTime: number = 0;
    private _paused: boolean = false;
    private _speedMultiplier: number = 1;
    private _onUpdate: Array<(deltaTime: number) => void> = [];
    private _onStart: Array<() => void> = [];

    /**
     * @description
     * Запускает игру, вызывая все зарегистрированные колбэки старта
     * и отправляя сигнал OnStartSignal. 
     * Запускает requestAnimationFrame для начала обновлений.
     */
    public start(): void {
        this._onStart.forEach((callback) => callback());
        OnStartSignal.dispatch();
        requestAnimationFrame(this.animate);
    }

    /**
     * @description
     * Добавляет колбэк, который будет вызван при старте игры.
     * @param callback Функция для выполнения при старте
     */
    public addStartCallback(callback: () => void): void {
        this._onStart.push(callback);
    }

    /**
     * @description
     * Добавляет колбэк, который будет вызываться каждый кадр.
     * @param callback Функция для выполнения каждый кадр, получает deltaTime в секундах
     */
    public addUpdateCallback(callback: (deltaTime: number) => void): void {
        this._onUpdate.push(callback);
    }

    /**
     * @description
     * Удаляет ранее добавленный колбэк обновления.
     * @param callback Функция для удаления
     */
    public removeUpdateCallback(callback: (deltaTime: number) => void): void {
        this._onUpdate = this._onUpdate.filter((cb) => cb !== callback);
    }

    /**
     * @description
     * Ставит игру на паузу или возобновляет её выполнение.
     * @param paused true для паузы, false для возобновления
     */
    public pause(paused: boolean): void {
        this._paused = paused;
    }

    /**
     * @description
     * Устанавливает множитель скорости игры.
     * @param speedMultiplier Множитель скорости (1 - нормальная скорость, <1 - замедление, >1 - ускорение)
     */
    public setSpeedMultiplier(speedMultiplier: number): void {
        this._speedMultiplier = speedMultiplier;
    }

    private animate = (currentTime: number): void => {
        if (this._paused) return;
        if (this._lastTime !== 0) {
            const deltaTime = (currentTime - this._lastTime) / 1000;
            this.update(deltaTime);
        }
        this._lastTime = currentTime;
        requestAnimationFrame(this.animate);
    }

    private update(deltaTime: number): void {
        if (this._paused) return;
        const multipliedDelta = deltaTime * this._speedMultiplier;
        this._onUpdate.forEach((callback) => callback(multipliedDelta));
        
        OnUpdateSignal.dispatch({
            deltaTime,
            speedMultiplier: this._speedMultiplier,
            multipliedDelta,
        });
    }
}