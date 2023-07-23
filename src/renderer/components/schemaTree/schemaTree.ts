import { DataBaseSchema } from "../../../types/types";
import { TreeView, TreeViewState } from "./treeView";

export class SchemaTreeRenderer {
  public renderSchema = (schema: DataBaseSchema) => {
    const state = new TreeViewState(schema);

    const renderer = new TreeView(state, "schema-container");

    renderer.render();
  };
}
