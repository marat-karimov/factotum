import { DataBaseSchema } from "../../../types/types";
import { ctrlCHandler } from "../../shortcutsHandlers";

interface NodeData {
  type: "table" | "column";
  name: string;
  parent?: string;
}

export class TreeViewState {
  public data: { [key: string]: NodeData[] };
  private foldedTables: Set<string>;
  public selectedNodeId: string | null;

  constructor(tableData: DataBaseSchema) {
    this.foldedTables = new Set<string>();
    this.selectedNodeId = null;
    this.data = this.flattenData(tableData);
  }

  private flattenData(tableData: DataBaseSchema): {
    [key: string]: NodeData[];
  } {
    const data: { [key: string]: NodeData[] } = {};
    for (const [tableName, columns] of Object.entries(tableData)) {
      const tableNode: NodeData = { type: "table", name: tableName };
      const columnNodes: NodeData[] = columns.map((columnName) => ({
        type: "column",
        name: columnName,
        parent: tableName,
      }));
      data[tableName] = [tableNode, ...columnNodes];
    }
    return data;
  }

  getNodeByIndex(index: number): NodeData | null {
    let counter = 0;
    for (const table in this.data) {
      for (const node of this.data[table]) {
        if (counter === index) {
          return node;
        }
        counter++;
        if (node.type === "table" && this.foldedTables.has(node.name)) {
          break;
        }
      }
    }
    return null;
  }

  countTotalNodes(): number {
    let total = 0;
    for (const table in this.data) {
      total += this.foldedTables.has(table) ? 1 : this.data[table].length;
    }
    return total;
  }

  toggleFoldedTable(tableName: string): void {
    this.foldedTables.has(tableName)
      ? this.foldedTables.delete(tableName)
      : this.foldedTables.add(tableName);
  }

  isTableFolded(tableName: string): boolean {
    return this.foldedTables.has(tableName);
  }

  getData(): { [key: string]: NodeData[] } {
    return this.data;
  }

  getNodeById(id: string): NodeData | null {
    for (const table in this.data) {
      for (const node of this.data[table]) {
        if (this.getNodeId(node) === id) {
          return node;
        }
      }
    }
    return null;
  }

  getNodeId(node: NodeData): string {
    return `${node.type}-${node.name}-${node.parent ?? ""}`;
  }
}

export class TreeView {
  private container: HTMLElement;
  private placeholders: HTMLElement[];
  private spacer: HTMLElement;
  private placeholderHeight: number;
  private visibleWindow: number;
  private placeholderContainer: HTMLElement;
  private state: TreeViewState;
  private resizeTimeout: NodeJS.Timeout;

  constructor(state: TreeViewState, containerId: string) {
    this.container = document.getElementById(containerId);
    this.state = state;
  }

  private calculatePlaceholderHeight(): number {
    const tempPlaceholder = document.createElement("li");
    tempPlaceholder.classList.add("placeholder");
    this.container.appendChild(tempPlaceholder);

    const placeholderHeight = tempPlaceholder.getBoundingClientRect().height;
    this.container.removeChild(tempPlaceholder);

    return placeholderHeight;
  }

  private createPlaceholders(): HTMLElement[] {
    return Array.from({ length: this.visibleWindow }, () =>
      document.createElement("li")
    );
  }

  private createSpacer(): HTMLElement {
    return document.createElement("div");
  }

  private setupPlaceholderContainer(): HTMLElement {
    const placeholderContainer = document.createElement("div");
    placeholderContainer.style.display = "flex";
    placeholderContainer.style.flexDirection = "column";
    placeholderContainer.style.position = "absolute";
    placeholderContainer.style.width = "100%";

    return placeholderContainer;
  }

  public render(): void {
    this.placeholderHeight = this.calculatePlaceholderHeight();
    this.visibleWindow = Math.ceil(
      this.container.clientHeight / this.placeholderHeight
    );
    this.placeholders = this.createPlaceholders();
    this.spacer = this.createSpacer();
    this.placeholderContainer = this.setupPlaceholderContainer();
    this.clearContainer();
    this.initializePlaceholders();
    this.appendElementsToContainer();
    this.updateVisibleNodes(0);
    this.addScrollListener();
    this.addResizeListener();
  }

  private clearContainer(): void {
    this.container.innerHTML = "";
    this.placeholderContainer.innerHTML = "";
  }

  private initializePlaceholders(): void {
    this.placeholders.forEach((placeholder, index) => {
      this.configurePlaceholder(placeholder, index);
    });
  }

  private configurePlaceholder(placeholder: HTMLElement, index: number): void {
    placeholder.style.height = `${this.placeholderHeight}px`;

    placeholder.classList.add("placeholder");
    placeholder.onclick = () => this.handlePlaceholderClick(index);

    this.placeholderContainer.appendChild(placeholder);
  }

  private appendElementsToContainer(): void {
    this.container.appendChild(this.spacer);
    this.container.appendChild(this.placeholderContainer);
  }

  private addScrollListener(): void {
    this.container.onscroll = () => this.handleScroll();
  }

  private addResizeListener(): void {
    window.onresize = () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.render();
      }, 200);
    };
  }

  private handleScroll(): void {
    const firstVisibleNodeIndex = Math.floor(
      this.container.scrollTop / this.placeholderHeight
    );
    this.updateVisibleNodes(firstVisibleNodeIndex);
  }

  private updateVisibleNodes(firstVisibleNodeIndex: number): void {
    this.updateSpacerHeight();
    this.updatePlaceholderContainerPosition(firstVisibleNodeIndex);

    for (let i = 0; i < this.visibleWindow; i++) {
      this.updatePlaceholder(firstVisibleNodeIndex, i);
    }

    this.adjustOverflow();
  }

  private updateSpacerHeight(): void {
    this.spacer.style.height = `${
      this.state.countTotalNodes() * this.placeholderHeight
    }px`;
  }

  private updatePlaceholderContainerPosition(
    firstVisibleNodeIndex: number
  ): void {
    this.placeholderContainer.style.top = `${
      firstVisibleNodeIndex * this.placeholderHeight
    }px`;
  }

  private updatePlaceholder(firstVisibleNodeIndex: number, i: number): void {
    const dataIndex = firstVisibleNodeIndex + i;
    const placeholder = this.placeholders[i];
    const nodeData = this.state.getNodeByIndex(dataIndex);

    if (nodeData) {
      this.setNodeData(placeholder, nodeData);
    } else {
      this.resetPlaceholder(placeholder);
    }
  }

  private setNodeData(placeholder: HTMLElement, nodeData: NodeData): void {
    placeholder.textContent = nodeData.name;
    placeholder.className = "";
    placeholder.classList.add("placeholder", nodeData.type);

    if (nodeData.type === "table") {
      this.addTableClass(placeholder, nodeData);
    }

    if (this.state.getNodeId(nodeData) === this.state.selectedNodeId) {
      placeholder.classList.add("selected");
    }
  }

  private resetPlaceholder(placeholder: HTMLElement): void {
    placeholder.textContent = "";
    placeholder.className = "";
    placeholder.classList.add("placeholder");
  }

  private addTableClass(placeholder: HTMLElement, nodeData: NodeData): void {
    if (this.state.isTableFolded(nodeData.name)) {
      placeholder.classList.add("folded");
    } else {
      placeholder.classList.add("unfolded");
    }
  }

  private handlePlaceholderClick(index: number): void {
    const dataIndex = this.calculateDataIndex(index);
    const nodeData = this.state.getNodeByIndex(dataIndex);

    if (nodeData?.type === "table") {
      this.state.toggleFoldedTable(nodeData.name);
      this.updateVisibleNodes(this.calculateScrollIndex());
      this.render();
    }

    if (nodeData) {
      this.state.selectedNodeId = this.state.getNodeId(nodeData);
      this.updateVisibleNodes(this.calculateScrollIndex());
      ctrlCHandler(nodeData.name);
    }
  }

  private calculateDataIndex(index: number): number {
    return (
      Math.floor(this.container.scrollTop / this.placeholderHeight) + index
    );
  }

  private calculateScrollIndex(): number {
    return Math.floor(this.container.scrollTop / this.placeholderHeight);
  }

  private adjustOverflow(): void {
    const totalHeight = this.state.countTotalNodes() * this.placeholderHeight;

    if (totalHeight <= this.container.clientHeight) {
      this.container.style.overflowY = "hidden";
    } else {
      this.container.style.overflowY = "auto";
    }
  }
}
