import { Injectable } from '@angular/core';
import { Const } from '@app/classes/constants';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class SprayPaintService extends Tool {
    radius: number = Const.DEFAULT_RADIUS;
    dropletRadius: number = 1;
    period: number = (1 / Const.DEFAULT_FREQUENCY) * Const.MULTIPLICATIONFACTOR;
    interval: NodeJS.Timeout;
    currentMousePos: Vec2;
    density: number = Const.DENSITY;

    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['sprayWidth', 'sprayInterval', 'dropletsWidth'];
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;

        if (this.mouseDown) {
            this.currentMousePos = this.mouseDownCoord = this.getPositionFromMouse(event);
            this.interval = setInterval(() => {
                this.spray(this.drawingService.baseCtx, this.currentMousePos);
            }, this.period);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.myClearInterval(this.interval);
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentMousePos = this.getPositionFromMouse(event);
        }
    }

    onMouseOut(event: MouseEvent): void {
        this.myClearInterval(this.interval);
    }

    myClearInterval(interval: NodeJS.Timeout): void {
        clearInterval(interval);
    }

    onMouseEnter(event: MouseEvent): void {
        if (this.mouseDown) {
            this.interval = setInterval(() => {
                this.spray(this.drawingService.baseCtx, this.currentMousePos);
            }, this.period);
        }
    }

    spray(ctx: CanvasRenderingContext2D, position: Vec2): void {
        ctx.lineCap = 'round';
        for (let i = 0; i < this.density; i++) {
            const offset = this.getRandomOffset();
            const x = position.x + offset.x;
            const y = position.y + offset.y;
            ctx.beginPath();
            ctx.arc(x, y, this.dropletRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = ctx.strokeStyle = this.primaryColor;
            ctx.fill();
            ctx.stroke();
        }
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    getRandomOffset(): Vec2 {
        const randomAngle = Math.random() * Const.FULL_CIRCLE;
        const randomRadius = Math.random() * this.radius;

        return {
            x: Math.cos(randomAngle) * randomRadius,
            y: Math.sin(randomAngle) * randomRadius,
        };
    }

    setDropletsWidth(radius: number): void {
        this.dropletRadius = radius;
    }

    setfrequency(freq: number): void {
        this.period = (1 / freq) * Const.MULTIPLICATIONFACTOR;
    }

    setRadius(radius: number): void {
        this.radius = radius;
    }
}
