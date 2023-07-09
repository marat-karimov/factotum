export type ScrollDirection = -1 | 1;

export class TableSearchBox {
  public nextButton = this.getHTMLElement("next-button");
  public prevButton = this.getHTMLElement("prev-button");
  public closeButton = this.getHTMLElement("close-button");
  public searchField = this.getHTMLElement("search-field") as HTMLInputElement;
  private totalMatchesCount = this.getHTMLElement("rows-matched");
  private currentMatchIndex = this.getHTMLElement("current-match");
  private searchBoxContainer = this.getHTMLElement("search-container");

  public renderSearchBox(): void {
    this.searchBoxContainer.classList.add("visible");
    this.searchField.focus();
    const value = this.getSearchFieldValue()
    if (value) {
      this.searchField.select()
    }
  }

  public hideSearchBox(): void {
    this.searchBoxContainer.classList.remove("visible");
  }

  public getSearchFieldValue(): string {
    return this.searchField.value;
  }

  public setTotalMatchesCount(count: number): void {
    this.totalMatchesCount.innerText = count.toString();
  }

  public setCurrentMatchIndex(index: number): void {
    this.currentMatchIndex.innerText = index.toString();
  }
  private getHTMLElement(id: string): HTMLElement {
    return document.getElementById(id);
  }
}
