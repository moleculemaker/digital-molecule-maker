import { Component } from '@angular/core';

@Component({
    selector: 'intro',
    templateUrl: './intro.component.html',
    styleUrls: ['./intro.component.scss']
})
export class IntroComponent {
    currentStep: number = 0;
    selectedRole: string | null = null;
    showChemicalSpace: boolean = false;
    showBuildingBlock: boolean = false;

    selectRole(role: string) {
        this.currentStep = 1;
        this.selectedRole = role;
    }

    goBack() {
        this.currentStep = this.currentStep - 1;
    }
}