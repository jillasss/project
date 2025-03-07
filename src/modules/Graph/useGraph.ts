import Graph, { TGraph } from "./Graph";

/*window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();*/

var requestAnimFrame: (callback: ()=> void) => number = (function (){
    return window.requestAnimationFrame ||
        (<any>window).window.webkitRequestAnimationFrame ||
        (<any>window).window.mozRequestAnimationFrame ||
        (<any>window).window.oRequestAnimationFrame ||
        (<any>window).window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

const useGraph = (
    renderScene: (FPS: number) => void
): [(options: TGraph) => Graph, () => void ] => {
    let graph = null;
    let currentFPS = 0;
    let FPS = 0;
    let timestamp = Date.now();
    let id: number;

    const animLoop = () => {
        FPS++;
        const currentTimestamp = Date.now();
        if (currentTimestamp - timestamp >= 1000) {
            timestamp = currentTimestamp;
            currentFPS = FPS;
            FPS = 0;
        }
        renderScene(currentFPS);
        id = requestAnimFrame(animLoop);
    }
    
    const getGraph = (options: TGraph) => {
        graph = new Graph(options);
        animLoop();
        return graph;
    }

    const cancelGraph = (): void => {
        window.cancelAnimationFrame(id);
        graph = null;
    }

    return [getGraph, cancelGraph];
}

export default useGraph;