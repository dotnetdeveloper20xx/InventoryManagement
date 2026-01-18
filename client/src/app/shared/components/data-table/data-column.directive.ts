import { Directive, Input, TemplateRef, ContentChild } from '@angular/core';

@Directive({
  selector: 'app-data-column',
  standalone: true
})
export class DataColumnDirective {
  @Input() field = '';
  @Input() header = '';
  @Input() width?: string;
  @Input() sortable = false;

  @ContentChild(TemplateRef) template?: TemplateRef<unknown>;
}
