import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSelectChange } from '@angular/material/select';
import { Tool } from '@app/classes/tool';
import { ToolsManagerService } from '@app/services/tools-manager/tools-manager.service';
import { BrushService } from '@app/services/tools/brush/brush.service';
import { GridService } from '@app/services/tools/grid/grid.service';
import { Arguments, PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PlumeService } from '@app/services/tools/plume/plume.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { Subscription } from 'rxjs';

const MAX_WIDTH_VALUE = 100;
const MAX_DROPLETS_WIDTH_VALUE = 10;
const MAX_FREQUENCY_VALUE = 999;
const IMAGE_ZOOM = 60;
const MAX_DEGREE = 360;
const MAX_INPUT_POSITIVE_LENGTH = 3;
const MAX_INPUT_NEGATIVE_LENGTH = 4;

const PIPETTE_IMAGE_WIDTH = 10;
const PIPETTE_IMAGE_HEIGHT = 10;
const PIPETTE_IMAGE_OFFSET_Y = -5;
const PIPETTE_IMAGE_OFFSET_X = 3;
const RECT_STROKE = 4;
const RECT_SIZE = 5;

@Component({
    selector: 'app-attributebar',
    templateUrl: './attributebar.component.html',
    styleUrls: ['./attributebar.component.scss'],
})
export class AttributeBarComponent implements OnInit, AfterViewChecked, AfterViewInit {
    widthValue: string;
    dropletsWidthValue: string = '1';
    frequency: string = '700';
    radius: string = '20';
    lenghtValue: string = '50';
    angleValue: string = '0';
    junctionWidth: string = '1';
    idStyleRectangle: number = 2;
    idStyleBrush: number = 1;
    degreeValue: string;
    tolerance: string = '0';
    squareSize: string = '25';
    opacity: string = '50';
    leftStampFactorValue: number;
    rightStampFactorValue: number;
    selectedValue: string;
    polices: string[] = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Comic Sans MS, cursive', 'Trebuchet MS, Helvetica'];
    circleIsShown: boolean = true;
    showStamps: boolean = true;
    @ViewChild('pipette', { static: false }) pipetteCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('stampIcon') stampIcon: ElementRef<HTMLElement>;

    pipetteCtx: CanvasRenderingContext2D;
    currentStamp: string = '../../../assets/Stamps/Poop Emoji.png';
    currentTexture: string = '../../../assets/b1.svg';
    subscription: Subscription;
    constructor(private tools: ToolsManagerService, private pipetteService: PipetteService, private plumeService: PlumeService) {
        this.degreeValue = '0';
        this.leftStampFactorValue = 1;
        this.rightStampFactorValue = 1;
        this.onClick();
    }
    private showContainer: boolean = false;
    private lastTool: Tool = this.tools.currentTool;

    ngOnInit(): void {
        this.widthValue = this.tools.currentTool.lineWidth.toString();
        this.subscription = this.plumeService.getMessage().subscribe((message: string) => {
            this.angleValue = message;
        });
    }

    onClick(): void {
        this.pipetteService.getColorObservable().subscribe((isPrimary: boolean) => {
            this.pickColor(isPrimary);
        });
    }
    toggleStampsList(): void {
        (this.tools.currentTool as StampService).getStampObs().next();
    }
    ngAfterViewChecked(): void {
        this.displayCircle();
    }
    setStampSize(value: number, isRightSide: boolean): void {
        isRightSide ? (this.rightStampFactorValue = value) : (this.leftStampFactorValue = value);
        (this.tools.currentTool as StampService).setStampSize(this.leftStampFactorValue, this.rightStampFactorValue);
    }
    displayCircle(): void {
        this.pipetteService.getCircleViewObservable().subscribe((isShown: boolean) => {
            this.circleIsShown = isShown;
        });
    }
    setDegree(degree: number): void {
        degree %= MAX_DEGREE;
        this.degreeValue = degree.toString(10);
        (this.tools.currentTool as StampService).setDegree(degree);
    }
    ngAfterViewInit(): void {
        this.pipetteService.getPipetteObservable().subscribe((arg: Arguments) => {
            this.pipetteCtx = this.pipetteCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.drawImage(arg);
            this.drawPixelContour();
        });
    }
    pickColor(isPrimary: boolean): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        const data = this.pipetteCtx.getImageData(width + 2, height + RECT_STROKE, 1, 1);
        this.tools.setColor('#' + this.pipetteService.rgbaToHex(this.pipetteService.getColorFromData(data)), isPrimary);
    }
    drawPixelContour(): void {
        const height = this.pipetteCanvas.nativeElement.height / 2;
        const width = this.pipetteCanvas.nativeElement.width / 2;
        this.pipetteCtx.beginPath();
        this.pipetteCtx.strokeStyle = 'red';
        this.pipetteCtx.strokeRect(width - 1, height + 1, RECT_SIZE, RECT_SIZE);
    }
    drawImage(arg: Arguments): void {
        const x = arg.event.offsetX;
        const y = arg.event.offsetY;
        this.pipetteCtx.clearRect(0, 0, this.pipetteCanvas.nativeElement.width, this.pipetteCanvas.nativeElement.height);
        this.pipetteCtx.imageSmoothingEnabled = false;
        this.pipetteCtx.imageSmoothingQuality = 'high';
        this.pipetteCtx.drawImage(
            arg.image,
            Math.abs(x - PIPETTE_IMAGE_OFFSET_X),
            Math.abs(y + PIPETTE_IMAGE_OFFSET_Y),
            PIPETTE_IMAGE_WIDTH,
            PIPETTE_IMAGE_HEIGHT,
            0,
            PIPETTE_IMAGE_OFFSET_Y,
            IMAGE_ZOOM,
            IMAGE_ZOOM,
        );
    }
    setFontStyle(style: MatButtonToggleChange): void {
        let tmpStyle = '';
        style.value.forEach((fontStyle: string) => {
            tmpStyle += fontStyle + ' ';
        });
        (this.tools.currentTool as TextService).setFontStyle(tmpStyle);
    }
    setAllignement(allignement: MatSelectChange): void {
        (this.tools.currentTool as TextService).setAllignement(allignement.value);
    }
    setFontFamily(fontFamily: MatSelectChange): void {
        (this.tools.currentTool as TextService).setFontText(fontFamily.value);
    }
    changeStyle(styleToChangeId: string, styleId: number): void {
        const shapeStyle = document.querySelector('#style' + styleId) as HTMLElement;
        const currentStyle = document.querySelector('#' + styleToChangeId) as HTMLElement;

        if (shapeStyle && currentStyle) {
            currentStyle.style.borderColor = window.getComputedStyle(shapeStyle).borderColor;
            currentStyle.style.backgroundColor = window.getComputedStyle(shapeStyle).backgroundColor;
            currentStyle.style.borderStyle = window.getComputedStyle(shapeStyle).borderStyle;
            currentStyle.style.borderWidth = window.getComputedStyle(shapeStyle).borderWidth;
        }
    }

    restoreValues(): void {
        if (this.tools.currentTool.lineWidth) this.widthValue = this.tools.currentTool.lineWidth.toString();
    }

    validate(event: KeyboardEvent): void {
        const WIDTH_ALLOWED_CHARS_REGEXP = /\b[0-9]+\b/;
        const target = event.target as HTMLInputElement;
        if (target.selectionStart === 0 && this.checkIfContainAttribute('stamp')) {
            target.maxLength = event.key === '-' ? MAX_INPUT_NEGATIVE_LENGTH : MAX_INPUT_POSITIVE_LENGTH;
            return;
        }
        if (event.key !== 'Backspace' && event.key !== 'Enter' && !WIDTH_ALLOWED_CHARS_REGEXP.test(event.key)) {
            event.preventDefault();
        }
    }

    checkIfContainAttribute(attribute: string): boolean {
        if (this.tools.currentTool instanceof GridService)
            (this.tools.currentTool as GridService).getSizeObservable().subscribe((squareSize: string) => {
                this.squareSize = squareSize;
            });
        if (this.lastTool !== this.tools.currentTool) {
            this.lastTool = this.tools.currentTool;
            this.restoreValues();
        }
        if (this.tools.currentTool instanceof StampService) {
            this.currentStamp = (this.tools.currentTool as StampService).image.src;
            this.degreeValue = (this.tools.currentTool as StampService).degres.toString(10);
        }
        return this.tools.currentTool.toolAttributes.includes(attribute);
    }

    setJunctionWidth(input: string): void {
        this.junctionWidth = input;
        this.tools.setJunctionWidth(Number(this.junctionWidth));
    }

    setJunctionState(checkBoxValue: boolean): void {
        this.tools.setJunctionState(checkBoxValue);
    }

    setTolerance(input: string): void {
        this.tolerance = input;
        if (Number(this.tolerance) > MAX_WIDTH_VALUE) this.tolerance = '100';
        this.tools.setBucketTolerance(Number(this.tolerance));
    }
    setSquareSize(input: string): void {
        this.squareSize = input;
        if (Number(this.squareSize) > MAX_WIDTH_VALUE) this.squareSize = '100';
        (this.tools.currentTool as GridService).changeSquareSize(Number(this.squareSize));
    }

    setOpacity(input: string): void {
        this.opacity = input;
        if (Number(this.opacity) > MAX_WIDTH_VALUE) this.opacity = '100';
        (this.tools.currentTool as GridService).changeOpacity(Number(this.opacity));
    }

    toggleList(id: string): void {
        this.showContainer = !this.showContainer;
        const container = document.querySelector('#' + id) as HTMLElement;
        const icon = container.previousSibling?.lastChild as HTMLElement;
        if (this.showContainer) {
            if (container.id === 'styleContainer') container.style.display = 'flex';
            else container.style.display = 'table-cell';
            icon.innerHTML = 'expand_less';
        } else {
            container.style.display = 'none';
            icon.innerHTML = 'expand_more';
        }
    }

    setTexture(id: number): void {
        const brush = this.tools.currentTool as BrushService;
        brush.setTexture(id);
        this.currentTexture = '../../../assets/b' + id + '.svg';
    }

    setShapeStyle(idStyle: number, isEllipse: boolean): void {
        this.idStyleRectangle = idStyle;
        if (isEllipse) {
            this.changeStyle('currentEllipseStyle', idStyle);
            this.tools.setEllipseStyle(this.idStyleRectangle);
        } else {
            this.changeStyle('currentRectangleStyle', idStyle);
            this.tools.setRectangleStyle(this.idStyleRectangle);
        }
    }

    setNumberSides(newNumberSides: number): void {
        this.tools.setPolygonNumberSides(newNumberSides);
    }

    setDropletsWidth(input: string): void {
        this.dropletsWidthValue = input;
        if (Number(this.dropletsWidthValue) > MAX_DROPLETS_WIDTH_VALUE) this.dropletsWidthValue = '10';
        this.tools.setDropletsWidth(Number(this.dropletsWidthValue));
    }

    setFrequency(input: string): void {
        this.frequency = input;
        if (Number(this.frequency) > MAX_FREQUENCY_VALUE) this.frequency = '999';
        this.tools.setFrequency(Number(this.frequency));
    }

    setRadius(input: string): void {
        this.radius = input;
        if (Number(this.radius) > MAX_FREQUENCY_VALUE) this.radius = '70';
        this.tools.setRadius(Number(this.radius));
    }

    setLineLength(id: string): void {
        this.lenghtValue = id;
        if (Number(this.lenghtValue) > MAX_WIDTH_VALUE) this.lenghtValue = '100';
        const plume = this.tools.currentTool as PlumeService;
        plume.setLineLength(Number(this.lenghtValue));
    }

    setAngle(id: string): void {
        this.angleValue = id;
        const plume = this.tools.currentTool as PlumeService;
        plume.setAngle(Number(this.angleValue));
    }

    setLineWidth(input: string): void {
        this.widthValue = input;
        if (Number(this.widthValue) > MAX_WIDTH_VALUE) this.widthValue = '100';
        this.tools.setLineWidth(Number(this.widthValue));
    }
}
