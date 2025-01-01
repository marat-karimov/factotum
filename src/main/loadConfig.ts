import * as fs from "fs";
import * as path from "path";

const configPath =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
    ? path.join(__dirname, "../../config.json")
    : path.join(process.resourcesPath, "config.json");

// Read the config file
const configFile = fs.readFileSync(configPath, "utf8");

// Parse the JSON data
const config = JSON.parse(configFile);

const allowedReadFormats = config.read_files;
const allowedWriteFormats = config.write_files;
const filenameColumn = config.filename_column;

export { allowedReadFormats, allowedWriteFormats, filenameColumn };
