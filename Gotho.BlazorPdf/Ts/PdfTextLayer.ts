interface TextAnnotation {
    text: string;
    color: string;
    font: string;
    x: number;
    y: number;
}

export class PdfTextLayer {
    public textStore: Record<number, TextAnnotation[]> = {};
    public canvas: HTMLCanvasElement;
    public canvasContext: CanvasRenderingContext2D;
    public enabled: boolean;

    private id: string;
    private texts: TextAnnotation[] = [];
    private rotation: number;
    private textColor: string = "#000000";
    private textFont: string = "16px sans-serif";
    private currentPage: number = 1;
    private boundClick: (e: MouseEvent) => void;

    constructor(id: string) {
        this.id = id;
        this.boundClick = this.onClick.bind(this);

        this.canvas = document.getElementById(`${id}_textannotation`) as HTMLCanvasElement;
        if (this.canvas) {
            this.canvasContext = this.canvas.getContext("2d");
            this.canvasContext.fillStyle = this.textColor;
            this.canvasContext.font = this.textFont;
            this.canvas.style.display = "none";
        }
    }

    public enable() {
        this.enabled = true;
        this.canvas.style.removeProperty("display");
        const textLayer = document.getElementById(`${this.id}_text`);
        if (textLayer) {
            textLayer.style.display = "none";
        }
        this.canvas.addEventListener("click", this.boundClick);
    }

    public disable() {
        this.enabled = false;
        this.canvas.style.display = "none";
        const textLayer = document.getElementById(`${this.id}_text`);
        if (textLayer) {
            textLayer.style.removeProperty("display");
        }
        this.canvas.removeEventListener("click", this.boundClick);
    }

    public updateTextSettings(color: string, font: string) {
        this.textColor = color;
        this.textFont = font;
        if (this.canvasContext) {
            this.canvasContext.fillStyle = color;
            this.canvasContext.font = font;
        }
    }

    public updateCanvas(pageNumber: number,
                        height: number,
                        width: number,
                        offsetLeft: number,
                        offsetTop: number,
                        rotation: number) {
        this.rotation = ((rotation % 360) + 360) % 360;
        this.textStore[this.currentPage] = [...this.texts];
        this.currentPage = pageNumber;
        this.texts = this.textStore[pageNumber] ? [...this.textStore[pageNumber]] : [];
        if (this.canvas) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            this.canvas.style.left = offsetLeft + 'px';
            this.canvas.style.top = offsetTop + 'px';
            this.redrawTexts();
        }
    }

    public undoLastText() {
        if (this.texts.length > 0) {
            this.texts.pop();
            this.redrawTexts();
        }
    }

    public clearPageText() {
        this.texts = [];
        this.textStore[this.currentPage] = [];
        this.redrawTexts();
    }

    public getAllText(): Record<number, TextAnnotation[]> {
        this.textStore[this.currentPage] = [...this.texts];
        return this.textStore;
    }

    public loadAllText(data: Record<number, TextAnnotation[]>) {
        this.textStore = data;
        this.texts = this.textStore[this.currentPage] ?? [];
        this.redrawTexts();
    }

    private onClick(e: MouseEvent) {
        if (!this.canvasContext || !this.canvas) return;
        const value = prompt("Enter text");
        if (!value) return;
        const [x, y] = this.getNormalizedMousePos(this.canvas, e);
        const [rx, ry] = this.rotatePoint(x, y, this.rotation);
        this.canvasContext.fillStyle = this.textColor;
        this.canvasContext.font = this.textFont;
        this.canvasContext.fillText(value, rx * this.canvas.width, ry * this.canvas.height);
        this.texts.push({text: value, color: this.textColor, font: this.textFont, x, y});
    }

    private redrawTexts() {
        if (!this.canvasContext || !this.canvas) return;
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const w = this.canvas.width;
        const h = this.canvas.height;
        for (const t of this.texts) {
            const [rx, ry] = this.rotatePoint(t.x, t.y, this.rotation);
            this.canvasContext.fillStyle = t.color;
            this.canvasContext.font = t.font;
            this.canvasContext.fillText(t.text, rx * w, ry * h);
        }
    }

    private getNormalizedMousePos(canvas: HTMLCanvasElement, evt: MouseEvent): [number, number] {
        const rect = canvas.getBoundingClientRect();
        const x = (evt.clientX - rect.left) / canvas.width;
        const y = (evt.clientY - rect.top) / canvas.height;
        return [x, y];
    }

    private rotatePoint(x: number, y: number, rotation: number): [number, number] {
        switch (rotation) {
            case 90:
                return [1 - y, x];
            case 180:
                return [1 - x, 1 - y];
            case 270:
                return [y, 1 - x];
            default:
                return [x, y];
        }
    }
}
