import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { PaintBucketCommand } from '@app/classes/paint-bucker-command';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}
const RGBA_NUMBER_OF_COMPONENTS = 4;
const MAX_8BIT_NBR = 255;
const MIN_TOLERANCE = 0;
const MAX_TOLERANCE = 100;

@Injectable({
    providedIn: 'root',
})
export class PaintBucketService extends Tool {
    tolerance: number;
    constructor(drawingService: DrawingService, protected invoker: UndoRedoService) {
        super(drawingService);
        this.tolerance = MIN_TOLERANCE;
        this.toolAttributes = ['tolerance'];
    }

    onRightClick(event: MouseEvent): void {
        this.invoker.setIsAllowed(false);
        const mousePosition = this.getPositionFromMouse(event);
        const newImgData = this.fillNonContiguousArea(mousePosition);
        this.drawingService.baseCtx.putImageData(newImgData, 0, 0);
        this.invoker.setIsAllowed(true);
        const cmd = new PaintBucketCommand(newImgData, this.drawingService);
        this.invoker.addToUndo(cmd);
    }

    onClick(event: MouseEvent): void {
        this.invoker.setIsAllowed(false);
        const mousePosition = this.getPositionFromMouse(event);
        const newImgData = this.fillContiguousArea(mousePosition);
        this.drawingService.baseCtx.putImageData(newImgData, 0, 0);
        const cmd = new PaintBucketCommand(newImgData, this.drawingService);
        this.invoker.setIsAllowed(true);
        this.invoker.addToUndo(cmd);
    }

    setPrimaryColor(color: string): void {
        this.primaryColor = color;
    }

    setTolerance(tolerance: number): void {
        if (tolerance >= MIN_TOLERANCE && tolerance <= MAX_TOLERANCE) this.tolerance = tolerance;
    }

    private fillNonContiguousArea(position: Vec2): ImageData {
        const startingColor: Color = this.getActualColor(position);
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += RGBA_NUMBER_OF_COMPONENTS) {
            if (this.areColorsMatching(startingColor, imageData, i)) {
                this.fillPixel(imageData, i);
            }
        }
        return imageData;
    }

    private fillContiguousArea(position: Vec2): ImageData {
        const startingColor: Color = this.getActualColor(position);
        const pixelStack = [position];
        const canvas: HTMLCanvasElement = this.drawingService.canvas;
        const ctx: CanvasRenderingContext2D = this.drawingService.baseCtx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let newPosition: Vec2;
        let pixelPosition: number;

        const startingPixelPosition: number = (position.y * canvas.width + position.x) * RGBA_NUMBER_OF_COMPONENTS;
        const isColorTheSame: boolean = this.areColorsMatching(this.hexToColor(this.primaryColor), imageData, startingPixelPosition);

        if (isColorTheSame) {
            return imageData;
        }
        while (pixelStack.length) {
            newPosition = pixelStack.pop() as Vec2;
            pixelPosition = (newPosition.y * canvas.width + newPosition.x) * RGBA_NUMBER_OF_COMPONENTS;

            while (newPosition.y-- >= 0 && this.areColorsMatching(startingColor, imageData, pixelPosition)) {
                pixelPosition -= canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
            pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            ++newPosition.y;
            let isLeftReached = false;
            let isRightReached = false;
            while (newPosition.y++ < canvas.height - 1 && this.areColorsMatching(startingColor, imageData, pixelPosition)) {
                this.fillPixel(imageData, pixelPosition);
                if (newPosition.x > 0) {
                    if (this.areColorsMatching(startingColor, imageData, pixelPosition - RGBA_NUMBER_OF_COMPONENTS)) {
                        if (!isLeftReached) {
                            pixelStack.push({ x: newPosition.x - 1, y: newPosition.y });
                            isLeftReached = true;
                        }
                    } else if (isLeftReached) {
                        isLeftReached = false;
                    }
                }
                if (newPosition.x < canvas.width - 1) {
                    if (this.areColorsMatching(startingColor, imageData, pixelPosition + RGBA_NUMBER_OF_COMPONENTS)) {
                        if (!isRightReached) {
                            pixelStack.push({ x: newPosition.x + 1, y: newPosition.y });
                            isRightReached = true;
                        }
                    } else if (isLeftReached) {
                        isRightReached = false;
                    }
                }
                pixelPosition += canvas.width * RGBA_NUMBER_OF_COMPONENTS;
            }
        }
        return imageData;
    }

    protected areColorsMatching(color: Color, imageData: ImageData, position: number): boolean {
        let areColorsMatching = true;
        const tolerance = this.toleranceToRGBAValue();
        const pixelRed = imageData.data[position];
        const pixelGreen = imageData.data[position + 1];
        const pixelBlue = imageData.data[position + 2];

        areColorsMatching = areColorsMatching && pixelRed >= color.red - tolerance && pixelRed <= color.red + tolerance;
        areColorsMatching = areColorsMatching && pixelGreen >= color.green - tolerance && pixelGreen <= color.green + tolerance;
        areColorsMatching = areColorsMatching && pixelBlue >= color.blue - tolerance && pixelBlue <= color.blue + tolerance;
        return areColorsMatching;
    }

    private toleranceToRGBAValue(): number {
        return (this.tolerance / MAX_TOLERANCE) * MAX_8BIT_NBR;
    }

    protected fillPixel(imageData: ImageData, position: number): void {
        const color: Color = this.hexToColor(this.primaryColor);
        imageData.data[position] = color.red;
        imageData.data[position + 1] = color.green;
        imageData.data[position + 2] = color.blue;
    }
}
