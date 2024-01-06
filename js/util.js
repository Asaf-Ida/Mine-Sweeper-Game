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
            if (!board[i][j].isShown && !board[i][j].isMine) emptyPositions.push({ i, j })
        }
    }
    if (emptyPositions.length === 0) return null
    return emptyPositions
}

function getMinesPos(board) {
    var minesPositions = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) minesPositions.push({ i, j })
        }
    }
    return minesPositions
}

function addColorText(elCell, minesCount) {
    switch (minesCount) {
        case 1:
            elCell.style.color = 'blue'
            break;
        case 2:
            elCell.style.color = 'green'
            break;
        case 3:
            elCell.style.color = 'red'
            break;
        case 4:
            elCell.style.color = 'darkblue'
            break;
        case 5:
            elCell.style.color = 'brown'
            break;
        case 6:
            elCell.style.color = 'orange'
            break;
        case 7:
            elCell.style.color = 'purple'
            break;
        case 8:
            elCell.style.color = 'yellow'
            break;
    }
}