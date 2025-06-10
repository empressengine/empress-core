import { IUpdatable } from './models';
import { TimerController } from './timer-controller';

export class Timer implements IUpdatable {
    public get uuid(): string {
        return this._uuid;
    }

    private _elapsedTime: number = 0;

    constructor(
        private _uuid: string,
        private _timerController: TimerController,
        private _onComplete: () => void,
        private _duration: number,
    ) {}

    public update(deltaTime: number): void {
        this._elapsedTime += deltaTime * 1000;
        if (this._elapsedTime >= this._duration) {
            this._onComplete();
            this._timerController.clear(this.uuid);
        }
    }
}
