export interface IUpdatable {
    uuid: string;
    update(deltaTime: number): void;
}

export interface ISleep {
    id: string;
    wait(): Promise<void>;
    resolve(): void;
}

export interface ITimerController {
    setTimeout(callback: () => void, duration: number): string;
    setInterval(callback: () => void, duration: number): string;
    sleep(duration: number): ISleep;
    clear(uuid: string): void;
    update(deltaTime: number): void;
}
