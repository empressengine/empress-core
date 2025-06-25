import { GroupType } from "@containers/system-group";
import { IGroupWithId } from "./models";
import { Utils } from "@shared/utils";

export class SignalChain {

    /**
     * @description
     * Возвращает массив настроенных групп
     * 
     * @returns Массив настроенных групп
     */
    public get providers(): IGroupWithId[] {
        return [...this._providers];
    }

    private _providers: IGroupWithId[] = [];

    constructor(private _existingProviders: IGroupWithId[] = []) {
        this._providers = [..._existingProviders];
    }

    /**
     * @description
     * Добавляет группу в конец списка
     * @param group Класс группы
     * @param id Идентификатор группы (опционально)
     */
    public add(group: GroupType<any>, id?: string): SignalChain {
        const groupId = id || Utils.uuid();
        this._providers.push({ id: groupId, group });
        return this;
    }

    /**
     * @description
     * Добавляет группу в начало списка
     * @param group Класс группы
     * @param id Идентификатор группы (опционально)
     */
    public prepend(group: GroupType<any>, id?: string): SignalChain {
        const groupId = id || Utils.uuid();
        this._providers.unshift({ id: groupId, group });
        return this;
    }

    /**
     * @description
     * Вставляет группу перед указанной группой
     * @param targetId Идентификатор целевой группы
     * @param group Класс группы для вставки
     * @param id Идентификатор новой группы (опционально)
     */
    public insertBefore(targetId: string, group: GroupType<any>, id?: string): SignalChain {
        const index = this._providers.findIndex(g => g.id === targetId);
        if (index >= 0) {
            const groupId = id || Utils.uuid();
            this._providers.splice(index, 0, { id: groupId, group });
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
    public insertAfter(targetId: string, group: GroupType<any>, id?: string): SignalChain {
        const index = this._providers.findIndex(g => g.id === targetId);
        if (index >= 0) {
            const groupId = id || Utils.uuid();
            this._providers.splice(index + 1, 0, { id: groupId, group });
        }
        return this;
    }

    /**
     * @description
     * Заменяет указанную группу
     * @param targetId Идентификатор группы для замены
     * @param group Новый класс группы
     */
    public replace(targetId: string, group: GroupType<any>): SignalChain {
        const index = this._providers.findIndex(g => g.id === targetId);
        if (index >= 0) {
            this._providers[index] = { id: targetId, group };
        }
        return this;
    }

    /**
     * @description
     * Удаляет указанную группу
     * @param targetId Идентификатор группы для удаления
     */
    public remove(targetId: string): SignalChain {
        const index = this._providers.findIndex(g => g.id === targetId);
        if (index >= 0) {
            this._providers.splice(index, 1);
        }
        return this;
    }
    
}