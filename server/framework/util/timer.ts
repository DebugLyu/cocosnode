import { Job, JobCallback, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from "node-schedule";
import schedule = require("node-schedule");

class Timer {
    dt: number = 0;
    private updateTimer: Job | undefined;
    private timerList: Job[] = [];
    private updateList: Function[] = [];

    private dayChangeTimer: Job | undefined;
    private dayChangeFunc: Function[] = [];

    start() {
        this.updateTimer = schedule.scheduleJob('*/1 * * * * *', () => {
            this.dt++;
            for (const func of this.updateList) {
                func(this.dt);
            }
        });

        this.dayChangeTimer = schedule.scheduleJob('* * 0 * * *', () => {
            for (const func of this.dayChangeFunc) {
                func();
            }
        });
    }

    stop() {
        this.updateTimer?.cancel();
    }

    on(rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number, callback: JobCallback) {
        let job = schedule.scheduleJob(rule, callback);
        this.timerList.push(job);
        return this.timerList.length - 1;
    }

    off(id: number) {
        let job = this.timerList[id];
        job.cancel();
        this.timerList.splice(id, 1);
    }

    onUpdate(callback: Function) {
        this.updateList.push(callback);
    }

    offUpdate(id: number) {
        this.updateList.splice(id, 1);
    }

    onDayChange(func: Function) {
        this.dayChangeFunc.push(func);
    }


}

let timer = new Timer();

export default timer;