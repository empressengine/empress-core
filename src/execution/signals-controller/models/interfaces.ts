import { GroupType } from "@containers/system-group";
import { ISignal } from "@shared/signal";

export interface ISignalConfig {
    signal: ISignal<any>;
    groups: GroupType<any>[];
}

export interface IGroupWithId {
    id: string;
    group: GroupType<any>;
}