import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { Command } from './command';

const MOUSE_POSITION_OFFSET_DIVIDER = 10;
const IMAGES_PER_POINT = 5;
const MAX_EIGHT_BIT_NB = 255;

export class BrushCommand extends Command {
    private pathData: Vec2[] = [];
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private lineWidht: number;
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: BrushService, protected drawingService: DrawingService) {
        super();
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.lineWidht = this.tool.lineWidth;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }

    drawLineCommand(startPos: Vec2, endPos: Vec2): void {
        this.drawingService.baseCtx.beginPath();
        const dist = this.tool.distanceBetween2Points(startPos, endPos);
        const angle = this.tool.angleBetween2Points(startPos, endPos);
        let k = 0;
        const image = this.tool.makeBaseImage();
        do {
            const x = startPos.x + Math.sin(angle) * k - this.tool.image.width / MOUSE_POSITION_OFFSET_DIVIDER;
            const y = startPos.y + Math.cos(angle) * k - this.tool.image.height / MOUSE_POSITION_OFFSET_DIVIDER;
            this.drawingService.baseCtx.globalAlpha = this.tool.color.opacity / MAX_EIGHT_BIT_NB;
            this.drawingService.baseCtx.drawImage(image, x, y, this.tool.lineWidth, this.tool.lineWidth);
            k += IMAGES_PER_POINT;
        } while (k < dist);
        this.drawingService.baseCtx.closePath();
    }
    // maybe i will add some methode
    execute(): void {
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.lineWidth = this.lineWidht;
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.drawLineCommand(this.pathData[i], this.pathData[i + 1]);
        }
    }
}