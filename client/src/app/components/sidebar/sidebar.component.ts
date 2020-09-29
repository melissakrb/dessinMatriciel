import { Component /*, ElementRef*/ } from '@angular/core';
import { UserGuideComponent } from '@app/components/user-guide/user-guide.component';
import { ToolsManagerService } from '@app/services/toolsManger/tools-manager.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private tools: ToolsManagerService /*, private elRef: ElementRef*/) { }

    attributeBarIsActive: boolean = false;

    displayPalette(): void {

        this.attributeBarIsActive = !this.attributeBarIsActive;
        if (this.attributeBarIsActive) {
            this.togglecanvas('drawing-container-open');
            this.toggleAttributeBar('attribute-open');
        } else {
            this.togglecanvas('drawing-container');
            this.toggleAttributeBar('attribute-close');
        }
    }
    toggleAttributeBar(classname: string): void {
        document.querySelectorAll('#attribute').forEach((item) => {
            item.setAttribute('class', classname);

        });
        //console.log(document.querySelectorAll('app-color-picker'));
    }

    togglecanvas(classname: string): void {
        document.getElementById('drawing-div')?.setAttribute('class', classname);
    }

    changeTools(name: string): void {
        this.tools.setTools(name);
    }

    openUserGuide(): void {
        UserGuideComponent.displayUserGuide();
    }
}
