import { ISystem, SystemType } from "@logic/system";
import { Token, Provider } from "./models";

/**
 * @description
 * Контейнер для управления зависимостями в ECS фреймворке.
 * Реализует паттерн Dependency Injection с поддержкой модулей.
 * 
 * Особенности:
 * - Поддерживает глобальные и модульные зависимости
 * - Позволяет переопределять зависимости на уровне модулей
 * - Поддерживает классы и объекты как зависимости
 * - Позволяет создавать иммутабельные зависимости
 * 
 * @example
 * ```typescript
 * // Регистрация глобальных зависимостей
 * ServiceContainer.instance.registerGlobal([
 *   { provide: AudioService, useClass: DefaultAudioService },
 *   { provide: GameState, useFactory: () => ({ score: 0 }), immutable: true }
 * ]);
 * 
 * // Переопределение в модуле
 * ServiceContainer.instance.registerModule('gameModule', [
 *   { provide: AudioService, useClass: CustomAudioService }
 * ]);
 * ```
 */
export class ServiceContainer {
  private static _instance: ServiceContainer;

  /**
   * @description
   * Получает или создает единственный экземпляр контейнера.
   * Реализует паттерн Singleton.
   */
  public static get instance(): ServiceContainer {
    if (!ServiceContainer._instance) {
      ServiceContainer._instance = new ServiceContainer();
    }
    return ServiceContainer._instance;
  }

  private providers = new Map<string, Map<Token<any>, Provider<any>>>();
  private instances = new Map<string, Map<Token<any>, any>>();
  private systemTokens: { system: SystemType<any, any>, token: Token<any>, key: string }[] = [];

  private constructor() {
    this.providers.set('global', new Map());
    this.instances.set('global', new Map());
  }

  /**
   * @description
   * Регистрирует провайдеры для конкретного модуля.
   * Может переопределять глобальные зависимости.
   * 
   * @param moduleId Идентификатор модуля.
   * @param providers Массив провайдеров.
   */
  public registerModule(moduleId: string, providers: Provider[]): void {
    if (!this.providers.has(moduleId)) {
      this.providers.set(moduleId, new Map());
      this.instances.set(moduleId, new Map());
    }
    const modProviders = this.providers.get(moduleId)!;
    for (const provider of providers) {
      modProviders.set(provider.provide, provider);
    }
  }

  /**
   * @description
   * Регистрирует глобальные провайдеры.
   * Эти провайдеры доступны во всех модулях, если не переопределены.
   * 
   * @param providers Массив провайдеров.
   */
  public registerGlobal(providers: Provider[]): void {
    this.registerModule('global', providers);
  }

  /**
   * @description
   * Получает зависимость по токену.
   * Сначала ищет в модуле, затем в глобальных зависимостях.
   * 
   * @param token Токен зависимости.
   * @param moduleId Идентификатор модуля.
   * @returns Инстанс зависимости.
   * @throws Если зависимость не найдена.
   */
  public get<T>(token: Token<T>, moduleId: string = 'global'): T {
    let provider = this.providers.get(moduleId)?.get(token)
      ?? this.providers.get('global')!.get(token);
    if (!provider) {
      throw new Error(`Provider for token ${token.toString()} not found`);
    }

    const instMap = this.instances.get(moduleId === 'global' ? 'global' : moduleId)!;
    if (instMap.has(token)) {
      return instMap.get(token);
    }

    const instance: T = 'useClass' in provider
      ? (typeof provider.useClass === 'function' ? new provider.useClass() : provider.useClass)
      : provider.useFactory();
    instMap.set(token, instance);
    return instance;
  }

  /**
   * @description
   * Запоминает зависимости для Системы.
   * Используется декоратором @Inject для внедрения зависимостей в Системы.
   * 
   * @param system Класс Системы.
   * @param token Токен зависимости.
   * @param key Ключ свойства в Системе.
   */
  public memorizeSystem(system: SystemType<any, any>, token: Token<any>, key: string): void {
    this.systemTokens.push({ system, token, key });
  }

  /**
   * @description
   * Внедряет зависимости в Систему.
   * Создает иммутабельные прокси для помеченных зависимостей.
   * 
   * @param moduleId Идентификатор модуля.
   * @param system Система, в которую внедряются зависимости.
   */
  public getDependencyForSystem(moduleId: string, system: ISystem<any>): void {
    if(!('injectHere' in system)) return;

    const dependencies = [];

    for(const value of this.systemTokens) {
        if(system instanceof value.system) {
            dependencies.push({
                token: value.token,
                key: value.key,
            })
        }
    }

    dependencies.forEach(item => {
        if(item.key in system) {

            const provider = this.providers.get(moduleId)?.get(item.token)
              ?? this.providers.get('global')!.get(item.token);

            if(!provider) return;

            let value = this.get(item.token, moduleId);

            if(provider.immutable) {
                value = new Proxy(value, {
                    get: (target, prop) => {
                        const value = target[prop];
                        return value instanceof Object ? new Proxy(value, {}) : value;
                    },
                    set: () => {
                        console.warn('Direct state mutation is not allowed. Use setState instead.');
                        return false;
                    }
                });
            }

            Object.defineProperty(system, item.key, {
              value,
              enumerable: true,
              configurable: true,
            });
        }
    })
  }
}