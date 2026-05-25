import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  online$ = this.onlineSubject.asObservable();

  constructor() {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
    ).subscribe(status => this.onlineSubject.next(status));
  }

  get isOnline(): boolean {
    return this.onlineSubject.value;
  }

  get isOffline(): boolean {
    return !this.onlineSubject.value;
  }
}
