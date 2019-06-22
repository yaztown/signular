import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

interface iPoint
{
  x: number,
  y: number
}


@Component({
  selector: 'ngxy-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  private cx: CanvasRenderingContext2D;
  private signatureData: string = undefined;

  constructor () {}

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.drawSignatureLine();

    this.captureEvents(canvasEl);
    this.captureTouchEvents(canvasEl);
  }

  private drawSignatureLine() {
      const w = this.cx.canvas.width;
      const h = this.cx.canvas.height;
      const y = h * 0.7;
      const x1 = w * 0.05;
      const x2 = w * 0.95;

      this.cx.lineWidth = 1;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#888';

      // start the path
      this.cx.beginPath();

      // set the line's start point
      this.cx.moveTo(x1 , y);

      // draw a line to toPoint
      this.cx.lineTo(x2, y);

      // stroke the current path with the styles we set earlier
      this.cx.stroke();
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        //
        switchMap((e) => {
          //
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              pairwise()
            )
        })
      ).subscribe((res: [MouseEvent, MouseEvent]) => {
        //
        const rect = canvasEl.getBoundingClientRect();

        //
        const prevPosition: iPoint = {
          x:res[0].clientX - rect.left,
          y:res[0].clientY - rect.top
        };
        const currPosition: iPoint = {
          x:res[1].clientX - rect.left,
          y:res[1].clientY - rect.top
        };

        this.drawOnCanvas(prevPosition, currPosition);
      });
  }



  private captureTouchEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'touchstart').subscribe((e: TouchEvent) => {
      // e.preventDefault();
      var mouseEvent = new MouseEvent("mousedown", {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      });
      canvasEl.dispatchEvent(mouseEvent);
    });
    
    fromEvent(canvasEl, 'touchmove').subscribe((e: TouchEvent) => {
      e.preventDefault();
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      });
      canvasEl.dispatchEvent(mouseEvent);
    });

    fromEvent(canvasEl, 'touchend').subscribe((e: TouchEvent) => {
      var mouseEvent = new MouseEvent("mouseup", {});
      canvasEl.dispatchEvent(mouseEvent);
    });

    fromEvent(canvasEl, 'touchcancel').subscribe((e: TouchEvent) => {
      var mouseEvent = new MouseEvent("mouseleave", {});
      canvasEl.dispatchEvent(mouseEvent);
    });
  }

  private drawOnCanvas(
    fromPoint: iPoint,
    toPoint: iPoint) {
      this.cx.lineWidth = 3;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#000';
      //
      if (!this.cx) { return; }

      // start the path
      this.cx.beginPath();

      // set the line's start point
      this.cx.moveTo(fromPoint.x , fromPoint.y);

      // draw a line to toPoint
      this.cx.lineTo(toPoint.x, toPoint.y);

      // stroke the current path with the styles we set earlier
      this.cx.stroke();
  }

  clearCanvas() {
    this.signatureData = undefined;
    this.cx.clearRect(0, 0, this.cx.canvas.width, this.cx.canvas.height);
    this.drawSignatureLine();
  }

  submitSignature() {
    this.signatureData = this.cx.canvas.toDataURL();
  }
}
