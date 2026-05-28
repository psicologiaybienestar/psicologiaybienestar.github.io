import { Component, Input, inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_SVGS } from './icon-map';

@Component({
  selector: 'app-icon',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `<span [class]="'app-icon-inner' + (classNames ? ' ' + classNames : '')" [innerHTML]="safeSvg"></span>`,
  styles: [`
    app-icon { display: inline-block; line-height: 0; vertical-align: middle; }
    .app-icon-inner { display: inline-flex; align-items: center; justify-content: center; }
    .app-icon-inner svg { width: 1em; height: 1em; fill: currentColor; stroke: currentColor; display: block; flex-shrink: 0; }
  `],
})
export class AppIconComponent {
  private sanitizer = inject(DomSanitizer);
  protected safeSvg: SafeHtml = '';
  protected classNames = '';

  @Input() set name(v: string) {
    this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(ICON_SVGS[v] || '');
  }

  @Input() set class(v: string) {
    this.classNames = v;
  }
}
