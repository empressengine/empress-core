class I {
  constructor() {
    this._groupId = "", this._executionId = "", this.withDisabled = !1;
  }
  /**
   * @description
   * Идентификатор SystemGroup, к которой принадлежит система.
   * Устанавливается автоматически при добавлении системы в группу.
   */
  get groupId() {
    return this._groupId;
  }
  get executionId() {
    return this._executionId;
  }
  /**
   * @description
   * Устанавливает контекст выполнения системы.
   * Вызывается автоматически при запуске системы в SystemGroup.
   * 
   * @param groupId Идентификатор группы, в которой выполняется система.
   * @param executionId Идентификатор текущего выполнения группы.
   * @param entityStorage Хранилище сущностей, которое будет использоваться для фильтрации.
   */
  setContext(e, t, s) {
    this._groupId = e, this._executionId = t, this._entityStorage = s;
  }
  /**
   * @description
   * Запускает выполнение системы.
   * Этот метод вызывается из SystemGroup и не должен вызываться напрямую.
   *
   * @param data Дополнительные данные для передачи в метод execute.
   * @param externalFilter Дополнительный фильтр от SystemGroup.
   * @param withDisabled Включать ли неактивные сущности.
   * @returns void | Promise<void> Система может быть асинхронной.
   */
  run(e, t, s) {
    return this.externalFilter = t, this.withDisabled = s, this.execute(e);
  }
  /**
   * @description
   * Фильтрует сущности по компонентам.
   * Автоматически объединяет фильтр системы с фильтром группы.
   *
   * @param filter Фильтр для применения к сущностям.
   * @returns Объект Filtered со списком отфильтрованных сущностей.
   */
  filter(e) {
    const t = {
      includes: [...e.includes, ...this.externalFilter.includes || []],
      excludes: [...e.excludes || [], ...this.externalFilter.excludes || []]
    };
    return this._entityStorage.filter(t, this.withDisabled);
  }
  /**
   * @description
   * Фильтрует сущности по компонентам без учета фильтра группы.
   * Используется, когда нужно проигнорировать фильтр группы.
   *
   * @param filter Фильтр для применения к сущностям.
   * @returns Объект Filtered со списком отфильтрованных сущностей.
   */
  cleanFilter(e) {
    return this._entityStorage.filter(e, this.withDisabled);
  }
  /**
   * @description
   * Вызывается при принудительной остановке системы.
   * Может быть переопределен для очистки ресурсов.
   */
  forceStop() {
  }
}
const f = class f {
  /**
   * @description
   * Генерирует гарантированно уникальный идентификатор.
   * Использует комбинацию времени, счётчика и случайного числа.
   * Гарантирует уникальность даже при многократной генерации в пределах одной миллисекунды.
   * 
   * @returns Строка с уникальным идентификатором в формате 'timestamp-counter-random'
   */
  static uuid() {
    const e = Date.now();
    e !== this.lastTime && (this.counter = 0, this.lastTime = e);
    const t = (this.counter++).toString(36).padStart(2, "0"), s = Math.random().toString(36).slice(2, 6);
    return `${e.toString(36)}-${t}-${s}`;
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
  static debounce(e, t = 0) {
    let s = null;
    return (...i) => {
      clearTimeout(s), s = setTimeout(() => {
        e(...i);
      }, t);
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
  static createProxyDecorator(e) {
    return new Proxy(e, {
      get: (t, s) => {
        const i = t[s];
        return i instanceof Object ? new Proxy(i, {}) : i;
      },
      set: () => (console.warn("Direct state mutation is not allowed. Use setState instead."), !1)
    });
  }
};
f.counter = 0, f.lastTime = 0;
let a = f;
class F {
  constructor() {
    this._providers = [];
  }
  /**
   * @description
   * Получает массив опций Систем в группе.
   * 
   * @returns Массив опций Систем.
   */
  get providers() {
    return this._providers;
  }
  /**
   * @description
   * Добавляет Систему в конец группы.
   * 
   * @param system Конструктор Системы.
   * @param data Данные для передачи в Систему.
   * @param options Опции для настройки Системы.
   * @returns Экземпляр SystemChain.
   */
  add(e, t, s = {}) {
    const i = s.id || a.uuid(), n = {
      ...s,
      id: i,
      instance: { system: e, data: t }
    };
    return this._providers.push(n), this;
  }
  /**
   * @description
   * Добавляет Систему в начало группы.
   * 
   * @param system Конструктор Системы.
   * @param data Данные для передачи в Систему.
   * @param options Опции для настройки Системы.
   * @returns Экземпляр SystemChain.
   */
  prepend(e, t, s = {}) {
    const i = s.id || a.uuid(), n = {
      ...s,
      id: i,
      instance: { system: e, data: t }
    };
    return this._providers.unshift(n), this;
  }
  /**
   * @description
   * Вставляет Систему перед определенной Системой в группе.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @param system Конструктор Системы.
   * @param data Данные для передачи в Систему.
   * @param options Опции для настройки Системы.
   * @returns Экземпляр SystemChain.
   */
  insertBefore(e, t, s, i = {}) {
    const n = this._providers.findIndex((r) => r.id === e);
    if (n >= 0) {
      const r = i.id || a.uuid(), c = {
        ...i,
        id: r,
        instance: { system: t, data: s }
      };
      this._providers.splice(n, 0, c);
    }
    return this;
  }
  /**
   * @description
   * Вставляет Систему после определенной Системы в группе.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @param system Конструктор Системы.
   * @param data Данные для передачи в Систему.
   * @param options Опции для настройки Системы.
   * @returns Экземпляр SystemChain.
   */
  insertAfter(e, t, s, i = {}) {
    const n = this._providers.findIndex((r) => r.id === e);
    if (n >= 0) {
      const r = i.id || a.uuid(), c = {
        ...i,
        id: r,
        instance: { system: t, data: s }
      };
      this._providers.splice(n + 1, 0, c);
    }
    return this;
  }
  /**
   * @description
   * Заменяет определенную Систему в группе.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @param system Конструктор Системы.
   * @param data Данные для передачи в Систему.
   * @param options Опции для настройки Системы.
   * @returns Экземпляр SystemChain.
   */
  replace(e, t, s, i = {}) {
    const n = this._providers.findIndex((r) => r.id === e);
    if (n >= 0) {
      const c = {
        ...Object.keys(i).length ? i : this._providers[n],
        instance: { system: t, data: s }
      };
      this._providers[n] = c;
    }
    return this;
  }
  /**
   * @description
   * Удаляет определенную Систему из группы.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @returns Экземпляр SystemChain.
   */
  remove(e) {
    const t = this._providers.findIndex((s) => s.id === e);
    return t >= 0 && this._providers.splice(t, 1), this;
  }
  /**
   * @description
   * Получает определенную Систему из группы.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @returns Опция Системы или undefined.
   */
  get(e) {
    return this._providers.find((t) => t.id === e);
  }
  /**
   * @description
   * Проверяет наличие определенной Системы в группе.
   * 
   * @param targetId Идентификатор целевой Системы.
   * @returns true, если Система найдена, иначе false.
   */
  has(e) {
    return this._providers.some((t) => t.id === e);
  }
  /**
   * @description
   * Возвращает количество Систем в группе.
   * 
   * @returns Количество Систем.
   */
  count() {
    return this._providers.length;
  }
}
class M {
  constructor() {
    this._uuid = a.uuid(), this._chain = new F();
  }
  /**
   * @description
   * Уникальный идентификатор группы.
   */
  get uuid() {
    return this._uuid;
  }
  /**
   * @description
   * Сортирует и подготавливает опции Систем для выполнения.
   * Устанавливает значения по умолчанию и сортирует по порядку.
   * 
   * @param data Данные от Signal.
   * @returns Отсортированный массив опций Систем.
   */
  sorted(e) {
    this._chain.providers.length === 0 && this.setup(this._chain, e);
    const t = this._chain.providers;
    return t.forEach((s) => {
      s.withDisabled === void 0 && (s.withDisabled = !1), s.includes === void 0 && (s.includes = []), s.excludes === void 0 && (s.excludes = []), s.repeat || (s.repeat = 1), s.canExecute || (s.canExecute = () => !0);
    }), t;
  }
  /**
   * @description
   * Регистрирует зависимости группы в ServiceContainer.
   * Зависимости группы переопределяют глобальные зависимости из EmpressCore.
   */
  registerGroupDependencies() {
    const e = this.setupDependencies();
    u.instance.registerModule(this.uuid, e);
  }
  setupDependencies() {
    return [];
  }
}
class u {
  constructor() {
    this.providers = /* @__PURE__ */ new Map(), this.instances = /* @__PURE__ */ new Map(), this.systemTokens = [], this.providers.set("global", /* @__PURE__ */ new Map()), this.instances.set("global", /* @__PURE__ */ new Map());
  }
  /**
   * @description
   * Получает или создает единственный экземпляр контейнера.
   * Реализует паттерн Singleton.
   */
  static get instance() {
    return u._instance || (u._instance = new u()), u._instance;
  }
  /**
   * @description
   * Регистрирует провайдеры для конкретного модуля.
   * Может переопределять глобальные зависимости.
   * 
   * @param moduleId Идентификатор модуля.
   * @param providers Массив провайдеров.
   */
  registerModule(e, t) {
    this.providers.has(e) || (this.providers.set(e, /* @__PURE__ */ new Map()), this.instances.set(e, /* @__PURE__ */ new Map()));
    const s = this.providers.get(e);
    for (const i of t)
      s.set(i.provide, i);
  }
  /**
   * @description
   * Регистрирует глобальные провайдеры.
   * Эти провайдеры доступны во всех модулях, если не переопределены.
   * 
   * @param providers Массив провайдеров.
   */
  registerGlobal(e) {
    this.registerModule("global", e);
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
  get(e, t = "global") {
    var r;
    let s = ((r = this.providers.get(t)) == null ? void 0 : r.get(e)) ?? this.providers.get("global").get(e);
    if (!s)
      throw new Error(`Provider for token ${e.toString()} not found`);
    const i = this.instances.get(t === "global" ? "global" : t);
    if (i.has(e))
      return i.get(e);
    const n = "useClass" in s ? typeof s.useClass == "function" ? new s.useClass() : s.useClass : s.useFactory();
    return i.set(e, n), n;
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
  memorizeSystem(e, t, s) {
    this.systemTokens.push({ system: e, token: t, key: s });
  }
  /**
   * @description
   * Внедряет зависимости в Систему.
   * Создает иммутабельные прокси для помеченных зависимостей.
   * 
   * @param moduleId Идентификатор модуля.
   * @param system Система, в которую внедряются зависимости.
   */
  getDependencyForSystem(e, t) {
    if (!("injectHere" in t)) return;
    const s = [];
    for (const i of this.systemTokens)
      t instanceof i.system && s.push({
        token: i.token,
        key: i.key
      });
    s.forEach((i) => {
      var n, r;
      if (i.key in t) {
        const c = this.providers.get("global").has(i.token), l = (n = this.providers.get(e)) == null ? void 0 : n.has(i.token);
        if (!l && !c) return;
        let d, p;
        if (l ? (d = (r = this.providers.get(e)) == null ? void 0 : r.get(i.token), p = e) : c && (d = this.providers.get("global").get(i.token), p = "global"), !d) return;
        let g = this.get(i.token, p);
        d.immutable && (g = new Proxy(g, {
          get: (q, P) => {
            const b = q[P];
            return b instanceof Object ? new Proxy(b, {}) : b;
          },
          set: () => (console.warn("Direct state mutation is not allowed. Use setState instead."), !1)
        })), Object.defineProperty(t, i.key, {
          value: g,
          enumerable: !0,
          configurable: !0
        });
      }
    });
  }
}
function R(o) {
  if (!o)
    throw new Error("Token must be provided to @Inject decorator when not using reflect-metadata");
  return function(e, t) {
    let s = "global";
    if (e instanceof I) {
      Object.defineProperty(e, "injectHere", {
        value: "injectHere",
        enumerable: !1,
        configurable: !1
      }), Object.defineProperty(e, t, {
        value: null
      }), u.instance.memorizeSystem(e.constructor, o, t);
      return;
    }
    e instanceof M && (s = e.uuid || "global"), Object.defineProperty(e, t, {
      get: () => u.instance.get(o, s),
      enumerable: !0,
      configurable: !1
    });
  };
}
class w {
  constructor() {
    this._cache = /* @__PURE__ */ new Map();
  }
  /**
   * @description
   * Получает инстанс Системы из кэша или создает новый.
   * Если Система уже существует, возвращает её из кэша.
   * Если нет - создает новый инстанс и кэширует его.
   * 
   * @param ctor Класс Системы.
   * @returns Инстанс Системы.
   */
  get(e) {
    let t = this._cache.get(e);
    return t || (t = new e(), this._cache.set(e, t)), t;
  }
}
class T {
  constructor() {
    this._cache = /* @__PURE__ */ new Map();
  }
  get(e) {
    let t = this._cache.get(e);
    return t || (t = new e(), t.registerGroupDependencies(), this._cache.set(e, t)), t;
  }
}
const A = (o, e) => (t) => !(!t.hasComponents(o) || e && t.hasComponents(e));
class D {
  constructor(e = []) {
    this._entities = e;
  }
  /**
   * @description
   * Возвращает общее количество сущностей в коллекции.
   * @returns Количество сущностей.
   */
  get count() {
    return this._entities.length;
  }
  /**
   * @description
   * Возвращает массив всех отфильтрованных сущностей.
   * @returns Массив сущностей.
   */
  get items() {
    return this._entities;
  }
  /**
   * @description
   * Синхронно перебирает все сущности и вызывает для каждой коллбэк-функцию.
   * Передает в коллбэк сущность и её индекс в массиве.
   *
   * @param callback Коллбэк-функция, которая будет вызвана для каждой сущности.
   */
  forEach(e) {
    for (let t = 0; t < this._entities.length; t++)
      e(this._entities[t], t);
  }
  /**
   * @description
   * Асинхронно перебирает все сущности последовательно.
   * Каждая следующая сущность обрабатывается только после завершения обработки предыдущей.
   *
   * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
   * @returns Promise, который разрешится после завершения всех итераций.
   */
  async sequential(e) {
    let t = 0;
    for (const s of this._entities)
      await e(s, t), t += 1;
  }
  /**
   * @description
   * Асинхронно перебирает все сущности параллельно.
   * Все сущности обрабатываются одновременно, не дожидаясь завершения обработки предыдущих.
   *
   * @param callback Асинхронная коллбэк-функция, которая будет вызвана для каждой сущности.
   * @returns Promise, который разрешится после завершения всех итераций.
   */
  async parallel(e) {
    const t = this._entities.map(e);
    await Promise.all(t);
  }
}
const v = class v {
  /**
   * @description
   * Увеличивает частоту использования указанного типа компонента.
   *
   * @param component Компонент, для которого увеличивается частота использования.
   */
  static increment(e) {
    const t = this._componentFrequency.get(e) ?? 0;
    this._componentFrequency.set(e, t + 1);
  }
  /**
   * @description
   * Уменьшает частоту использования указанного типа компонента. Если частота
   * достигает нуля, компонент удаляется из карты.
   *
   * @param component Компонент, для которого уменьшается частота использования.
   */
  static decrement(e) {
    const t = this._componentFrequency.get(e) ?? 0;
    t > 1 ? this._componentFrequency.set(e, t - 1) : this._componentFrequency.delete(e);
  }
  /**
   * @description
   * Получает редкость указанного типа компонента.
   *
   * @param component Компонент, для которого запрашивается редкость.
   */
  static rarity(e) {
    return this._componentFrequency.get(e) ?? 0;
  }
  /**
   * @description
   * Сортирует массив типов компонентов по их редкости.
   *
   * @param components Массив типов компонентов для сортировки.
   * @returns Отсортированный массив типов компонентов.
   */
  static sortByRarity(e) {
    return [...e].sort((t, s) => this.rarity(t) - this.rarity(s));
  }
};
v._componentFrequency = /* @__PURE__ */ new Map();
let h = v;
class C {
  constructor() {
    this._entities = /* @__PURE__ */ new Map();
  }
  /**
   * @description
   * Добавляет новую сущность в хранилище.
   * Проверяет уникальность UUID сущности.
   *
   * @param entity Сущность для добавления в хранилище.
   * @throws {Error} Если сущность с таким UUID уже существует.
   */
  addEntity(e) {
    const { uuid: t, name: s } = e;
    if (this._entities.has(t))
      throw new Error(`Entity with UUID [${s}-${t}] already exists in the storage.`);
    this._entities.set(t, e);
  }
  /**
   * @description
   * Удаляет сущность из хранилища по её UUID.
   *
   * @param uuid UUID сущности для удаления.
   * @returns Удаленная сущность или undefined, если сущность не найдена.
   */
  removeEntity(e) {
    const t = this._entities.get(e);
    if (t)
      return this._entities.delete(e), t;
  }
  /**
   * @description
   * Получает сущность из хранилища по её UUID.
   *
   * @param uuid UUID искомой сущности.
   * @returns Найденная сущность или undefined, если сущность не найдена.
   */
  getEntity(e) {
    return this._entities.get(e);
  }
  /**
   * @description
   * Возвращает массив всех сущностей в хранилище.
   *
   * @returns Массив всех сущностей.
   */
  getAllEntities() {
    return Array.from(this._entities.values());
  }
  /**
   * @description
   * Возвращает массив всех активных сущностей (entity.active === true).
   *
   * @returns Массив активных сущностей.
   */
  getActiveEntities() {
    return Array.from(this._entities.values()).filter((e) => e.active);
  }
  /**
   * @description
   * Возвращает массив всех неактивных сущностей (entity.active === false).
   *
   * @returns Массив неактивных сущностей.
   */
  getInactiveEntities() {
    return Array.from(this._entities.values()).filter((e) => !e.active);
  }
  /**
   * @description
   * Фильтрует сущности по заданным критериям компонентов.
   * Использует ComponentsRaritySorter для оптимизации порядка проверки компонентов.
   *
   * @param filter Критерии фильтрации с обязательными (includes) и исключающими (excludes) компонентами.
   * @param withDisabled Если true, фильтрует все сущности, включая неактивные. По умолчанию false.
   * @returns Объект Filtered с отфильтрованными сущностями.
   */
  filter(e, t) {
    let s = t ? this.getAllEntities() : this.getActiveEntities();
    if (e.excludes || (e.excludes = []), e != null && e.includes.length || e != null && e.excludes.length) {
      const i = h.sortByRarity(e.includes), n = e.excludes.length ? h.sortByRarity(e.excludes) : void 0, r = A(i, n);
      s = s.filter(r);
    }
    return new D(s);
  }
}
class $ {
  constructor(e, t, s, i, n) {
    this._id = e, this._systemsContainer = t, this._groupsContainer = s, this._entityStorage = i, this._name = n, this._queue = [], this._currentSystem = null, this._isPaused = !1, this._resumePromise = null, this._resolveResume = null, this._abortController = null;
  }
  /**
   * @description Уникальный идентификатор очереди выполнения.
   */
  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  /**
   * @description
   * Настраивает очередь для выполнения Групп Систем.
   * Создает инстансы Групп и подготавливает Системы к выполнению.
   * 
   * @param groups Массив конструкторов Групп.
   * @param data Данные для передачи в Группы.
   */
  setup(e, t) {
    this._queue = this.getExecutionQueue(e, t);
  }
  async execute(e = !0) {
    this._abortController = new AbortController();
    try {
      for (; this._queue.length > 0 && (this._isPaused && await this.waitForResume(), !this._abortController.signal.aborted); ) {
        const t = this._queue.shift();
        if (t && t.canExecute()) {
          const i = { includes: t.includes, excludes: t.excludes };
          t.system.setContext(t.groupId, t.executionId, this._entityStorage), u.instance.getDependencyForSystem(t.groupId, t.system), this._currentSystem = t.system;
          const n = t.system.run(t.data, i, t.withDisabled);
          if (n instanceof Promise)
            if (e)
              await Promise.race([
                n,
                new Promise((r, c) => {
                  this._abortController.signal.addEventListener("abort", () => {
                    c(new Error("Queue execution was stopped"));
                  });
                })
              ]);
            else throw new Error(`Execution of asynchronous system '${t.system.constructor.name}' in queue '${this.name}' is prohibited!`);
          this._currentSystem = null;
        }
      }
    } catch (t) {
      if (t instanceof Error && t.message === "Queue execution was stopped")
        return;
      throw t;
    }
  }
  /**
   * @description Останавливает все группы.
   */
  stop() {
    var e;
    this._queue = [], (e = this._currentSystem) == null || e.forceStop(), this._abortController && (this._abortController.abort(), this._abortController = null);
  }
  /**
   * @description Ставит все группы на паузу.
   */
  pause() {
    this._isPaused || (this._isPaused = !0);
  }
  /**
   * @description Возобновляет выполнение всех групп.
   */
  resume() {
    this._isPaused && (this._isPaused = !1, this._resolveResume && (this._resolveResume(), this._resolveResume = null, this._resumePromise = null));
  }
  /**
   * @description
   * Создает Promise для ожидания возобновления очереди.
   * Используется при постановке на паузу.
   * 
   * @returns Promise, который разрешится при возобновлении.
   */
  waitForResume() {
    return this._resumePromise || (this._resumePromise = new Promise((e) => {
      this._resolveResume = e;
    })), this._resumePromise;
  }
  /**
   * @description
   * Создает очередь выполнения из Групп Систем.
   * Создает инстансы Групп, получает Системы из кэша.
   * 
   * @param ctors Массив конструкторов Групп.
   * @param data Данные для передачи в Группы.
   * @returns Массив элементов очереди для выполнения.
   */
  getExecutionQueue(e, t) {
    const s = e.map((n) => this._groupsContainer.get(n)), i = [];
    return s.forEach((n) => {
      const r = n.sorted(t), c = n.uuid;
      r.forEach((l) => {
        const d = this._systemsContainer.get(l.instance.system);
        for (let p = 0; p < l.repeat; p++)
          i.push({
            ...l,
            groupId: c,
            data: l.instance.data,
            executionId: this._id,
            system: d
          });
      });
    }), i;
  }
}
class x {
  constructor(e, t, s) {
    this._systemsContainer = e, this._groupsContainer = t, this._entityStorage = s, this._queues = /* @__PURE__ */ new Map();
  }
  /**
   * @description Получает массив ID активных очередей
   * @returns Массив ID очередей, которые в данный момент выполняются
   */
  get activeQueues() {
    return Array.from(this._queues.keys());
  }
  /**
   * @description Получает текущее количество активных очередей
   */
  get queueSize() {
    return this._queues.size;
  }
  /**
   * @description Creates and sets up a new execution queue.
   * The queue is created, configured with systems, but not started.
   * Use this when you need to prepare queues before execution or need fine-grained control.
   * 
   * @example
   * ```typescript
   * // Create named queues for better debugging
   * const physicsQueueId = controller.create([PhysicsGroup], gameState, 'physics');
   * const renderQueueId = controller.create([RenderGroup], gameState, 'render');
   * 
   * // Later start them in specific order
   * await controller.run(physicsQueueId);
   * await controller.run(renderQueueId);
   * ```
   * 
   * @param groups Array of system group constructors to be executed by this queue
   * @param data Data to be passed to the systems
   * @param name Optional name for the queue, useful for debugging. Defaults to 'unnamed'
   * @returns ID of the created queue, can be used for further queue management
   */
  create(e, t, s = "unnamed") {
    const i = new $(
      a.uuid(),
      this._systemsContainer,
      this._groupsContainer,
      this._entityStorage,
      s
    );
    return i.setup(e, t), this._queues.set(i.id, i), i.id;
  }
  /**
   * @description Executes a previously created queue identified by its ID.
   * The queue must have been created using the create() method.
   * After execution completes, the queue is automatically removed.
   * 
   * @example
   * ```typescript
   * // Create and run a queue
   * const queueId = controller.create([LoadingGroup], gameState, 'loader');
   * await controller.run(queueId);
   * 
   * // Queue is automatically removed after completion
   * console.log(controller.hasQueue(queueId)); // false
   * ```
   * 
   * @param queueId ID of the queue to execute, obtained from create()
   * @throws Error if queue with provided ID is not found
   * @returns Promise that resolves when all systems have finished executing
   */
  async run(e, t = !0) {
    const s = this._queues.get(e);
    if (!s)
      throw new Error(`Queue with id ${e} not found`);
    await s.execute(t), this._queues.delete(s.id);
  }
  /**
   * @description Останавливает выполнение очереди и удаляет её.
   * Текущая Система будет принудительно остановлена.
   * 
   * @param executionId ID очереди для остановки
   */
  stop(e) {
    const t = this._queues.get(e);
    t && (t.stop(), this._queues.delete(e));
  }
  /**
   * @description Ставит очередь на паузу.
   * Выполнение приостановится после завершения текущей Системы.
   * 
   * @param executionId ID очереди для паузы
   */
  pause(e) {
    const t = this._queues.get(e);
    t && t.pause();
  }
  /**
   * @description Возобновляет выполнение приостановленной очереди.
   * 
   * @param executionId ID очереди для возобновления
   */
  resume(e) {
    const t = this._queues.get(e);
    t && t.resume();
  }
  /**
   * @description Останавливает и удаляет все очереди.
   * Все текущие Системы будут принудительно остановлены.
   */
  stopAll() {
    this._queues.forEach((e) => {
      e.stop();
    }), this._queues.clear();
  }
  /**
   * @description Ставит все очереди на паузу.
   * Каждая очередь приостановится после завершения текущей Системы.
   */
  pauseAll() {
    this._queues.forEach((e) => {
      e.pause();
    });
  }
  /**
   * @description Возобновляет выполнение всех приостановленных очередей.
   */
  resumeAll() {
    this._queues.forEach((e) => {
      e.resume();
    });
  }
  /**
   * @description Проверяет наличие очереди с указанным ID
   * @param executionId ID очереди для проверки
   */
  hasQueue(e) {
    return this._queues.has(e);
  }
  /**
   * @description Получает статус конкретной очереди
   * @param executionId ID очереди для проверки
   * @returns Объект статуса очереди или null, если очередь не найдена
   */
  getQueueStatus(e) {
    const t = this._queues.get(e);
    return t ? { isPaused: t._isPaused } : null;
  }
}
class k {
  constructor(e = []) {
    this._existingProviders = e, this._providers = [], this._providers = [...e];
  }
  /**
   * @description
   * Возвращает массив настроенных групп
   * 
   * @returns Массив настроенных групп
   */
  get providers() {
    return [...this._providers];
  }
  /**
   * @description
   * Добавляет группу в конец списка
   * @param group Класс группы
   * @param id Идентификатор группы (опционально)
   */
  add(e, t) {
    const s = t || a.uuid();
    return this._providers.push({ id: s, group: e }), this;
  }
  /**
   * @description
   * Добавляет группу в начало списка
   * @param group Класс группы
   * @param id Идентификатор группы (опционально)
   */
  prepend(e, t) {
    const s = t || a.uuid();
    return this._providers.unshift({ id: s, group: e }), this;
  }
  /**
   * @description
   * Вставляет группу перед указанной группой
   * @param targetId Идентификатор целевой группы
   * @param group Класс группы для вставки
   * @param id Идентификатор новой группы (опционально)
   */
  insertBefore(e, t, s) {
    const i = this._providers.findIndex((n) => n.id === e);
    if (i >= 0) {
      const n = s || a.uuid();
      this._providers.splice(i, 0, { id: n, group: t });
    }
    return this;
  }
  /**
   * @description
   * Вставляет группу после указанной группы
   * @param targetId Идентификатор целевой группы
   * @param group Класс группы для вставки
   * @param id Идентификатор новой группы (опционально)
   */
  insertAfter(e, t, s) {
    const i = this._providers.findIndex((n) => n.id === e);
    if (i >= 0) {
      const n = s || a.uuid();
      this._providers.splice(i + 1, 0, { id: n, group: t });
    }
    return this;
  }
  /**
   * @description
   * Заменяет указанную группу
   * @param targetId Идентификатор группы для замены
   * @param group Новый класс группы
   */
  replace(e, t) {
    const s = this._providers.findIndex((i) => i.id === e);
    return s >= 0 && (this._providers[s] = { id: e, group: t }), this;
  }
  /**
   * @description
   * Удаляет указанную группу
   * @param targetId Идентификатор группы для удаления
   */
  remove(e) {
    const t = this._providers.findIndex((s) => s.id === e);
    return t >= 0 && this._providers.splice(t, 1), this;
  }
}
class _ {
  constructor(e) {
    this._executionController = e, this._pairs = /* @__PURE__ */ new Map(), this._disposables = /* @__PURE__ */ new Map(), this._executionIds = [];
  }
  /**
   * @description
   * Настраивает связи между Signal и Группами Систем.
   * Можно привязать несколько Групп к одному Signal.
   * 
   * @param configs Массив конфигураций связей Signal-Группа.
   */
  setup(e) {
    for (let t of e) {
      const s = this._pairs.get(t.signal) || [], i = t.groups.map((n) => ({ id: a.uuid(), group: n }));
      s.push(...i), this._pairs.set(t.signal, s);
    }
  }
  /**
   * @description
   * Активирует подписки на все настроенные Signal.
   * При срабатывании Signal запускает связанные Группы в ExecutionController.
   */
  subscribe() {
    this.unsubscribe();
    for (const e of this._pairs.keys())
      this._subscribeSignal(e);
  }
  /**
   * @description
   * Отключает все подписки на Signal и останавливает выполнение Групп.
   * Используется при остановке или перезапуске приложения.
   */
  unsubscribe() {
    this._disposables.forEach((e) => e.dispose()), this._disposables.clear(), this._executionIds.forEach((e) => this._executionController.stop(e)), this._executionIds.length = 0;
  }
  /**
   * @description
   * Настраивает связь между сигналом и группами систем
   * @param signal Сигнал
   * @param configurator Функция конфигурации
   */
  configure(e, t) {
    var n;
    this._disposables.has(e) && ((n = this._disposables.get(e)) == null || n.dispose(), this._disposables.delete(e));
    const s = this._pairs.get(e) || [], i = new k(s);
    t(i), this._pairs.set(e, i.providers), this._subscribeSignal(e);
  }
  _subscribeSignal(e) {
    const s = (this._pairs.get(e) || []).map((n) => n.group), i = e.subscribe((n) => {
      const r = this._executionController.create(s, n, e.name);
      this._executionController.run(r), this._executionIds.push(r);
    });
    this._disposables.set(e, i);
  }
}
class j {
  constructor(e, t, s, i) {
    this._uuid = e, this._timerController = t, this._onComplete = s, this._duration = i, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  update(e) {
    this._elapsedTime += e * 1e3, this._elapsedTime >= this._duration && (this._onComplete(), this._timerController.clear(this.uuid));
  }
}
class O {
  constructor(e, t, s) {
    this._uuid = e, this._onComplete = t, this._duration = s, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  onComplete() {
    return this._onComplete;
  }
  update(e) {
    this._elapsedTime += e * 1e3, this._elapsedTime >= this._duration && (this._elapsedTime = 0, this._onComplete());
  }
}
class G {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  /**
   * @description
   * Разрешает все Promise в массиве одним и тем же значением.
   * @param deferred Массив DeferredPromise для разрешения
   * @param data Значение, которым будут разрешены все Promise
   */
  static resolveAll(e, t) {
    e.forEach((s) => s.resolve(t));
  }
  /**
   * @description
   * Отклоняет все Promise в массиве с одной и той же причиной.
   * @param deferred Массив DeferredPromise для отклонения
   * @param reason Причина отклонения
   */
  static rejectAll(e, t) {
    e.forEach((s) => s.reject(t));
  }
  /**
   * @description
   * Возвращает Promise, который разрешится, когда все Promise в массиве будут разрешены.
   * @param deferred Массив DeferredPromise для ожидания
   * @returns Promise с массивом результатов
   */
  static all(e) {
    return Promise.all(e.map((t) => t.promise));
  }
  /**
   * @description
   * Возвращает Promise, который разрешится, когда все Promise в массиве будут завершены (разрешены или отклонены).
   * @param deferred Массив DeferredPromise для ожидания
   * @returns Promise с массивом результатов
   */
  static allSettled(e) {
    return Promise.allSettled(e.map((t) => t.promise));
  }
  /**
   * @description
   * Возвращает Promise, который разрешится, когда любой из Promise в массиве будет разрешён.
   * @param deferred Массив DeferredPromise для гонки
   * @returns Promise с результатом первого разрешённого Promise
   */
  static race(e) {
    return Promise.race(e.map((t) => t.promise));
  }
}
class y {
  constructor() {
    this._updatables = /* @__PURE__ */ new Map();
  }
  /**
   * @description
   * Создает новый таймер, который выполнит колбэк после указанной задержки.
   * @param callback Функция, которая будет вызвана по завершению таймера
   * @param duration Длительность таймера в миллисекундах
   * @returns ID созданного таймера
   */
  setTimeout(e, t) {
    const s = a.uuid(), i = new j(s, this, e, t);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description
   * Создает новый интервал, который будет периодически выполнять колбэк.
   * @param callback Функция, которая будет вызываться на каждом тике интервала
   * @param duration Период интервала в миллисекундах
   * @returns ID созданного интервала
   */
  setInterval(e, t) {
    const s = a.uuid(), i = new O(s, e, t);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description
   * Создает новую задержку выполнения кода.
   * @param duration Длительность задержки в миллисекундах
   * @returns Объект с методами `wait` и `resolve`. Метод `wait` возвращает Promise, который разрешится после указанной задержки.
   * Метод `resolve` немедленно разрешает Promise и удаляет таймер из контроллера.
   */
  sleep(e) {
    const t = new G(), s = this.setTimeout(() => t.resolve(), e);
    return {
      id: s,
      wait: async () => await t.promise,
      resolve: () => {
        t.resolve(), this.clear(s);
      }
    };
  }
  /**
   * @description
   * Останавливает таймер или интервал по его ID.
   * @param uuid ID таймера или интервала
   */
  clear(e) {
    this._updatables.has(e) && this._updatables.delete(e);
  }
  /**
   * @description
   * Обновляет все таймеры и интервалы.
   * @param deltaTime Время между кадрами в миллисекундах
   */
  update(e) {
    Array.from(this._updatables.values()).forEach((s) => s.update(e));
  }
}
class S {
  /**
   * @description
   * Создаёт новый сигнал.
   * @param name - Имя сигнала. Необязательное поле, используется для отладки.
   */
  constructor(e = "Signal") {
    this._name = e, this.listeners = [], this._uuid = a.uuid();
  }
  /**
   * @description
   * Имя сигнала. Необязательное поле, используется для отладки.
   */
  get name() {
    return this._name;
  }
  /**
   * @description
   * Уникальный идентификатор сигнала.
   */
  get uuid() {
    return this._uuid;
  }
  /**
   * @description Подписывается на сигнал.
   * @param callback - Функция, которая будет вызвана при отправке сигнала.
   * @returns - Объект, который можно использовать для отписки от сигнала.
   */
  subscribe(e) {
    return this.listeners.push({ callback: e, once: !1 }), {
      dispose: () => {
        this.unsubscribe(e);
      }
    };
  }
  /**
   * @description Подписывается на сигнал только один раз.
   * @param callback - Функция, которая будет вызвана при отправке сигнала.
   * @returns - Объект, который можно использовать для отписки от сигнала.
   */
  once(e) {
    return this.listeners.push({ callback: e, once: !0 }), {
      dispose: () => {
        this.unsubscribe(e);
      }
    };
  }
  /**
   * @description Отписывается от сигнала.
   * @param callback - Функция, которая была подключена к сигналу.
   */
  unsubscribe(e) {
    this.listeners = this.listeners.filter((t) => t.callback !== e);
  }
  /**
   * @description Отправляет сигнал.
   * @param data - Данные, которые будут переданы в функции обратного вызова.
   */
  async dispatch(e) {
    const t = [], s = [];
    for (const i of this.listeners) {
      const n = i.callback(e);
      n instanceof Promise && s.push(n), i.once && t.push(i.callback);
    }
    await Promise.all(s), t.length > 0 && (this.listeners = this.listeners.filter((i) => !t.includes(i.callback)));
  }
}
const U = new S(), Q = new S();
class m {
  constructor() {
    this._lastTime = 0, this._paused = !1, this._speedMultiplier = 1, this._onUpdate = [], this._onStart = [], this.animate = (e) => {
      if (!this._paused) {
        if (this._lastTime !== 0) {
          const t = (e - this._lastTime) / 1e3;
          this.update(t);
        }
        this._lastTime = e, requestAnimationFrame(this.animate);
      }
    };
  }
  /**
   * @description
   * Запускает игру, вызывая все зарегистрированные колбэки старта
   * и отправляя сигнал OnStartSignal. 
   * Запускает requestAnimationFrame для начала обновлений.
   */
  start() {
    this._onStart.forEach((e) => e()), U.dispatch(), requestAnimationFrame(this.animate);
  }
  /**
   * @description
   * Добавляет колбэк, который будет вызван при старте игры.
   * @param callback Функция для выполнения при старте
   */
  addStartCallback(e) {
    this._onStart.push(e);
  }
  /**
   * @description
   * Добавляет колбэк, который будет вызываться каждый кадр.
   * @param callback Функция для выполнения каждый кадр, получает deltaTime в секундах
   */
  addUpdateCallback(e) {
    this._onUpdate.push(e);
  }
  /**
   * @description
   * Удаляет ранее добавленный колбэк обновления.
   * @param callback Функция для удаления
   */
  removeUpdateCallback(e) {
    this._onUpdate = this._onUpdate.filter((t) => t !== e);
  }
  /**
   * @description
   * Ставит игру на паузу или возобновляет её выполнение.
   * @param paused true для паузы, false для возобновления
   */
  pause(e) {
    this._paused = e;
  }
  /**
   * @description
   * Устанавливает множитель скорости игры.
   * @param speedMultiplier Множитель скорости (1 - нормальная скорость, <1 - замедление, >1 - ускорение)
   */
  setSpeedMultiplier(e) {
    this._speedMultiplier = e;
  }
  update(e) {
    if (this._paused) return;
    const t = e * this._speedMultiplier;
    this._onUpdate.forEach((s) => s(t)), Q.dispatch({
      deltaTime: e,
      speedMultiplier: this._speedMultiplier,
      multipliedDelta: t
    });
  }
}
class B {
  /**
   * @description
   * Инициализирует все модули приложения.
   * Создает и регистрирует все необходимые сервисы.
   */
  init() {
    this.registerServices();
    const e = u.instance.get(m), t = u.instance.get(y);
    e.addUpdateCallback((s) => {
      t.update(s);
    });
  }
  /**
   * @description
   * Запускает приложение, инициируя жизненный цикл.
   */
  start() {
    u.instance.get(m).start();
  }
  /**
   * @description
   * Устанавливает связи между сигналами и группами систем.
   * @param configs Конфигурации связей между сигналами и группами
   */
  listenSignals(e) {
    u.instance.get(_).setup(e);
  }
  /**
   * @description
   * Более тонкая настрйока связей между Signal и Группами Систем.
   * ПОзволяет переопределять существующие связи.
   * 
   * @param signal Signal для настройки
   * @param configuratorFn Функция настройки связей Signal-Группа
   */
  configureSignal(e, t) {
    u.instance.get(_).configure(e, t);
  }
  /**
   * @description
   * Активирует подписки на все настроенные Signal.
   * При срабатывании Signal запускает связанные Группы в ExecutionController.
   */
  subscribe() {
    u.instance.get(_).subscribe();
  }
  /**
   * @description
   * Регистрирует глобальные сервисы в контейнере зависимостей.
   * @param providers Массив провайдеров сервисов
   */
  registerGlobalServices(e) {
    u.instance.registerGlobal(e);
  }
  /**
   * @description
   * Создает и регистрирует основные сервисы приложения:
   * - EntityStorage для хранения сущностей
   * - SystemsContainer для кэширования систем
   * - LifeCycle для управления жизненным циклом
   * - TimerController для управления таймерами
   * - ExecutionController для управления выполнением систем
   * - SignalsController для управления сигналами
   */
  registerServices() {
    const e = new C(), t = new w(), s = new T(), i = new m(), n = new y(), r = new x(t, s, e), c = new _(r);
    this.registerGlobalServices([
      { provide: C, useFactory: () => e },
      { provide: w, useFactory: () => t },
      { provide: m, useFactory: () => i },
      { provide: y, useFactory: () => n },
      { provide: x, useFactory: () => r },
      { provide: _, useFactory: () => c }
    ]);
  }
}
class E {
  constructor() {
    this._items = [];
  }
  /**
   * @description
   * Список всех компонентов в коллекции.
   * @returns Массив компонентов.
   */
  get items() {
    return this._items;
  }
  /**
   * @description
   * Добавляет компонент в коллекцию.
   * Не проверяет наличие дубликатов, это должно контролироваться на уровне Entity.
   * 
   * @param component Компонент для добавления в коллекцию.
   */
  set(e) {
    this._items.push(e);
  }
  /**
   * @description
   * Получает компонент указанного типа из коллекции.
   * Использует instanceof для проверки типа.
   * 
   * @param type Конструктор компонента для поиска.
   * @returns Найденный компонент или undefined, если не найден.
   */
  get(e) {
    return this._items.find((t) => t instanceof e);
  }
  /**
   * @description
   * Проверяет наличие компонента указанного типа в коллекции.
   * 
   * @param type Конструктор компонента для проверки.
   * @returns true, если компонент найден, иначе false.
   */
  has(e) {
    return !!this.get(e);
  }
  /**
   * @description
   * Удаляет компонент указанного типа из коллекции.
   * Создает новый массив без удаляемого компонента.
   * 
   * @param type Конструктор компонента для удаления.
   * @returns true, если компонент был найден и удален, иначе false.
   */
  delete(e) {
    const t = this.get(e);
    return t && (this._items = this.items.filter((s) => s.constructor !== e)), !!t;
  }
  /**
   * @description
   * Очищает коллекцию, удаляя все компоненты.
   * Использует оптимизированный способ очистки массива.
   */
  clear() {
    this._items.length = 0;
  }
}
class z {
  constructor(e, t = "Entity") {
    this._uuid = e, this._name = t, this._active = !0, this._components = new E(), this._disabledComponents = new E();
  }
  /**
   * @description
   * Уникальный идентификатор сущности.
   * Используется для однозначной идентификации сущности в игре.
   */
  get uuid() {
    return this._uuid;
  }
  /**
   * @description
   * Имя сущности.
   * Используется для удобной идентификации сущности человеком.
   */
  get name() {
    return this._name;
  }
  set name(e) {
    this._name = e;
  }
  /**
   * @description
   * Флаг активности сущности.
   * Определяет, должна ли сущность обрабатываться игровыми системами.
   */
  get active() {
    return this._active;
  }
  set active(e) {
    this._active = e;
  }
  /**
   * @description
   * Список всех активных компонентов, прикрепленных к сущности.
   * Включает только компоненты, которые в данный момент включены.
   */
  get components() {
    return this._components.items;
  }
  /**
   * @description
   * Список всех отключенных компонентов сущности.
   * Включает компоненты, которые временно деактивированы.
   */
  get disabledComponents() {
    return this._disabledComponents.items;
  }
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
  addComponent(e, t = !0) {
    const s = this.extractConstructor(e);
    if (this._components.has(s) || this._disabledComponents.has(s))
      throw new Error(
        `Component of type ${s.name} already exists in entity [${this._name}-${this._uuid}]`
      );
    t ? (this._components.set(e), h.increment(s)) : (this._disabledComponents.set(e), h.decrement(s));
  }
  /**
   * @description Получает компонент по его конструктору.
   * @param ctor Конструктор компонента.
   * @returns Экземпляр компонента.
   * @throws {Error} Если компонент не найден в сущности.
   */
  getComponent(e) {
    const t = this._components.get(e);
    if (!t)
      throw new Error(
        `Component of type ${e.name} is not found in [${this.name}-${this.uuid}].`
      );
    return t;
  }
  /**
   * @description Проверяет, имеет ли сущность все указанные компоненты.
   * @param types Массив конструкторов компонентов для проверки.
   * @returns true, если сущность имеет все указанные компоненты, иначе false.
   */
  hasComponents(e) {
    return e.every((t) => !!this._components.get(t));
  }
  /**
   * @description Удаляет компонент из сущности.
   * Может удалить как активный, так и отключенный компонент.
   * @param ctor Конструктор компонента для удаления.
   * @returns Удаленный экземпляр компонента.
   * @throws {Error} Если компонент не найден в сущности.
   */
  removeComponent(e) {
    let t;
    if (this._components.has(e) ? (t = this._components.get(e), this._components.delete(e)) : this._disabledComponents.has(e) && (t = this._disabledComponents.get(e), this._disabledComponents.delete(e)), !t)
      throw new Error(
        `Component type ${e.name} does not exist in entity [${this._name}-${this._uuid}]`
      );
    return h.decrement(e), t;
  }
  /**
   * @description
   * Включает ранее отключенный компонент.
   * Перемещает компонент из списка отключенных в список активных.
   *
   * @param ctor Конструктор компонента для включения.
   * @throws {Error} Если компонент не существует или уже включен.
   */
  enableComponent(e) {
    if (!this._disabledComponents.has(e))
      throw new Error(
        `Cannot enable component of type ${e.name} - it does not exist or is already enabled.`
      );
    const t = this._disabledComponents.get(e);
    this._disabledComponents.delete(e), this._components.set(t), h.increment(e);
  }
  /**
   * @description
   * Отключает компонент.
   * Перемещает компонент из списка активных в список отключенных.
   *
   * @param ctor Конструктор компонента для отключения.
   * @throws {Error} Если компонент не существует или уже отключен.
   */
  disableComponent(e) {
    if (!this._components.has(e))
      throw new Error(
        `Cannot disable component of type ${e.name} - it does not exist or is already disabled.`
      );
    const t = this._components.get(e);
    this._components.delete(e), this._disabledComponents.set(t), h.decrement(e);
  }
  /**
   * @description
   * Отключает все компоненты сущности.
   * Перемещает все компоненты из активного списка в список отключенных.
   */
  disableAllComponents() {
    for (const e of this._components.items)
      this._disabledComponents.set(e), h.decrement(e.constructor);
    this._components.clear();
  }
  /**
   * @description
   * Включает все ранее отключенные компоненты.
   * Перемещает все компоненты из списка отключенных в список активных.
   */
  enableAllComponents() {
    for (const e of this._disabledComponents.items)
      this._components.set(e), h.increment(e.constructor);
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
  isSatisfiedFilter(e) {
    const t = e.includes || [], s = e.excludes || [];
    return this.hasComponents(t) && (!s.length || !this.hasComponents(s));
  }
  extractConstructor(e) {
    return e.constructor;
  }
}
export {
  h as ComponentsRaritySorter,
  G as DeferredPromise,
  B as EmpressCore,
  z as Entity,
  C as EntityStorage,
  x as ExecutionController,
  D as Filtered,
  T as GroupsContainer,
  R as Inject,
  m as LifeCycle,
  U as OnStartSignal,
  Q as OnUpdateSignal,
  u as ServiceContainer,
  S as Signal,
  k as SignalChain,
  _ as SignalsController,
  I as System,
  F as SystemChain,
  M as SystemGroup,
  w as SystemsContainer,
  y as TimerController,
  a as Utils
};
