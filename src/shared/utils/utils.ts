/** 
 * Тип для функции обратного вызова, принимающей любые аргументы
 */
type Callback = (...args: any[]) => void;

/**
 * @description
 * Класс с утилитарными функциями общего назначения.
 * Содержит методы для генерации UUID, дебаунсинга и создания Proxy-декораторов.
 */
export class Utils {
    private static counter = 0;
    private static lastTime = 0;

    /**
     * @description
     * Генерирует гарантированно уникальный идентификатор.
     * Использует комбинацию времени, счётчика и случайного числа.
     * Гарантирует уникальность даже при многократной генерации в пределах одной миллисекунды.
     * 
     * @returns Строка с уникальным идентификатором в формате 'timestamp-counter-random'
     */
    public static uuid(): string {
        const now = Date.now();
        
        // Сбрасываем счётчик, если сменилась миллисекунда
        if (now !== this.lastTime) {
            this.counter = 0;
            this.lastTime = now;
        }

        // Увеличиваем счётчик
        const count = (this.counter++).toString(36).padStart(2, '0');
        
        // Добавляем случайность
        const random = Math.random().toString(36).slice(2, 6);

        // Формируем итоговый ID: timestamp-counter-random
        return `${now.toString(36)}-${count}-${random}`;
    }

    /**
     * @description
     * Создаёт функцию с задержкой выполнения (дебаунсинг).
     * При многократном вызове выполнится только последний вызов после задержки.
     * 
     * @param callback Функция для выполнения
     * @param delay Задержка в миллисекундах
     * @returns Функция с дебаунсингом
     */
    public static debounce(callback: Callback, delay: number = 0): Callback {
        let timer: ReturnType<typeof setTimeout> | null = null;
    
        return (...args: any[]) => {
            clearTimeout(timer!);
    
            timer = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }

    /**
     * @description
     * Создаёт Proxy-декоратор для объекта, который запрещает прямое изменение свойств.
     * Используется для контроля изменений состояния.
     * 
     * @param data Объект для обёртывания в Proxy
     * @returns Proxy-объект, запрещающий прямые изменения
     */
    public static createProxyDecorator<T extends object>(data: T) {
        return new Proxy(data, {
            get: (target, prop) => {
                const value = target[prop as keyof T];
                return value instanceof Object ? new Proxy(value, {}) : value;
            },
            set: () => {
                console.warn('Direct state mutation is not allowed. Use setState instead.');
                return false;
            }
        });
    }
}