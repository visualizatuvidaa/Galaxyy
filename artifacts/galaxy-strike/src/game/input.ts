export class InputHandler {
  active: boolean = false;
  x: number = 0;
  y: number = 0;
  isDragging: boolean = false;
  
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private shipStartX: number = 0;
  private shipStartY: number = 0;
  
  onMoveCallback: ((dx: number, dy: number) => void) | null = null;
  
  constructor() {
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  attach() {
    // We attach to document so dragging outside canvas doesn't break
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd);
    document.addEventListener('touchcancel', this.handleTouchEnd);
    
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  detach() {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchEnd);
    
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleTouchStart(e: TouchEvent) {
    if (e.target instanceof HTMLButtonElement) return; // Ignore UI buttons
    e.preventDefault();
    this.isDragging = true;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  private handleTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    
    if (this.onMoveCallback) {
      this.onMoveCallback(dx, dy);
    }
    
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  private handleTouchEnd() {
    this.isDragging = false;
  }
  
  private handleMouseDown(e: MouseEvent) {
    if (e.target instanceof HTMLButtonElement) return;
    this.isDragging = true;
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
  }
  
  private handleMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.touchStartX;
    const dy = e.clientY - this.touchStartY;
    
    if (this.onMoveCallback) {
      this.onMoveCallback(dx, dy);
    }
    
    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
  }
  
  private handleMouseUp() {
    this.isDragging = false;
  }
}
