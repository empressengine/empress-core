import { Disposable } from './types';

export interface ISignal<T = any> {
    uuid: string;
    name: string | undefined;
    subscribe(callback: (data: T) => void): Disposable;
    once(callback: (data: T) => void): Disposable;
    unsubscribe(callback: (data: T) => void): void;
    dispatch(data: T): void;
}
