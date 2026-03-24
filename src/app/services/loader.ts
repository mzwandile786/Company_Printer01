import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;
  private loaderTimeout: any;
  private minVisibleTime = 300; // minimum time loader stays visible
  private delayBeforeShow = 150; // delay before showing loader
  private shownAt = 0;

  show() {
    this.requestCount++;

    if (this.requestCount === 1) {
      this.loaderTimeout = setTimeout(() => {
        this.shownAt = Date.now();
        this.loadingSubject.next(true);
      }, this.delayBeforeShow);
    }
  }

  hide() {
    this.requestCount--;

    if (this.requestCount <= 0) {
      clearTimeout(this.loaderTimeout);

      const timeVisible = Date.now() - this.shownAt;

      const remainingTime =
        timeVisible < this.minVisibleTime
          ? this.minVisibleTime - timeVisible
          : 0;

      setTimeout(() => {
        this.loadingSubject.next(false);
      }, remainingTime);

      this.requestCount = 0;
    }
  }
}