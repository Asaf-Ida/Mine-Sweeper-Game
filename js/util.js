'use strict'

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`
    return cellClass
}

function getEmptyPos(board) {
    var emptyPositions = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!board[i][j].isShown) emptyPositions.push({ i, j })
        }
    }
    return emptyPositions
}