'use strict'

var gIsHint
var gRestartEmoji
var gIsWinning
var gIntervalTimer
var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, lives: 3, safeClick: 3, exterminator: 1 }

const MINE_IMG = '<img src="img/mine.png">'
const FLAG_IMG = '<img src="img/flag.png">'

function onInit() {
    gGame.isOn = true
    gRestartEmoji = '<img src="img/smiley.png">'
    renderSettingsDisplay()
    gBoard = buildBoard()
    renderBoard(gBoard)
    // console.table(gBoard) // debug
}

// Render the settings
function renderSettingsDisplay() {
    var htmlStr = `LIVES: ${gGame.lives}    ||  
    <button class="restartBtnEmoji" onclick="restartGame()">${gRestartEmoji}</button>
    ||    TIME: ${String(gGame.secsPassed).padStart(2, '0')} || 
    <button class="exterminator" onclick="useExterminator(this)">Exterminator</button>`

    const elStgDisplay = document.querySelector('.game-state')
    elStgDisplay.innerHTML = htmlStr

    const elSafeClicksBtn = document.querySelector('.safe-click button')
    elSafeClicksBtn.innerText = `${gGame.safeClick} Safe Clicks`
}

// Set the game level
function onSetLevel(elBtn) {
    if (!gGame.isOn) return
    const formerOnLevel = document.querySelector('.onLevel')
    formerOnLevel.classList.remove('onLevel')
    elBtn.classList.add('onLevel')

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
    changeLevel()
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

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    if (gIsHint) return revealNegs({ i, j })
    var currCell = gBoard[i][j]

    if (!gGame.shownCount) {
        startTimer()
        gGame.shownCount++
        currCell.isShown = true
        elCell.classList.add('empty')

        setMinesRandomLocation(gBoard)
        setMinesNegsCount(gBoard)

        if (!currCell.minesAroundCount) {
            expandShown(gBoard, { i, j })
        } else {
            elCell.innerText = currCell.minesAroundCount
            addColorText(elCell, currCell.minesAroundCount)
        }
        return
    }

    if (currCell.isMine) {
        gGame.lives--
        if (gGame.lives > 0) {
            toggleFail()
            setTimeout(toggleFail, 750)
        } else {
            revealMinesCells()
            elCell.classList.add('fail')
            gGame.isOn = false
            gIsWinning = false
            gRestartEmoji = '<img src="img/sad.png">'
            renderSettingsDisplay()
            endTimer()
            setTimeout(toggleLoosing, 2500)
        }
        return
    } else {
        gGame.shownCount++
        currCell.isShown = true
        elCell.classList.add('empty')
        if (!currCell.minesAroundCount) {
            expandShown(gBoard, { i, j })
        } else {
            elCell.innerText = currCell.minesAroundCount
            addColorText(elCell, currCell.minesAroundCount)
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

// Expand when empty cell is clicked
function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMarked || board[i][j].isShown) continue
            if (i === pos.i && j === pos.j) continue

            const elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('empty')
            gGame.shownCount++
            board[i][j].isShown = true

            if (!board[i][j].minesAroundCount) expandShown(board, { i, j })

            if (board[i][j].minesAroundCount) {
                elCell.innerText = board[i][j].minesAroundCount
                addColorText(elCell, board[i][j].minesAroundCount)
            }
        }
    }
}

function onCellMarked(elCell, ev, i, j) {
    ev.preventDefault()
    if (!gGame.shownCount || !gGame.isOn || gBoard[i][j].isShown || gIsHint) return
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
    if (gGame.exterminator) var minusMines = 0
    else minusMines = 3
    if (gGame.shownCount === emptyCells && gGame.markedCount === (gLevel.MINES - minusMines)) {
        gGame.isOn = false
        gIsWinning = true
        gRestartEmoji = '<img src="img/sunglasses.png">'
        renderSettingsDisplay()
        endTimer()
        toggleWinning()
    }
}

function changeLevel() {
    restartHints()
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, lives: 3, safeClick: 3, exterminator: 1 }
    endTimer()
    onInit()
}

function restartGame() {
    if (gGame.isOn) return changeLevel()
    restartHints()
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, lives: 3, safeClick: 3, exterminator: 1 }
    if (gIsWinning) toggleWinning()
    else toggleLoosing()
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
    const elLoosing = document.querySelector('.loss')
    elLoosing.classList.toggle('hidden')
}

function toggleFail() {
    const elTable = document.querySelector('.board')
    elTable.classList.toggle('hidden')
    const elFailImg = document.querySelector('.bomb-click')
    elFailImg.classList.toggle('hidden')
}

function useHint(elBulb) {
    if (!gGame.isOn) return
    elBulb.src = "img/bulb-on.png"
    gIsHint = true
}

function revealNegs(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            var currCell = gBoard[i][j]
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (currCell.isMine) elCell.innerHTML = MINE_IMG
            else elCell.innerHTML = currCell.minesAroundCount
        }
    }
    setTimeout(hideNegs, 1000, pos)

    const elBulbs = document.querySelectorAll('.bulb')
    elBulbs[0].remove()
    if (elBulbs.length > 1) elBulbs[1].setAttribute('onclick', 'useHint(this)')
}

function hideNegs(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isShown) continue
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (currCell.isMarked) elCell.innerHTML = FLAG_IMG
            else elCell.innerText = ''
        }
    }
    gIsHint = false
}

function restartHints() {
    gIsHint = false

    const elHints = document.querySelector('.hints')
    elHints.innerHTML = `HINTS: <img class="bulb" src="img/bulb-off.png" onclick="useHint(this)">
    <img class="bulb" src="img/bulb-off.png">
    <img class="bulb" src="img/bulb-off.png">`
}

function safeClick() {
    if (!gGame.isOn || !gGame.safeClick) return
    var emptyPositions = getEmptyPos(gBoard)
    if (emptyPositions === null) return

    const idx = getRandomIntInclusive(0, emptyPositions.length - 1)
    var currPos = emptyPositions[idx]

    const elCell = document.querySelector(`.cell-${currPos.i}-${currPos.j}`)
    elCell.classList.toggle('highlight')
    setTimeout(() => elCell.classList.toggle('highlight') ,600)

    gGame.safeClick--
}

function useExterminator(elBtn) {
    if (!gGame.isOn || !gGame.exterminator || gLevel.MINES === 2) return
    
    var minesPositions = getMinesPos(gBoard)
    for (var i = 0; i < 3; i++) {
        const idx = getRandomIntInclusive(0, minesPositions.length - 1)
        var currPos = minesPositions.splice(idx, 1)[0]
        gBoard[currPos.i][currPos.j].isMine = false
    }
    setMinesNegsCount(gBoard)

    gGame.exterminator--
    elBtn.style.backgroundColor = 'gray'
}