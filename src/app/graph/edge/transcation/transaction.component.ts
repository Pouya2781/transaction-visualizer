import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BankGraphService} from '../../../services/bank-graph.service';
import {Transaction} from '../../../models/transaction';
import {LiteModeService} from '../../../services/lite-mode.service';

@Component({
    selector: 'app-transcation',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit {
    @ViewChild('targetElement') private targetElement!: ElementRef;
    @ViewChild('targetIcon') private targetIcon!: ElementRef;
    @ViewChild('targetLabel') private targetLabel!: ElementRef;
    @ViewChild('wrapper') private wrapper!: ElementRef;

    @Input() public transaction!: Transaction;

    protected visible: boolean = false;
    protected expanded: boolean = false;

    private readonly EXPAND_ANIMATION_DELAY: number = 400;

    public constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly renderer: Renderer2,
        private readonly liteModeService: LiteModeService
    ) {}

    ngOnInit(): void {
        this.liteModeService.liteMode.subscribe((value: boolean): void => {
            this.visible = !value;
        });
    }

    protected onClick(): void {
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

        const deltaXTarget: number = firstTarget.left - lastTarget.left;
        const deltaYTarget: number = firstTarget.top - lastTarget.top;
        const deltaXLabel: number = firstLabel.left - lastLabel.left;
        const deltaYLabel: number = firstLabel.top - lastLabel.top;
        const deltaXIcon: number = firstIcon.left - lastIcon.left;
        const deltaYIcon: number = firstIcon.top - lastIcon.top;

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
