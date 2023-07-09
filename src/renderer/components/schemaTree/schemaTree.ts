import { TreeNode, TreeView } from "../../static/tree.js";
import { ctrlCHandler } from "../../shortcutsHandlers";

export class SchemaTree {
  private schemaContainerClass = ".schema-container";

  public renderSchema = (schema: DataBaseSchema) => {
    const root = new TreeNode("root");

    for (const [tableName, columns] of Object.entries(schema)) {
      const tableNode = this.createNodeAndAddToParent(tableName, root);

      for (const column of columns) {
        this.createNodeAndAddToParent(column, tableNode);
      }
    }

    return new TreeView(root, this.schemaContainerClass, { show_root: false });
  };

  private createNodeAndAddToParent(nodeName: string, parentNode: TreeNode) {
    const node = new TreeNode(nodeName);
    node.on("select", () => ctrlCHandler(nodeName));
    parentNode.addChild(node);
    return node;
  }
}
