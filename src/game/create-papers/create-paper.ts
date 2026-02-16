import { Paper, PaperModifier, PaperType } from "../../types";
import { mixedColors } from "../modify-papers/mixed-colors";
import { mixedNumbers } from "../modify-papers/mixed-numbers";
import { createDefaultPaper } from "./default";
import { createLongoPaper } from "./longo";

export function createPaper(type: PaperType, modifiers?: PaperModifier[]): Paper {
    let paper: Paper;
    switch (type) {
        case "default":
            paper = createDefaultPaper();
            break;
        case "longo":
            paper = createLongoPaper();
            break;
        default:
            console.warn(`Unknown paper type: ${type}, creating default paper.`);
            paper = createDefaultPaper();
    }

    if (modifiers) {
        for (const modifier of modifiers) {
            switch (modifier) {
                case "mixedColors":
                    paper = mixedColors(paper, false);
                    break;
                case "mixedNumbers":
                    paper = mixedNumbers(paper, false);
                    break;
                default:
                    console.warn(`Unknown paper modifier: ${modifier}, skipping.`);
            }
        }
    }

    return paper;
}