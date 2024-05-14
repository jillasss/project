import { TWIN3D } from "../Graph/Graph";
import { Point, Polygon, Surface } from "./entites";
import { EDistance } from "./entites/Polygon";


type TMath3D = {
    WIN: TWIN3D;
}

export type TMatrix = number[][];

type TVector = number[];

type TShadow = {
    isShadow: boolean;
    dark?: number;
}

export enum ETransform {
    zoom = 'zoom',
    move = 'move',
    rotateOx = 'rotateOx',
    rotateOy = 'rotateOy',
    rotateOz = 'rotateOz'
}

class Math3D {
    WIN: TWIN3D;
    constructor( {WIN} :TMath3D) {
        this.WIN = WIN;
    }
    

    xs(point:Point):number {
        const zs = this.WIN.CENTER.z;
        const z0 = this.WIN.CAMERA.z;
        const x0 = this.WIN.CAMERA.x;
        return (point.x - x0) / (point.z - z0) * (zs - z0) + x0;
    }

    ys(point:Point):number {
        const zs = this.WIN.CENTER.z;
        const z0 = this.WIN.CAMERA.z;
        const y0 = this.WIN.CAMERA.y;
        return (point.y - y0) / (point.z - z0) * (zs - z0) + y0;
    }

    multPoint(T:TMatrix, m:number[]):number[] {
        const a : number[] = [0, 0, 0, 0];
        for (let i = 0; i < T.length; i++) {
            let b = 0;
            for (let j = 0; j < m.length; j++) {
                b += T[j][i] * m[j];
            }
            a[i] = b;
        }
        return a;
    }

    multMatrix(a:TMatrix, b:TMatrix):TMatrix {
        let c: TMatrix = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    c[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return c;
    }

    [ ETransform.zoom](delta:number):number[][] {
        return [
            [delta, 0, 0, 0],
            [0, delta, 0, 0],
            [0, 0, delta, 0],
            [0, 0, 0, 1]
        ];
    }

    move(dx:number = 0, dy:number = 0, dz:number = 0):number[][] {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [dx, dy, dz, 1]
        ];
    }

    [ETransform.rotateOx](alpha:number):TMatrix {
        return [
            [1, 0, 0, 0],
            [0, Math.cos(alpha), Math.sin(alpha), 0],
            [0, -Math.sin(alpha), Math.cos(alpha), 0],
            [0, 0, 0, 1]
        ];
    }

    [ETransform.rotateOy](alpha:number):TMatrix {
        return [
            [Math.cos(alpha), 0, -Math.sin(alpha), 0],
            [0, 1, 0, 0],
            [Math.sin(alpha), 0, Math.cos(alpha), 0],
            [0, 0, 0, 1]
        ];
    }

    [ETransform.rotateOz](alpha:number):TMatrix {
        return [
            [Math.cos(alpha), Math.sin(alpha), 0, 0],
            [-Math.sin(alpha), Math.cos(alpha), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    sortByArtistAlgorithm(polygons:Polygon[]):void {
        polygons.sort((a, b) => b.distance - a.distance);
    }

    calcDistance(surface: Surface, endPoint: Point, name: EDistance): void {
        surface.polygons.forEach(polygon => {
            let x = 0, y = 0, z = 0;
            polygon.points.forEach(index => {
                x += surface.points[index].x;
                y += surface.points[index].y;
                z += surface.points[index].z;
            });
            x /= polygon.points.length;
            y /= polygon.points.length;
            z /= polygon.points.length;
            polygon[name] = Math.sqrt((endPoint.x - x) ** 2 + (endPoint.y - y) ** 2 + (endPoint.z - z) ** 2);
        });
    }


    calcIllumination(distance:number, lumen:number):number {
        const illum = distance ? lumen / distance ** 2 : 1;
        return illum > 1 ? 1 : illum;
    }


    calcShadow(polygon: Polygon, scene: Surface[], LIGHT: Point): { isShadow: boolean; dark?:number} {
        const M1 = polygon.center;
        const result = { isShadow: false,dark:1 };
        const r = polygon.R;
        const S = this.getVector(M1, LIGHT);
        scene.forEach((surface, index) => {
            if (polygon.index === index) return;
            surface.polygons.forEach(polygon2 => {
                const M0 = polygon2.center;
                if (M1.x === M0.x && M1.y === M0.y && M1.z === M0.z) return;
                if (polygon2.lumen > polygon.lumen) return;
                const dark = this.modulVector(
                    this.multVector
                        (this.getVector(M0, M1), S
                        )
                ) / this.modulVector(S);
                if (dark < r) {
                    result.isShadow = true;
                    result.dark = 0.7;
                }
            });
        });
        return result
    }

    transform(matrix:number[][], point:Point):void {
        const result = this.multPoint(matrix, [point.x, point.y, point.z, 1]);
        point.x = result[0];
        point.y = result[1];
        point.z = result[2];
    }

    getTransform(...args:[][][]):number[][] {
        return args.reduce(
            (S:number[][], t:number[][]) => this.multMatrix(S, t),
            [[1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]]
        );
    }

    getVector(a:Point, b:Point){
        return {
            x: b.x - a.x,
            y: b.y - a.y,
            z: b.z - a.z,
        }
    }

    multVector(a:Point, b:Point) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: -a.x * b.z + a.z * b.x,
            z: a.x * b.y - a.y * b.x
        }
    }

    modulVector(a:Point):number{
        return Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
    }

    scalVector(a:Point,b:Point):number {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }


}
export default Math3D;