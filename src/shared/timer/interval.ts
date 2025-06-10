import { IUpdatable } from './models';

export class Interval implements IUpdatable {
    public get uuid(): string {
        return this._uuid;
    }

    public onComplete(): () => void {
        return this._onComplete;
    }

    private _elapsedTime: number = 0;

    constructor(
        private _uuid: string,
        private _onComplete: () => void,
        private _duration: number,
    ) {}

    public update(deltaTime: number): void {
        this._elapsedTime += deltaTime * 1000;
        if (this._elapsedTime >= this._duration) {
            this._elapsedTime = 0;
            this._onComplete();
        }
    }
}
