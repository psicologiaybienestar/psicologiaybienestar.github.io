import { Component, Input } from '@angular/core';
import { ICON_SVGS } from './icon-map';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [class]="'app-icon-inner' + (classNames ? ' ' + classNames : '')" [innerHTML]="svgContent"></span>`,
  styles: [`
    :host { display: inline-block; line-height: 0; vertical-align: middle; }
    .app-icon-inner { display: inline-flex; align-items: center; justify-content: center; }
    .app-icon-inner svg { width: 1em; height: 1em; fill: currentColor; stroke: currentColor; display: block; flex-shrink: 0; }
  `],
})
export class AppIconComponent {
  protected svgContent = '';
  protected classNames = '';

  @Input() set name(v: string) {
    this.svgContent = ICON_SVGS[v] || '';
  }

  @Input() set class(v: string) {
    this.classNames = v;
  }
}
