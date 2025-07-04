import { GroupType, SystemGroup } from '@containers/system-group';

export class GroupsContainer  {
    private _cache: Map<GroupType<any>, SystemGroup<any>> = new Map();

    public get(ctor: GroupType<any>): SystemGroup<any> {
        let item = this._cache.get(ctor);
        if (!item) {
            item = new ctor() as SystemGroup<any>;
            item.registerGroupDependencies();
            this._cache.set(ctor, item);
        }

        return item;
    }

    public set(ctor: GroupType<any>, item: SystemGroup<any>): void {
        this._cache.set(ctor, item);
    }

    public has(ctor: GroupType<any>): boolean {
        return this._cache.has(ctor);
    }

    public remove(ctor: GroupType<any>): void {
        this._cache.delete(ctor);
    }
}
