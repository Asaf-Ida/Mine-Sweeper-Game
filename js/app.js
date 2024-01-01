'use strict'

var gIntervalTimer
var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }

const MINE_IMG = '<img src="img/mine.png">'
const FLAG_IMG = '<img src="img/flag.png">'

function onInit() {
    gGame.isOn = true
    renderSettingsDisplay()
    gBoard = buildBoard()
    renderBoard(gBoard)
    // console.table(gBoard) // debug
}

// Render the settings
function renderSettingsDisplay() {
    var htmlStr =  `Time: ${String(gGame.secsPassed).padStart(2, '0')}`

    const elStgDisplay = document.querySelector('.timer')
    elStgDisplay.innerText = htmlStr
}

// Set the game level
function onSetLevel(elBtn) {
    var level = elBtn.innerText
    switch (level) {
        case 'Beginner':
            gLevel = { SIZE: 4, MINES: 2 }
            break;
        case 'Medium':
            gLevel = { SIZE: 8, MINES: 14 }
            break;
        case 'Expert':
            gLevel = { SIZE: 12, MINES: 32 }
            break;      
    }
    restartGame()
}

// Build the board for the modal
function buildBoard() {
    const board = createMat(gLevel.SIZE, gLevel.SIZE)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        }
    }

    //board[1][2].isMine = true
    //board[3][3].isMine = true

    setMinesRandomLocation(board)
    setMinesNegsCount(board)
    return board
}

function setMinesRandomLocation(board) {
    var emptyPositions = getEmptyPos(board)

    for (var i = 0; i < gLevel.MINES; i++) {
        const idx = getRandomIntInclusive(0, emptyPositions.length - 1)
        var currCell = emptyPositions.splice(idx, 1)[0]
        board[currCell.i][currCell.j].isMine = true
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countMinesAroundCell({ i, j }, board)
        }
    }
}

function countMinesAroundCell(pos, board) {
    var counter = 0

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === pos.i && j === pos.j) continue
            if (board[i][j].isMine) counter++
        }
    }
    return counter
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i, j })

            if (currCell.isMine) cellClass += ' mine'

            strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this, ${i}, ${j})"
                        oncontextmenu="onCellMarked(this, event, ${i}, ${j})">`

            // if (currCell.isMine) {
            //     strHTML += MINE_IMG
            // }  else strHTML += currCell.minesAroundCount
            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if(!gGame.isOn) return
    if (!gGame.shownCount) {
        startTimer()
    }
    var currCell = gBoard[i][j]
    if (currCell.isMine) {
        revealMinesCells()
        elCell.classList.add('fail')
        gGame.isOn = false
        endTimer()
        toggleLoosing()
        return console.log('You lost!')
    } else {
        gGame.shownCount++
        currCell.isShown = true
        elCell.classList.add('empty')
        if (!currCell.minesAroundCount) {
            expandShown(gBoard, { i, j })
        } else {
            elCell.innerText = currCell.minesAroundCount
        }
        checkGameOver()
    }
}

function revealMinesCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.innerHTML = MINE_IMG
            }
        }
    }
}

function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMarked || board[i][j].isShown) continue
            if (i === pos.i && j === pos.j) continue
            
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('empty')
            
            // if (board[i][j].minesAroundCount === 0) expandShown(board, { i, j }) // future development
            
            gGame.shownCount++
            board[i][j].isShown = true
            elCell.innerText = board[i][j].minesAroundCount
        }
    }
}

function onCellMarked(elCell, ev, i, j) {
    ev.preventDefault()
    if (!gGame.shownCount || !gGame.isOn) return
    var currCell = gBoard[i][j]
    if (!currCell.isMarked) addMarkCell(currCell, elCell)
    else removeMarkCell(currCell, elCell)
}

function addMarkCell(currCell, elCell) {
    currCell.isMarked = true
    gGame.markedCount++
    elCell.innerHTML = FLAG_IMG
    checkGameOver()
}

function removeMarkCell(currCell, elCell) {
    currCell.isMarked = false
    gGame.markedCount--
    elCell.innerHTML = ''
}

function checkGameOver() {
    var emptyCells = gLevel.SIZE ** 2 - gLevel.MINES
    console.log(emptyCells, gLevel.MINES, gGame.shownCount, gGame.markedCount)
    if (gGame.shownCount === emptyCells && gGame.markedCount === gLevel.MINES) {
        gGame.isOn = false
        console.log('You won!!')
        endTimer()
        toggleWinning()
    }
}

function restartGame() {
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
    endTimer()
    onInit()
}

function startTimer() {
    var start = Date.now();
    gIntervalTimer = setInterval(() => {
    gGame.secsPassed = Math.floor((Date.now() - start) / 1000)   // in seconds
    renderSettingsDisplay()
    }, 1000)
}

function endTimer() {
    clearInterval(gIntervalTimer)
}

function toggleWinning() {
	const elTable = document.querySelector('.board')
	elTable.classList.toggle('hidden')
	const elVictory = document.querySelector('.victory')
	elVictory.classList.toggle('hidden')
}

function toggleLoosing() {
	const elTable = document.querySelector('.board')
	elTable.classList.toggle('hidden')
	const elVictory = document.querySelector('.loss')
	elVictory.classList.toggle('hidden')
}