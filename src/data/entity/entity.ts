import { ComponentsRaritySorter } from '@data/component';
import { Component, ComponentType } from '../component/component';
import { ComponentFilter, IEntity } from './models';
import { ComponentCollection } from './component-collection';

/**
 * @description
 * Базовый класс сущности в ECS архитектуре.
 * Реализует интерфейс IEntity.
 * Содержит коллекцию компонентов и предоставляет методы для управления ими.
 * Каждая сущность имеет уникальный идентификатор, имя и может быть активной или неактивной.
 * 
 * @example
 * ```ts
 * // Создаем сущность с двумя компонентами
 * const entity = new Entity('my-entity');
 * entity.addComponent(new PositionComponent());
 * entity.addComponent(new VelocityComponent());
 *
 * // Получаем компонент позиции
 * const position = entity.getComponent(PositionComponent);
 *
 * // Удаляем компонент скорости
 * entity.removeComponent(VelocityComponent);
 *
 * // Отключаем все компоненты сущности
 * entity.disableAllComponents();
 */
export class Entity implements IEntity {
    /**
     * @description
     * Уникальный идентификатор сущности.
     * Используется для однозначной идентификации сущности в игре.
     */
    public get uuid(): string {
        return this._uuid;
    }

    /**
     * @description
     * Имя сущности.
     * Используется для удобной идентификации сущности человеком.
     */
    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    /**
     * @description
     * Флаг активности сущности.
     * Определяет, должна ли сущность обрабатываться игровыми системами.
     */
    public get active(): boolean {
        return this._active;
    }

    public set active(value: boolean) {
        this._active = value;
    }

    /**
     * @description
     * Список всех активных компонентов, прикрепленных к сущности.
     * Включает только компоненты, которые в данный момент включены.
     */
    public get components(): Component[] {
        return this._components.items;
    }

    /**
     * @description
     * Список всех отключенных компонентов сущности.
     * Включает компоненты, которые временно деактивированы.
     */
    public get disabledComponents(): Component[] {
        return this._disabledComponents.items;
    }

    private _active: boolean = true;
    private readonly _components: ComponentCollection = new ComponentCollection();
    private readonly _disabledComponents: ComponentCollection = new ComponentCollection();

    constructor(
        private readonly _uuid: string,
        private _name: string = 'Entity',
    ) {}

    /**
     * @description
     * Добавляет компонент к сущности.
     * Компонент может быть добавлен либо как активный, либо как отключенный.
     * Один тип компонента может быть добавлен к сущности только один раз.
     *
     * @param component Экземпляр компонента для добавления.
     * @param enabled Должен ли компонент быть изначально включен или отключен. По умолчанию true.
     * @throws {Error} Если компонент данного типа уже существует в сущности.
     */
    public addComponent(component: Component, enabled: boolean = true): void {
        const ctor = this.extractConstructor(component);

        if (this._components.has(ctor) || this._disabledComponents.has(ctor)) {
            throw new Error(
                `Component of type ${ctor.name} already exists in entity [${this._name}-${this._uuid}]`,
            );
        }

        if (enabled) {
            this._components.set(component);
            ComponentsRaritySorter.increment(ctor);
        } else {
            this._disabledComponents.set(component);
            ComponentsRaritySorter.decrement(ctor);
        }
    }

    /**
     * @description Получает компонент по его конструктору.
     * @param ctor Конструктор компонента.
     * @returns Экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    public getComponent<T extends Component>(ctor: ComponentType<T>): T {
        const component = this._components.get(ctor);
        if (!component) {
            throw new Error(
                `Component of type ${ctor.name} is not found in [${this.name}-${this.uuid}].`,
            );
        }
        return component as T;
    }

    /**
     * @description Проверяет, имеет ли сущность все указанные компоненты.
     * @param types Массив конструкторов компонентов для проверки.
     * @returns true, если сущность имеет все указанные компоненты, иначе false.
     */
    public hasComponents(types: ComponentType<any>[]): boolean {
        return types.every((component) => {
            const c = this._components.get(component);
            return !!c;
        });
    }

    /**
     * @description Удаляет компонент из сущности.
     * Может удалить как активный, так и отключенный компонент.
     * @param ctor Конструктор компонента для удаления.
     * @returns Удаленный экземпляр компонента.
     * @throws {Error} Если компонент не найден в сущности.
     */
    public removeComponent(ctor: ComponentType<any>): Component {
        let removed: Component | undefined;

        if (this._components.has(ctor)) {
            removed = this._components.get(ctor);
            this._components.delete(ctor);
        } else if (this._disabledComponents.has(ctor)) {
            removed = this._disabledComponents.get(ctor);
            this._disabledComponents.delete(ctor);
        }

        if (!removed) {
            throw new Error(
                `Component type ${ctor.name} does not exist in entity [${this._name}-${this._uuid}]`,
            );
        }

        ComponentsRaritySorter.decrement(ctor);

        return removed;
    }

    /**
     * @description
     * Включает ранее отключенный компонент.
     * Перемещает компонент из списка отключенных в список активных.
     *
     * @param ctor Конструктор компонента для включения.
     * @throws {Error} Если компонент не существует или уже включен.
     */
    public enableComponent<T extends Component>(ctor: ComponentType<T>): void {
        if (!this._disabledComponents.has(ctor)) {
            throw new Error(
                `Cannot enable component of type ${ctor.name} - it does not exist or is already enabled.`,
            );
        }
        const comp = this._disabledComponents.get(ctor)!;
        this._disabledComponents.delete(ctor);
        this._components.set(comp);

        ComponentsRaritySorter.increment(ctor);
    }

    /**
     * @description
     * Отключает компонент.
     * Перемещает компонент из списка активных в список отключенных.
     *
     * @param ctor Конструктор компонента для отключения.
     * @throws {Error} Если компонент не существует или уже отключен.
     */
    public disableComponent<T extends Component>(ctor: ComponentType<T>): void {
        if (!this._components.has(ctor)) {
            throw new Error(
                `Cannot disable component of type ${ctor.name} - it does not exist or is already disabled.`,
            );
        }
        const comp = this._components.get(ctor)!;
        this._components.delete(ctor);
        this._disabledComponents.set(comp);

        ComponentsRaritySorter.decrement(ctor);
    }

    /**
     * @description
     * Отключает все компоненты сущности.
     * Перемещает все компоненты из активного списка в список отключенных.
     */
    public disableAllComponents(): void {
        for (const comp of this._components.items) {
            this._disabledComponents.set(comp);
            ComponentsRaritySorter.decrement(comp.constructor);
        }
        this._components.clear();
    }

    /**
     * @description
     * Включает все ранее отключенные компоненты.
     * Перемещает все компоненты из списка отключенных в список активных.
     */
    public enableAllComponents(): void {
        for (const comp of this._disabledComponents.items) {
            this._components.set(comp);
            ComponentsRaritySorter.increment(comp.constructor);
        }
        this._disabledComponents.clear();
    }

    /**
     * @description
     * Проверяет, соответствует ли сущность указанным критериям фильтрации.
     * Сущность должна иметь все компоненты из includes и не иметь ни одного из excludes.
     * 
     * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
     * @returns true, если сущность удовлетворяет фильтру, иначе false.
     */
    public isSatisfiedFilter(filter: ComponentFilter): boolean {
        const includes = filter.includes || [];
        const excludes = filter.excludes || [];

        return this.hasComponents(includes) && (!excludes.length || !this.hasComponents(excludes));
    }

    private extractConstructor<T extends Component>(component: Component): ComponentType<T> {
        return component.constructor as ComponentType<T>;
    }
}
