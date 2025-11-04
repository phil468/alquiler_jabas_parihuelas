import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-firma-pad',
  templateUrl: './firma-pad.component.html',
  styleUrls: ['./firma-pad.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class FirmaPadComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Output() firmaGuardada = new EventEmitter<string>();
  @Output() firmaCancelada = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Configurar tamaño del canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Configurar estilo del trazo
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Eventos táctiles para móvil
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Eventos de mouse para web
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  // Touch events
  handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
    this.drawing = true;
  }

  handleTouchMove(e: TouchEvent) {
    if (!this.drawing) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, x, y);
    this.lastX = x;
    this.lastY = y;
  }

  handleTouchEnd(e: TouchEvent) {
    this.drawing = false;
  }

  // Mouse events
  handleMouseDown(e: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    this.drawing = true;
  }

  handleMouseMove(e: MouseEvent) {
    if (!this.drawing) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.drawLine(this.lastX, this.lastY, x, y);
    this.lastX = x;
    this.lastY = y;
  }

  handleMouseUp(e: MouseEvent) {
    this.drawing = false;
  }

  // Dibujar línea
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  // Limpiar canvas
  limpiar() {
    const canvas = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Verificar si hay firma
  isEmpty(): boolean {
    const canvas = this.canvas.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Verificar si hay píxeles no blancos
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Si encontramos un píxel con alpha > 0, hay firma
      if (imageData.data[i + 3] > 0) {
        return false;
      }
    }
    return true;
  }

  // Guardar firma como base64
  guardar() {
    if (this.isEmpty()) {
      alert('Por favor, dibuje su firma');
      return;
    }

    const firmaBase64 = this.canvas.nativeElement.toDataURL('image/png');
    this.firmaGuardada.emit(firmaBase64);
  }

  // Cancelar
  cancelar() {
    this.limpiar();
    this.firmaCancelada.emit();
  }
}
