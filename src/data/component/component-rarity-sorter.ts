import { ComponentType } from './component';

/**
 * @description
 * Утилитарный класс, который отслеживает, как часто каждый компонент используется в игре.
 * Необходим для сортировщика компонентов, чтобы иметь возможность сортировать компоненты на основе их редкости.
 * 
 * @example
 * ```ts
 * // Создаем несколько сущностей с разными компонентами
 * const entity1 = new Entity();
 * const entity2 = new Entity();
 * const entity3 = new Entity();
 * 
 * // Добавляем компоненты (автоматически увеличивает частоту через Entity.addComponent)
 * entity1.addComponent(new Position());
 * entity1.addComponent(new Health());
 * 
 * entity2.addComponent(new Position());
 * entity2.addComponent(new Velocity());
 * 
 * entity3.addComponent(new Position());
 * 
 * // Теперь Position используется 3 раза, Health и Velocity по 1 разу
 * console.log(ComponentsRaritySorter.rarity(Position)); // Вывод: 3
 * console.log(ComponentsRaritySorter.rarity(Health));  // Вывод: 1
 * 
 * // Сортируем компоненты по редкости (от самых редких к частым)
 * const components = [Position, Health, Velocity];
 * const sorted = ComponentsRaritySorter.sortByRarity(components);
 * // sorted: [Health, Velocity, Position]
 * ```
 */
export class ComponentsRaritySorter {
    private static _componentFrequency: Map<ComponentType<any>, number> = new Map();

    /**
     * @description
     * Увеличивает частоту использования указанного типа компонента.
     *
     * @param component Компонент, для которого увеличивается частота использования.
     */
    public static increment(component: ComponentType<any>): void {
        const currentCount = this._componentFrequency.get(component) ?? 0;
        this._componentFrequency.set(component, currentCount + 1);
    }

    /**
     * @description
     * Уменьшает частоту использования указанного типа компонента. Если частота
     * достигает нуля, компонент удаляется из карты.
     *
     * @param component Компонент, для которого уменьшается частота использования.
     */
    public static decrement(component: ComponentType<any>): void {
        const currentCount = this._componentFrequency.get(component) ?? 0;
        if (currentCount > 1) {
            this._componentFrequency.set(component, currentCount - 1);
        } else {
            this._componentFrequency.delete(component);
        }
    }

    /**
     * @description
     * Получает редкость указанного типа компонента.
     *
     * @param component Компонент, для которого запрашивается редкость.
     */
    public static rarity(component: ComponentType<any>): number {
        return this._componentFrequency.get(component) ?? 0;
    }

    /**
     * @description
     * Сортирует массив типов компонентов по их редкости.
     *
     * @param components Массив типов компонентов для сортировки.
     * @returns Отсортированный массив типов компонентов.
     */
    public static sortByRarity(components: ComponentType<any>[]): ComponentType<any>[] {
        return [...components].sort((a, b) => this.rarity(a) - this.rarity(b));
    }
}
