import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector} from '@angular/core';
import {ComponentPortal, DomPortalOutlet, ComponentType} from '@angular/cdk/portal';

@Injectable({
    providedIn: 'root',
})
export class ComponentCreatorService {
    public constructor(
        private readonly injector: Injector,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly applicationRef: ApplicationRef
    ) {}

    public createComponent<T>(element: Element, component: ComponentType<T>): ComponentRef<T> {
        const domPortalOutlet: DomPortalOutlet = new DomPortalOutlet(
            element,
            this.componentFactoryResolver,
            this.applicationRef,
            this.injector
        );
        return domPortalOutlet.attachComponentPortal(new ComponentPortal(component));
    }
}
