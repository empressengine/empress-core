import { Signal } from "@shared/signal";

/**
 * @description
 * Данные, передаваемые в сигнал обновления.
 */
export interface IUpdateLoopData {
    deltaTime: number;
    speedMultiplier: number;
    multipliedDelta: number;
}

/**
 * @description
 * Сигнал, отправляемый при старте игры.
 * Используется для выполнения групп систем при старте.
 */
export const OnStartSignal = new Signal<void>();

/**
 * @description
 * Сигнал, отправляемый каждый кадр.
 * Используется для выполнения групп систем при обновлении.
 */
export const OnUpdateSignal = new Signal<IUpdateLoopData>();