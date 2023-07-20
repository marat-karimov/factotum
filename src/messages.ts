import { Engine } from "./types/types";

export const messages = {
  welcome:
    "Welcome! Factotum is here to serve. Import your files and watch as they transform into tables in your very own database. The stage is set!",

  engineSwitchConfirmation: (currentEngine: Engine, engine: Engine) =>
    `Hold on! You're swapping SQL engine from ${currentEngine} to ${engine}. Any unsaved data will vanish. Are you sure you're ready for this act?`,

  engineSwitchSuccess: (engine: Engine) =>
    `A change of scene! You're now using the ${engine} engine. Bravo!`,

  exportingStart: (filePath: string) =>
    `And now, the main act! I'm moving your latest SQL result to ${filePath}. Patience, please.`,

  exportingFail: (filePath: string, error: string) =>
    `Oh no! I hit a snag while exporting to ${filePath}. The troublemaker is: ${error}`,

  exportingSuccess: (filePath: string) =>
    `Encore! Your latest SQL result has been safely moved to ${filePath}.`,

  importingFail: (filePath: string, error: string) =>
    `Drat! There was a hitch in importing ${filePath}. The problem is: ${error}`,

  importingSuccess: (filePath: string, tableName: string) =>
    `Take a bow! The file ${filePath} has been successfully added as a table named ${tableName}.`,

  sqlSuccess: (sql: string) =>
    `Bravo! Your SQL command, ${sql} has hit all the right notes.`,

  noSqlSelected: "Please select an SQL statement for the next act.",
};
