import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector} from '@angular/core';
import {ComponentPortal, DomPortalOutlet, ComponentType} from '@angular/cdk/portal';

@Injectable({
    providedIn: 'root',
})
export class ComponentCreatorService {
    constructor(
        private injector: Injector,
        private componentFactoryResolver: ComponentFactoryResolver,
        private applicationRef: ApplicationRef
    ) {}

    public createComponent<T>(element: Element, component: ComponentType<T>): ComponentRef<T> {
        const domPortalOutlet = new DomPortalOutlet(
            element,
            this.componentFactoryResolver,
            this.applicationRef,
            this.injector
        );
        return domPortalOutlet.attachComponentPortal(new ComponentPortal(component));
    }
}
