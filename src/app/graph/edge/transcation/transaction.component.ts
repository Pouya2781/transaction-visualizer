import {ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';
import {BankGraphService} from '../../../services/bank-graph.service';
import {Transaction} from '../../../models/transaction';
import {LiteModeService} from '../../../services/lite-mode.service';

@Component({
    selector: 'app-transcation',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
    @Input() public transaction!: Transaction;

    protected visible: boolean = false;
    protected expanded: boolean = false;

    protected readonly Number = Number;

    private readonly EXPAND_ANIMATION_DELAY = 400;

    @ViewChild('targetElement') targetElement!: ElementRef;
    @ViewChild('targetIcon') targetIcon!: ElementRef;
    @ViewChild('targetLabel') targetLabel!: ElementRef;
    @ViewChild('wrapper') wrapper!: ElementRef;

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly renderer: Renderer2,
        private readonly bankGraphService: BankGraphService,
        private readonly liteModeService: LiteModeService
    ) {
        this.liteModeService.liteMode.subscribe((value) => {
            this.visible = !value;
        });
    }

    onClick(): void {
        this.expanded = !this.expanded;

        const firstTarget = this.targetElement.nativeElement.getBoundingClientRect();
        const firstLabel = this.targetLabel.nativeElement.getBoundingClientRect();
        const firstIcon = this.targetIcon.nativeElement.getBoundingClientRect();

        if (!this.expanded) this.renderer.removeClass(this.wrapper.nativeElement, 'expand');
        else this.renderer.addClass(this.wrapper.nativeElement, 'expand');
        this.changeDetector.detectChanges();

        const lastTarget = this.targetElement.nativeElement.getBoundingClientRect();
        const lastLabel = this.targetLabel.nativeElement.getBoundingClientRect();
        const lastIcon = this.targetIcon.nativeElement.getBoundingClientRect();

        const deltaXTarget = firstTarget.left - lastTarget.left;
        const deltaYTarget = firstTarget.top - lastTarget.top;
        const deltaXLabel = firstLabel.left - lastLabel.left;
        const deltaYLabel = firstLabel.top - lastLabel.top;
        const deltaXIcon = firstIcon.left - lastIcon.left;
        const deltaYIcon = firstIcon.top - lastIcon.top;

        this.targetElement.nativeElement.animate(
            [{transform: `translate(${deltaXTarget}px, ${deltaYTarget}px`}, {transform: `translate(0)`}],
            this.EXPAND_ANIMATION_DELAY
        );
        this.targetLabel.nativeElement.animate(
            [{transform: `translate(${deltaXLabel}px, ${deltaYLabel}px`}, {transform: `translate(0)`}],
            this.EXPAND_ANIMATION_DELAY
        );
        this.targetIcon.nativeElement.animate(
            [{transform: `translate(${deltaXIcon}px, ${deltaYIcon}px`}, {transform: `translate(0)`}],
            this.EXPAND_ANIMATION_DELAY
        );
    }
}
