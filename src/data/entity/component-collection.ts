import { Component, ComponentType } from '@data/component';

/**
 * @description
 * Внутренний класс для управления коллекцией компонентов в сущности.
 * Предоставляет методы для добавления, получения, проверки и удаления компонентов.
 * Используется внутри класса Entity для хранения активных и отключенных компонентов.
 *
 * @example
 * ```ts
 * const collection = new ComponentCollection();
 * 
 * // Добавляем компоненты
 * collection.set(new PositionComponent());
 * collection.set(new HealthComponent());
 * 
 * // Получаем компонент
 * const position = collection.get(PositionComponent);
 * 
 * // Проверяем наличие
 * if (collection.has(HealthComponent)) {
 *   // Удаляем компонент
 *   collection.delete(HealthComponent);
 * }
 * ```
 */
export class ComponentCollection {
    /**
     * @description
     * Список всех компонентов в коллекции.
     * @returns Массив компонентов.
     */
    public get items(): Component[] {
        return this._items;
    }

    private _items: Component[] = [];

    /**
     * @description
     * Добавляет компонент в коллекцию.
     * Не проверяет наличие дубликатов, это должно контролироваться на уровне Entity.
     * 
     * @param component Компонент для добавления в коллекцию.
     */
    public set(component: Component): void {
        this._items.push(component);
    }

    /**
     * @description
     * Получает компонент указанного типа из коллекции.
     * Использует instanceof для проверки типа.
     * 
     * @param type Конструктор компонента для поиска.
     * @returns Найденный компонент или undefined, если не найден.
     */
    public get<T extends Component>(type: ComponentType<T>): T | undefined {
        return this._items.find((component) => component instanceof type) as T;
    }

    /**
     * @description
     * Проверяет наличие компонента указанного типа в коллекции.
     * 
     * @param type Конструктор компонента для проверки.
     * @returns true, если компонент найден, иначе false.
     */
    public has<T extends Component>(type: ComponentType<T>): boolean {
        return !!this.get(type);
    }

    /**
     * @description
     * Удаляет компонент указанного типа из коллекции.
     * Создает новый массив без удаляемого компонента.
     * 
     * @param type Конструктор компонента для удаления.
     * @returns true, если компонент был найден и удален, иначе false.
     */
    public delete(type: ComponentType<any>): boolean {
        const component = this.get(type);

        if (component) {
            this._items = this.items.filter((component) => component.constructor !== type);
        }

        return !!component;
    }

    /**
     * @description
     * Очищает коллекцию, удаляя все компоненты.
     * Использует оптимизированный способ очистки массива.
     */
    public clear(): void {
        this._items.length = 0;
    }
}
