import React from "react";
import { useEffect } from "react";
import useGraph from "../../modules/Graph/useGraph";
import UI2D from "./UI2D/UI2D";
import Graph from "../../modules/Graph/Graph";

export type TF = (x: number) => number;

export type TFunction = {
    f: TF;
    color: string;
    width: number;
}

const Graph2D: React.FC = () => {

    const WIN = {
        LEFT: -10,
        BOTTOM: -10,
        WIDTH: 20,
        HEIGHT: 20
    }
    let graph: Graph | null = null;
    const [getGraph, cancelGraph] = useGraph(render);

    const funcs: TFunction[] = [];
    let canMove = false;

    const wheel = (event: WheelEvent ) => {
        const ZOOM_STEP = 0.2;
        let delta = (event.deltaY < 0) ? -ZOOM_STEP : ZOOM_STEP;
        if (WIN.WIDTH + delta > 0) {
            WIN.WIDTH += delta;
            WIN.HEIGHT += delta;
            WIN.LEFT -= delta / 2;
            WIN.BOTTOM -= delta / 2;
        }
    };

    const mouseup = () => {
        canMove = false;
    };

    const mouseleave = () => {
        canMove = false;
    };

    const mousedown = () => {
        canMove = true;
    };

    const mousemove = (event: any) => {
        if (canMove && graph) {
            WIN.LEFT -= graph.sx(event.movementX);
            WIN.BOTTOM -= graph.sy(event.movementY);
        }
    };

    const printOXY = (): void => {
        if (!graph) {
            return;
        }
        //сеточька
        for (let i = 1; i < WIN.WIDTH - WIN.LEFT; i++) {
            graph.line(-i, WIN.BOTTOM, -i, WIN.HEIGHT + WIN.BOTTOM, '#dbaeb5');
        }
        for (let i = 1; i < WIN.LEFT + WIN.WIDTH; i++) {
            graph.line(i, WIN.BOTTOM + WIN.HEIGHT, i, WIN.BOTTOM, '#dbaeb5');
        }
        for (let i = 1; i < WIN.HEIGHT + WIN.BOTTOM; i++) {
            graph.line(WIN.LEFT + WIN.WIDTH, i, WIN.LEFT, i, '#dbaeb5');
        }
        for (let i = 1; i < WIN.HEIGHT - WIN.BOTTOM; i++) {
            graph.line(WIN.LEFT + WIN.WIDTH, -i, WIN.LEFT, -i, '#dbaeb5');
        }

        //ось OX
        graph.line(WIN.LEFT, 0, WIN.LEFT + WIN.WIDTH, 0);
        //ось OY
        graph.line(0, WIN.BOTTOM + WIN.HEIGHT, 0, WIN.BOTTOM);

        //рисочки
        for (let i = 1; i < WIN.LEFT + WIN.WIDTH; i++) {
            graph.line(i, -0.1, i, 0.1)
            graph.text(i - 0.1, -0.7, `${i}`, "12px arial")
        }
        for (let i = 1; i > WIN.LEFT; i--) {
            graph.line(i, -0.1, i, 0.1)
            if (i < 0) {
                graph.text(i - 0.2, -0.7, `${i}`, "12px arial")
            }
        }
        for (let i = 1; i < WIN.HEIGHT + WIN.BOTTOM; i++) {
            graph.line(-0.1, i, 0.1, i)
            if (i > 0) {
                graph.text(-0.8, i - 0.2, `${i}`, "12px arial")
            }
        }
        for (let i = 1; i < WIN.HEIGHT - WIN.BOTTOM; i++) {
            graph.line(-0.1, -i, 0.1, -i)
            if (i > 0) {
                graph.text(-0.9, - i - 0.2, '-' + i, "12px arial")
            }
        }

        //стрелочьки
        //стрелка на оси Х
        graph.line(WIN.LEFT + WIN.WIDTH, 0, WIN.LEFT + WIN.WIDTH - 0.2, -0.2)
        graph.line(WIN.LEFT + WIN.WIDTH, 0, WIN.LEFT + WIN.WIDTH - 0.2, 0.2)

        //стрелка на оси У
        graph.line(0, WIN.BOTTOM + WIN.HEIGHT, - 0.2, WIN.BOTTOM + WIN.HEIGHT - 0.2)
        graph.line(0, WIN.HEIGHT + WIN.BOTTOM, 0.2, WIN.BOTTOM + WIN.HEIGHT - 0.2)
    };

    const printFunction = (f: TF, color: string, strWidth: number, n = 200): void => {
        if (!graph){
            return;
        }
        let x = WIN.LEFT;
        const dx = WIN.WIDTH / n;
        while (x <= WIN.WIDTH + WIN.LEFT) {
            graph.line(
                x, 
                f(x), 
                x + dx, 
                f(x + dx), 
                color, 
                strWidth, 
            );
            x += dx;
        };
    };

    //подписывание графика
    const printFunctionText = (f: TF): void => {
        if (!graph) {
            return;
        }
        let text = f.toString();
        text = text.substr(text.indexOf('return'), text.length)
            .replaceAll('return', '')
            .replaceAll('\n', '')
            .replaceAll(' ', '')
            .replaceAll(';}', '')
            .replaceAll('}', '')
            .replaceAll(';', '')
            .replaceAll('Math.', '');
        graph.text(3, 3, 'y = ' + text, "17px arial", 'black');
    };

    //рендер.
    function render(FPS: number): void {
        if (!graph) {
            return;
        }
        graph.clear();
        printOXY();
        funcs.forEach(func => 
            func && printFunction(func.f, func.color, func.width)
        );
    };

    //поиск нуля функции 
    function getZero(f: TF, a: number, b: number, eps = 0.0001): number | null | undefined {
        if (f(a) * f(b) > 0) { return null; }
        if (Math.abs(f(a) - f(b)) <= eps) {
            return (a + b) / 2;
        }
        const half = (a + b) / 2;
        if (f(a) * f(half) <= 0) {
            return getZero(f, a, half, eps);
        }
        if (f(half) * f(b) <= 0) {
            return getZero(f, half, b, eps);
        }
    };

    useEffect(() => {
        // @ts-ignore
        graph = getGraph({
            WIN,
            id: 'canvas',
            width: 500,
            height: 500,
            callbacks: { wheel, mousemove, mouseleave, mouseup, mousedown }
        });
    
        return () => {
            cancelGraph();
        }
    });

    return (<div className="beautyDiv">
        <div>
            <canvas id='canvas' width='300' height='300' />
        </div>
        <UI2D funcs={funcs} />
    </div>);
}

export default Graph2D;