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
    selectedActivity: string | null = null;
    showToolTipIdx: {
        activity: number,
        step: number
    } | null = {
            activity: 0,
            step: 2
        };

    activityToolTips = [
        ['Students classify color chips under different lighting conditions, revealing individual variations in perception and the role of light absorption and reflection in how we see color.',
            'A clear liquid turns pink, illustrating how molecular structure shifts at different pH levels affect light absorption and perceived color.',
            'Students learn how screens create colors by mixing red, green, and blue light, connecting this to the molecular mechanisms in human vision.',
            'Using an AI tool (“Teachable Machine”), students train a model to recognize colors, discovering how machine learning mimics human classification skills and extends beyond color recognition.'
        ],
        [
            'Students examine natural sources of color and the molecular structures responsible for light absorption and reflection.',
            'By understanding how molecules absorb specific wavelengths (lambda max), students explore how molecular manipulation can lead to innovations such as custom pigments, sunscreens, and temperature-regulating materials.',
            'Students design and analyze molecules, identifying patterns in molecular weight, structure, and their impact on color production and function.'
        ],
        [
            'Students analyze the structure and function of silicon-based solar cells and compare them to OPVs, which offer flexibility and broader applications, despite current efficiency limitations.',
            'Through the Monty Hall Problem, students explore decision-making strategies used in scientific research, learning how careful pattern observation helps guide exploration of new OPV molecules.',
            'Students create dye-sensitized organic solar cells using different fruit and vegetable juices, testing their effectiveness under various lighting conditions. They analyze which dyes work best and how light absorption impacts energy conversion',
        ]
    ];

    get toolTipText() {
        if (this.showToolTipIdx == null) {
            return this.activityToolTips[0]?.[0];
        }
        return this.activityToolTips[this.showToolTipIdx.activity]?.[this.showToolTipIdx.step] ?? '';
    }

    get toolTipStyle() {
        const { step = 0 } = this.showToolTipIdx || {};

        if (this.selectedActivity == 'colorPerception') {
            if (step <= 1) {
                return 'width: 75%; left: 0';
            }
            return "width: 75%; right: 0";
        }

        if (step == 0) {
            return 'left: 0';
        }
        if (step == 2) {
            return "right: 0";
        }
        return 'left: 5%';
    }

    showToolTip(activity: number, step: number) {
        this.showToolTipIdx = {
            activity,
            step
        };
    }

    hideToolTip() {
        this.showToolTipIdx = null;
    }

    selectRole(role: string) {
        this.currentStep = 1;
        this.selectedRole = role;
    }

    selectActivity(activity: string) {
        this.currentStep = 2;
        this.selectedActivity = activity;
    }

    goBack() {
        this.currentStep = this.currentStep - 1;
    }
}