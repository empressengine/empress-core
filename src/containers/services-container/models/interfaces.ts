import { Constructor, Factory, Token } from "./types";

export interface ClassProvider<T = any> {
    provide: Token<T>;
    useClass: Constructor<T> | T;
    immutable?: boolean;
  }
  
  export interface FactoryProvider<T = any> {
    provide: Token<T>;
    useFactory: Factory<T>;
    immutable?: boolean;
  }