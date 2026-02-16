import { Cell, Paper, Row } from "../../types";

export function createLongoPaper(): Paper {
    const rowsAmount = 4;
    const columnsAmount = 15;

    let paper: Paper = {
        misses: 0,
        rows: []
    };

    for (let r = 0; r < rowsAmount; r++) {
        let row: Row = {
            color: r === 0 ? "red" : r === 1 ? "yellow" : r === 2 ? "green" : "blue",
            cells: [],
            locked: false,
            lockTicked: false,
        }
        for (let c = 0; c < columnsAmount; c++) {
            let cell: Cell = {
                number: c + 1,
                crossed: false,
                color: r === 0 ? "red" : r === 1 ? "yellow" : r === 2 ? "green" : "blue",
                canLockRow: c >= columnsAmount - 2
            }
            row.cells.push(cell);
        }
        paper.rows.push(row);
    }
    return paper;
}