export class StatusBar {
  private engineElement = document.getElementById("engine");
  private ramUsageElement = document.getElementById("memory-usage");
  
  public renderMemoryUsage = (memoryUsage: string) => {
    this.ramUsageElement.innerText = `RAM usage: ${memoryUsage} MB`;
  };

  public renderCurrentEngine = (engine: string) => {
    this.engineElement.innerText = `SQL engine: ${engine}`;
  };
}
