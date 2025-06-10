import { ClassProvider, FactoryProvider } from "./interfaces";

export type Constructor<T = any> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);

export type Factory<T = any> = () => T;

export type Token<T = any> = Constructor<T> | symbol;

export type Provider<T = any> = ClassProvider<T> | FactoryProvider<T>;