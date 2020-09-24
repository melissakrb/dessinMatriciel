import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;

    mouseOutCoord: Vec2;
    currentPos: Vec2;
    isOut: boolean = false;
    width: number;
    height: number;
    opacity: number;
    primaryColor: string; // by default black
    secondaryColor: Color = { red: 0, green: 0, blue: 0 }; //  by default black

    constructor(protected drawingService: DrawingService) {}

    setMouseDown(bool: boolean): void {
        this.mouseDown = bool;
    }

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}
    onMouseOut(event: MouseEvent): void {}
    onMouseEnter(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}
    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    hexToColor(hex: string): Color {
        // tslint:disable:no-magic-numbers
        console.log(hex);
        console.log('red slice', hex.slice(1, 3));
        console.log('green slice', hex.slice(3, 5));
        console.log('blue slice', hex.slice(5, 7));

        const redNum = parseInt(hex.slice(1, 3), 16);
        const greenNum = parseInt(hex.slice(3, 5), 16);
        const blueNum = parseInt(hex.slice(5, 7), 16);

        const color: Color = { red: redNum, green: greenNum, blue: blueNum };
        console.log(color);
        return color;
    }
}
