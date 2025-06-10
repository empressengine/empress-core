import { ISystemInstance } from "@containers/system-group";
import { ISystem } from "@logic/system";

export interface IQueueItem extends ISystemInstance {
    groupId: string;
    system: ISystem<any>;
    executionId: string;
}