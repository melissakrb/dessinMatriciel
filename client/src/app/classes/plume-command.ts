import { DrawingService } from '@app/services/drawing/drawing.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { Command } from './command';
import { Vec2 } from './vec2';

export class PLumeCommand extends Command {
    private pathData: Vec2[] = [];
    private lineWidht: number;
    private primaryColor: string;
    private secondaryColor: string;
    private opacity: number;
    private angle: number;
    private lineLenght: number;
    isResize: boolean = false;

    constructor(pathData: Vec2[], protected tool: PlumeService, protected drawingService: DrawingService) {
        super();
        this.lineWidht = this.tool.lineWidth;
        this.primaryColor = this.tool.primaryColor;
        this.secondaryColor = this.tool.secondaryColor;
        this.opacity = this.tool.opacity;
        this.angle = this.tool.angle;
        this.lineLenght = this.tool.lineLenght;
        for (const point of pathData) {
            this.pathData.push(point);
        }
    }
    execute(): void {
        this.tool.lineWidth = this.lineWidht;
        this.tool.primaryColor = this.primaryColor;
        this.tool.secondaryColor = this.secondaryColor;
        this.tool.opacity = this.opacity;
        this.tool.angle = this.angle;
        this.tool.lineLenght = this.lineLenght;
        this.tool.drawLine(this.drawingService.baseCtx, this.pathData);
    }
}
