/**
 * @description
 * Component (Компонент) - это простой JavaScript объект, который не требует реализации интерфейсов
 * или наследования базовых классов.
 *
 * Компоненты используются как контейнеры данных для игровых сущностей (Entity). Они содержат всю информацию
 * о конкретном аспекте состояния и поведения сущности. Например, можно определить такие компоненты как Position
 * (позиция), Velocity (скорость), Health (здоровье), Inventory (инвентарь) и т.д., каждый со своим набором
 * свойств, специфичных для этих аспектов.
 *
 * Компоненты должны содержать только данные, без какой-либо функциональности.
 *
 * В EmpressCore компоненты обычно создаются с использованием классов. Это позволяет легко расширять и настраивать их,
 * добавляя дополнительные свойства.
 *
 * @example
 * ```ts
 * // Определяем компонент "Position" с координатами x,y:
 * export class Position {
 *   public x!: number;
 *   public y!: number;
 *
 *   constructor(x: number, y: number) {
 *     this.x = x;
 *     this.y = y;
 *   }
 * }
 *
 * // Создаем сущность с компонентом позиции:
 * const playerEntity = new Entity();
 * playerEntity.addComponent(new Position(10, 20));
 *
 * // Получаем компонент позиции из сущности:
 * const positionComponent = playerEntity.getComponent(Position);
 * console.log(positionComponent.x); // Вывод: 10
 *
 * // Обновляем значения компонента позиции:
 * positionComponent.x += 5;
 * positionComponent.y -= 3;
 *
 * ```
 */
export type Component = object & { length?: never; constructor: any };

/**
 * @description
 * ComponentType - это функция-конструктор, которая создает экземпляры определенного типа компонента.
 *
 * @template T Тип создаваемого компонента.
 *
 * @param args Аргументы, необходимые для создания экземпляра компонента.
 *
 * @returns Экземпляр указанного типа компонента.
 *
 */
export type ComponentType<T extends Component> = new (...args: any[]) => T;
