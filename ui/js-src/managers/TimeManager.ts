class TimeManager {

    // MARK: properties

    private startTime: Date;
    private stopTime: Date;
    private preveiouslyElapsedTime: number = 0;
    private _isTimeStopped: boolean = false;

    get isTimeStopped(): boolean {
        return this._isTimeStopped;
    }

    // MARK: Singleton stuff

    private static _instance: TimeManager;

    private constructor() {
        this.startTime = new Date();
        this.stopTime = this.startTime;
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    // MARK: functions

    getTime(): number {
        if (this._isTimeStopped) {
            return this.preveiouslyElapsedTime;
        }
        return this.preveiouslyElapsedTime + (new Date().getTime() - this.startTime.getTime());
    }

    start(): void {
        if (this._isTimeStopped) {
            this.startTime = new Date();
            this._isTimeStopped = false;
        }
    }

    stop(): void {
        if (!this._isTimeStopped) {
            this._isTimeStopped = true;
            this.stopTime = new Date();
            this.preveiouslyElapsedTime += (this.stopTime.getTime() - this.startTime.getTime());
        }
    }
}

export { TimeManager };