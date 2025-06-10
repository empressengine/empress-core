import { System, SystemType } from "@logic/system";
import { Token } from "../models";
import { SystemGroup } from "@containers/system-group";
import { ServiceContainer } from "../services.container";

/**
 * @description
 * Декоратор для внедрения зависимостей в Системы и SystemGroup.
 * 
 * Особенности:
 * - Для Систем зависимости внедряются при создании инстанса
 * - Для SystemGroup зависимости внедряются через геттеры
 * - Поддерживает иммутабельные зависимости
 * 
 * @example
 * ```typescript
 * // В Системе
 * class MovementSystem extends System {
 *     @Inject(AbstractAudioService)
 *     private _audio!: AbstractAudioService;
 * 
 *     @Inject(GameState)
 *     private _state!: GameState; // Иммутабельный объект
 * }
 * 
 * // В SystemGroup
 * class GameGroup extends SystemGroup {
 *     @Inject(GameConfig)
 *     private _config!: GameConfig;
 * }
 * ```
 * 
 * @template T Тип внедряемой зависимости
 * @param token Токен зависимости (класс или символ)
 * @throws Если токен не предоставлен
 */
export function Inject<T>(token: Token<T>) {
    if (!token) {
      throw new Error('Token must be provided to @Inject decorator when not using reflect-metadata');
    }
    return function(target: any, propertyKey: string) {
  
      let moduleId = 'global';
  
      if (target instanceof System) {
        
        Object.defineProperty(target, 'injectHere', {
            value:"injectHere", 
            enumerable: false, 
            configurable: false
        });

        Object.defineProperty(target, propertyKey, {
            value: null
        });
        
        ServiceContainer.instance.memorizeSystem(target.constructor as SystemType<any, any>, token, propertyKey);
        return;
      }
  
      if(target instanceof SystemGroup) {
        moduleId = target.uuid || 'global';
      }
  
      Object.defineProperty(target, propertyKey, {
        get: () => ServiceContainer.instance.get(token, moduleId),
        enumerable: true,
        configurable: false,
      });
    };
  }