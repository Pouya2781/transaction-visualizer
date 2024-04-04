import {ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';
import {TransactionType} from '../../../enums/transaction-type';

@Component({
    selector: 'app-transcation',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
    @Input() public sourceAccountId!: string;
    @Input() public destinationAccountId!: string;
    @Input() public amount!: string;
    @Input() public date!: string;
    @Input() public transactionId!: string;
    @Input() public type!: TransactionType;
    visible: boolean = false;

    @ViewChild('targetElement') targetElement!: ElementRef;
    @ViewChild('targetIcon') targetIcon!: ElementRef;
    @ViewChild('targetLabel') targetLabel!: ElementRef;
    @ViewChild('wrapper') wrapper!: ElementRef;

    protected readonly Number = Number;
    expanded: boolean = false;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private renderer: Renderer2
    ) {}

    clicked() {
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
            400
        );
        this.targetLabel.nativeElement.animate(
            [{transform: `translate(${deltaXLabel}px, ${deltaYLabel}px`}, {transform: `translate(0)`}],
            400
        );
        this.targetIcon.nativeElement.animate(
            [{transform: `translate(${deltaXIcon}px, ${deltaYIcon}px`}, {transform: `translate(0)`}],
            400
        );
    }
}
