import { Engine } from "./types/types";

export const messages = {
    welcome:
      "Welcome! Simply import files to get started. Each file will be added as a table in your virtual database.",
  
    engineSwitchConfirmation: (currentEngine: Engine, engine: Engine) =>
      `Heads up! You're switching SQL engine from ${currentEngine} to ${engine}. Any unsaved data will be lost and you'll start fresh. Are you sure you want to proceed?`,
  
    engineSwitchSuccess: (engine: Engine) => `Switch successful! You're now using the ${engine} engine.`,
  
    exportingStart: (filePath: string) => `Exporting your latest SQL result to ${filePath}. Please wait.`,
  
    exportingFail: (filePath: string, error: string) => `Uh oh! Couldn't export to ${filePath}. Error encountered: ${error}`,
  
    exportingSuccess: (filePath: string) => `Success! Your latest SQL result has been exported to ${filePath}.`,
  
    importingFail: (filePath: string, error: string) => `Oops! There was a problem importing ${filePath}. Error: ${error}`,
  
    importingSuccess: (filePath: string, tableName: string) => `Good job! The file ${filePath} was imported successfully as a table named ${tableName}.`,
  
    sqlSuccess: (sql: string) => `Your SQL command, ${sql} has been executed successfully.`,
  
    noSqlSelected: "Please select an SQL statement.",

    tableEmptyState: 'Your data will appear here'
  };
  
