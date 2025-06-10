import { ISystem } from '@logic/system';
import { ISystemGroup } from './interfaces';

export type SystemData<T extends ISystem<any>> = T extends ISystem<infer U> ? U : never;

export type GroupType<T> = new (...args: any[]) => ISystemGroup<T>;

export type GroupData<T extends ISystemGroup> = T extends ISystemGroup<infer U> ? U : never;
