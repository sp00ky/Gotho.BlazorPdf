interface TextItem {
    color: string;
    size: number;
    text: string;
    x: number;
    y: number;
}

export class PdfTextLayer {
    public textStore: Record<number, TextItem[]> = {};
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public enabled: boolean;

    private id: string;
    private texts: TextItem[] = [];
    private currentPage: number = 1;
    private rotation: number;
    private color: string = "#000000";
    private size: number = 16;

    private boundClick: (e: MouseEvent) => void;

    constructor(id: string) {
        this.id = id;
        this.boundClick = this.onClick.bind(this);
        this.canvas = document.getElementById(`${id}_text_annotation`) as HTMLCanvasElement;
        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
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
        const textLayer = document.getElementById(`${this.id}_text`);
        if (textLayer) {
            textLayer.style.removeProperty("display");
        }
        this.canvas.removeEventListener("click", this.boundClick);
        this.canvas.style.display = "none";
    }

    public updateSettings(color: string, size: number) {
        this.color = color;
        this.size = size;
    }

    public updateCanvas(pageNumber: number, height: number, width: number, offsetLeft: number, offsetTop: number, rotation: number) {
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

    public clearPageTexts() {
        this.texts = [];
        this.textStore[this.currentPage] = [];
        this.redrawTexts();
    }

    public getAllTexts(): Record<number, TextItem[]> {
        this.textStore[this.currentPage] = [...this.texts];
        return this.textStore;
    }

    public loadAllTexts(data: Record<number, TextItem[]>) {
        this.textStore = data;
        this.texts = this.textStore[this.currentPage] ?? [];
        this.redrawTexts();
    }

    private onClick(e: MouseEvent) {
        if (!this.canvas || !this.ctx) return;
        const [x, y] = this.getNormalizedMousePos(this.canvas, e);
        const text = prompt('Enter text');
        if (text) {
            const item: TextItem = {color: this.color, size: this.size, text, x, y};
            this.texts.push(item);
            this.drawText(item);
        }
    }

    private redrawTexts() {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const t of this.texts) {
            this.drawText(t);
        }
    }

    private drawText(t: TextItem) {
        const [rx, ry] = this.rotatePoint(t.x, t.y, this.rotation);
        const x = rx * this.canvas.width;
        const y = ry * this.canvas.height;
        this.ctx.fillStyle = t.color;
        this.ctx.font = `${t.size}px sans-serif`;
        this.ctx.fillText(t.text, x, y);
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
