import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleCommand } from '../../../classes/rectangleCommand';
import { UndoRedoService } from '../../undo-redo/undo-redo.service';
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum RectangleStyle {
    Empty = 0,
    Filled_contour = 1,
    Filled = 2,
}

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    toSquare: boolean = false;
    isOut: boolean = false;
    currentPos: Vec2;
    rectangleStyle: RectangleStyle;
    isSelection: boolean = false;
    lineDash: boolean;
    width: number;
    height: number;
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.toolAttributes = ['strokeWidth', 'rectangleStyle'];
        this.rectangleStyle = 2;
        this.lineWidth = 1;
        this.primaryColor = '#000000';
        this.secondaryColor = '#000000';
        this.lineDash = false;
    }

    setStyle(id: number): void {
        this.rectangleStyle = id;
    }

    onMouseDown(event: MouseEvent, isSelection: boolean = false): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            if (!isSelection) {
                this.invoker.ClearRedo();
                this.invoker.setIsAllowed(false);
            }
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    setLineWidth(width: number): void {
        this.lineWidth = width;
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }
    setSecondaryColor(color: string): void {
        this.secondaryColor = color;
    }
    onMouseOut(event: MouseEvent): void {
        if (this.mouseDown) {
            this.isOut = true;

            this.mouseOutCoord = this.getPositionFromMouse(event);
            if (this.mouseOutCoord.x > this.drawingService.previewCtx.canvas.width) {
                this.mouseOutCoord.x = this.drawingService.canvas.width;
            } else if (this.mouseOutCoord.x < 0) {
                this.mouseOutCoord.x = 0;
            }
            if (this.mouseOutCoord.y > this.drawingService.previewCtx.canvas.height) {
                this.mouseOutCoord.y = this.drawingService.canvas.height;
            } else if (this.mouseOutCoord.y < 0) {
                this.mouseOutCoord.y = 0;
            }
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.mouseOutCoord, this.toSquare);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        this.isOut = false;
    }

    onMouseUp(event: MouseEvent, isSelection: boolean = false): void {
        if (this.mouseDown) {
            let mousePosition = this.getPositionFromMouse(event);
            if (this.isOut) mousePosition = this.mouseOutCoord;
            this.drawRectangle(this.drawingService.baseCtx, this.mouseDownCoord, mousePosition, this.toSquare);
            if (!isSelection) {
                const cmd = new RectangleCommand(
                    this.mouseDownCoord,
                    mousePosition,
                    this.rectangleStyle,
                    this,
                    this.drawingService,
                ) as RectangleCommand;
                console.log(cmd);
                this.invoker.addToUndo(cmd);
                this.invoker.setIsAllowed(true);
            }
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.mouseDown = false;
        this.toSquare = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentPos = this.getPositionFromMouse(event);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey && this.mouseDown) {
            this.toSquare = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.shiftKey && this.mouseDown) {
            this.toSquare = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mouseDownCoord, this.currentPos, this.toSquare);
        }
    }

    drawRectangle(ctx: CanvasRenderingContext2D, startPos: Vec2, currentPos: Vec2, toSquare: boolean): void {
        let width = currentPos.x - startPos.x;
        let height = currentPos.y - startPos.y;
        if (toSquare) {
            if (Math.abs(width) > Math.abs(height)) {
                width = height * Math.sign(height) * Math.sign(width);
            } else {
                height = width * Math.sign(width) * Math.sign(height);
            }
        }
        this.width = width;
        this.height = height;
        ctx.beginPath();
        if (!this.lineDash) ctx.setLineDash([0, 0]);
        else ctx.setLineDash([5, 15]);

        ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = this.lineWidth;

        switch (this.rectangleStyle) {
            case 0:
                ctx.rect(startPos.x, startPos.y, width - (this.lineWidth / 2) * Math.sign(width), height - (this.lineWidth / 2) * Math.sign(height));
                ctx.stroke();
                break;
            case 1:
                ctx.rect(startPos.x, startPos.y, width - (this.lineWidth / 2) * Math.sign(width), height - (this.lineWidth / 2) * Math.sign(height));
                ctx.stroke();
                ctx.fill();
                break;
            case 2:
                ctx.rect(startPos.x, startPos.y, width, height);
                ctx.fill();
                break;
        }

        ctx.closePath();
    }
}
