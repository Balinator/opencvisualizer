import { TimeManager } from "./managers/TimeManager";
import { RenderLogic } from "./managers/RenderLogic";

function stopTime() {
    TimeManager.Instance.stop();
    $("#playPause").text("Play")
}

function startTime() {
    TimeManager.Instance.start();
    $("#playPause").text("Pause")
}

$(document).ready(() => {
    RenderLogic.Instance.initEditor();

    $("#animate").click(() => {
        (<HTMLElement>document.getElementById("myCanvas")).classList.remove("cursor-transparent");
        $("#animate").prop("disabled", true);
        RenderLogic.Instance.main();
    });

    let isContentShown = false;

    $("#toggle").click(function () {
        let panel: HTMLElement = <HTMLElement>document.getElementById("panel");
        if (isContentShown) {
            panel.classList.add("hidden");
        } else {
            panel.classList.remove("hidden");
        }
        isContentShown = !isContentShown;
    });

    $("#playPause").click(function () {
        if (TimeManager.Instance.isTimeStopped) {
            startTime();
        } else {
            stopTime();
        }
    });

    $("#next").click(function () {
        RenderLogic.Instance.setActionPoolNext();
    });

    $("#speed").ready(h => {
        $("#speed").get()[0].oninput = function (e) {
            RenderLogic.Instance.drawOptions.animationTime = parseInt((<HTMLInputElement><unknown>e.target).value);
        }
    })

    $("#nextBreak").click(function () {
        RenderLogic.Instance.setFastForward();
    })
});

export { stopTime, startTime };