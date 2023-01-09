/**
 * A global size
 */
let size = 9;

/**
 * A row indication matrix
 */
let rowIndexes;

/**
 * A column indication matrix
 */
let colIndexes;

/**
 * A block indication matrix
 */
let blockIndexes;

/**
 * The whole board matrix
 */
let generatedSudokuBoard;

/**
 * The whole hidden board matrix
 */
let hiddenBoard;

/**
 * A matrix that changes according to the user's input
 */
let playBoard;

/**
 * The board's blocks' index location matrix
 */
let blocks = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

/**
 * The current level that is chosen on the previous page
 */
let level = window.localStorage.getItem('level');

/**
 * The last element that the user selected
 */
let selectedCell;

/**
 * A flag that indicates if the game is over
 */
let gameOver;

generateSudoku();

const boardElement = document.querySelector('body');
boardElement.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (!selectedCell) return;

  let keyCode = e.keyCode;
  let key = e.key;

  // pressing the arrows
  if (keyCode > 36 && keyCode < 41) {
    let row = getSelectedCellRow();
    let col = getSelectedCellCol();
    switch (keyCode) {
      // left arrow
      case 37:
        col = moveBackward(col);
        break;

      // up arrow
      case 38:
        row = moveBackward(row);
        break;

      // right arrow
      case 39:
        col = moveForward(col);
        break;

      // down arrow
      case 40:
        row = moveForward(row);
        break;
    }
    const element = document.getElementById(`${row}-${col}`);
    updateSelectedCell(element);
    return;
  }

  // Escape key
  if (keyCode == 27) {
    removeAllSelections();
    return;
  }

  // 1-9 keys
  if (key >= '1' && key <= '9') {
    // if the selected cell is unchangeable
    if (selectedCell.className.indexOf('cell') != -1) {
      removeAnotherSelection();
      selectedSameDigits(key);
      return;
    }

    removeAnotherSelection();
    selectedCell.innerHTML = key;
    selectedSameDigits(key);

    let row = getSelectedCellRow();
    let col = getSelectedCellCol();
    playBoard[row][col] = Number(key); // update the play board

    if (isFullBoard(playBoard)) checkTheBoard();
    return;
  }

  // back-space or delete keys
  if (keyCode == 8 || keyCode == 46) {
    // Prevents the deletion of a number that is generating
    if (selectedCell.className.indexOf('hidden') == -1) return;

    selectedCell.innerHTML = '';
    let row = getSelectedCellRow();
    let col = getSelectedCellCol();
    playBoard[row][col] = '';
    removeAnotherSelection();
    return;
  }
});

/**
 * The function updates the last element that was selected
 * @param {HTMLElement} element an HTML element the user selected
 */
function updateSelectedCell(element) {
  removeAllSelections();

  if (gameOver) return;

  selectedCell = element;
  if (selectedCell.innerHTML != '') {
    selectedSameDigits(selectedCell.innerHTML);
  }
  selectedCell.setAttribute(
    'class',
    `${selectedCell.className} selected chosen`
  );
}

/**
 * The function marks all the elements with the same digit on the board
 * @param {String} digit a string that the function marks by
 */
function selectedSameDigits(digit) {
  let row = getSelectedCellRow();
  let col = getSelectedCellCol();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (row == i && col == j) continue;
      if (playBoard[i][j] == digit) {
        const element = document.getElementById(`${i}-${j}`);
        element.setAttribute('class', `${element.className} selected`);
      }
    }
  }
}

/**
 * The function resets all the elements on the board
 * (includes the 'selected cell')
 */
function removeAllSelections() {
  removeAnotherSelection();
  if (selectedCell) resetElement(selectedCell);
}

/**
 * The function resets all the other elements on the board
 * (except the 'selected cell')
 */
function removeAnotherSelection() {
  if (!selectedCell) return;
  let row = getSelectedCellRow();
  let col = getSelectedCellCol();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i == row && j == col) continue;
      const element = document.getElementById(`${i}-${j}`);
      resetElement(element);
    }
  }
}

/**
 * The function removes from the element all the classes added to it
 * @param {HTMLElement} element
 */
function resetElement(element) {
  // debugger;
  let prevName = getTheFirstClassName(element.className);
  element.setAttribute('class', prevName);
}

/**
 * The function extracts the first class name
 * @param {String} name the whole class name
 * @returns the first class name
 */
function getTheFirstClassName(name) {
  if (name.indexOf(' ') != -1) {
    return name.substring(0, name.indexOf(' '));
  }
  return name;
}

/**
 * The function increases a given index
 * @param {number} num the starting index
 * @returns the increased index
 */
function moveForward(num) {
  let index = num;
  index++;
  if (index == size) index = 0;
  return index;
}

/**
 * The function decreases a given index
 * @param {number} num the starting index
 * @returns the decreased index
 */
function moveBackward(num) {
  let index = num;
  index--;
  if (index == -1) index = size - 1;
  return index;
}

/**
 * The function generates a full sudoku matrix
 */
function generateSudoku() {
  if (!level) changeLevel();

  reset();
  let randomNum;
  let matCount = 0;
  for (let i = 0; i < size; i++) {
    let rowCount = 0;
    let row = [];
    for (let j = 0; j < size; j++) {
      randomNum = getRandomNum(1, 9);
      let blockIndex = getBlockIndex(i, j);
      if (
        rowIndexes[i][randomNum - 1] ||
        colIndexes[j][randomNum - 1] ||
        blockIndexes[blockIndex][randomNum - 1]
      ) {
        if (matCount == 5000) {
          reset();
          i = -1;
          matCount = 0;
          break;
        }
        if (rowCount == 50) {
          row = removeCurrentRow(row, i);
          rowCount = 0;
          j = -1;
        } else {
          matCount++;
          rowCount++;
          j--;
        }
        continue;
      }
      row.push(randomNum);
      rowIndexes[i][randomNum - 1] = true;
      colIndexes[j][randomNum - 1] = true;
      blockIndexes[blockIndex][randomNum - 1] = true;
      rowCount = 0;
    }
    if (row.length == 9) generatedSudokuBoard.push(row);
  }
  hideTheBoard();
}

/**
 * The function generates the hidden matrix according to the selected level
 */
function hideTheBoard() {
  resetElements();

  let presentCellAmount = 81 - level * 20;
  if (level == 3) presentCellAmount = 27;
  let presentCellsCount = 0;
  let row, col, blockIndex, num;
  let rowCounter, colCounter, blockCounter;
  if (level == 3) {
    rowCounter = setZero(size);
    colCounter = setZero(size);
    blockCounter = setZero(size);
  }

  hiddenBoard = getEmptyMat(size);
  while (presentCellsCount < presentCellAmount) {
    row = getRandomNum(0, 8);
    col = getRandomNum(0, 8);
    blockIndex = getBlockIndex(row, col);
    num = generatedSudokuBoard[row][col];
    if (hiddenBoard[row][col] == '') {
      // checking for the hard level
      if (level == 3) {
        if (presentCellsCount < presentCellAmount) {
          if (
            rowCounter[row] == 3 ||
            colCounter[col] == 3 ||
            blockCounter[blockIndex] == 3
          )
            continue;
          else {
            rowCounter[row]++;
            colCounter[col]++;
            blockCounter[blockIndex]++;
          }
        }
      }

      hiddenBoard[row][col] = num;
      presentCellsCount++;
      const element = document.getElementById(`${row}-${col}`);
      element.setAttribute('class', 'cell');
    }
  }
  presentBoard();
}

/**
 * The function resets all the elements classes in the screen
 */
function resetElements() {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const element = document.getElementById(`${i}-${j}`);
      element.setAttribute('class', `${gameOver ? 'cell' : 'hidden'}`);
      element.removeEventListener('click', updateSelectedCell(element));
    }
  }
  resetHints();
}

/**
The function resets all the hints 
*/
function resetHints() {
  let hintElements = document.querySelectorAll('.hint');
  for (let i = 0; i < hintElements.length; i++) {
    resetElement(hintElements[i]);
  }
}

/**
 * The function disables all the hints in the game
 */
function disableHints() {
  let hintElements = document.querySelectorAll('.hint');
  for (let i = 0; i < hintElements.length; i++) {
    disableHint(i + 1);
  }
}

/**
 * The function presents the hidden matrix on the screen
 */
function presentBoard() {
  if (gameOver) return;
  if (selectedCell) selectedCell = '';

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const element = document.getElementById(`${i}-${j}`);
      element.innerHTML = hiddenBoard[i][j];
      resetElement(element);
      element.addEventListener('click', () => {
        updateSelectedCell(element);
      });
    }
  }
  playBoard = copyMatrix(hiddenBoard);
}

/**
 *
 * @param {Array[]} board a matrix
 * @returns if the given board is full
 */
function isFullBoard(board) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] == '') return false;
    }
  }
  return true;
}

/**
 * The function checks if the 'playBoard' matrix is correct according to the 'generatedSudokuBoard'
 */
function checkTheBoard() {
  if (gameOver) return;

  if (!confirm('Are you want to check the board?')) return;

  gameOver = true;
  resetElements();
  disableHints();

  resetToHidden();

  isDigitCorrect = false;
  let errorCount = 0;
  let totalAmount = level * 20;
  if (level == 3) totalAmount = 54;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (hiddenBoard[i][j] != '') continue;
      const element = document.getElementById(`${i}-${j}`);
      let num = Number(playBoard[i][j]);
      let blockIndex = getBlockIndex(i, j);

      let firstBlockRow = i - (i % 3);
      let firstBlockCol = j - (j % 3);
      if (
        playBoard[i].indexOf('') != -1 ||
        !isFullCol(j) ||
        !isFullBlock(firstBlockRow, firstBlockCol)
      ) {
        isDigitCorrect = playBoard[i][j] == generatedSudokuBoard[i][j];
      } else {
        isDigitCorrect =
          !rowIndexes[i][num - 1] &&
          !colIndexes[j][num - 1] &&
          !blockIndexes[blockIndex][num - 1];
      }
      rowIndexes[i][num - 1] = true;
      colIndexes[j][num - 1] = true;
      blockIndexes[blockIndex][num - 1] = true;
      if (!isDigitCorrect) {
        element.setAttribute('class', `${element.className} error`);
        errorCount++;
        continue;
      }
      element.setAttribute('class', `${element.className} correct`);
    }
  }

  let isAWin = errorCount == 0;
  if (!isAWin) {
    let successCount = totalAmount - errorCount;
    let score = Math.round((successCount / totalAmount) * 100).toFixed(0); // the score calculation
    alert(`Your score is ${score}/100`);
    return;
  }
  alert('Congratulations\nYou solved this board!');
}

/**
 * The function cleans a row from the board
 * @param {Array} row the specific row
 * @param {number} rowIndex the row's index
 * @returns an empty array
 */
function removeCurrentRow(row, rowIndex) {
  for (let j = 0; j < row.length; j++) {
    let num = row[j];
    let blockIndex = getBlockIndex(rowIndex, j);
    rowIndexes[rowIndex][num - 1] = false;
    colIndexes[j][num - 1] = false;
    blockIndexes[blockIndex][num - 1] = false;
  }
  return [];
}

/**
 *
 * @param {number} row the row's index
 * @param {number} col the column's index
 * @returns the specific block index in the board
 */
function getBlockIndex(row, col) {
  row = Math.floor(row / 3);
  col = Math.floor(col / 3);
  return blocks[row][col];
}

/**
 * The function generates a matrix filled with false
 * @param {number} size the size of the square matrix
 * @returns a square matrix filled with false
 */
function setFalseMat(size) {
  let mat = [];
  for (let i = 0; i < size; i++) {
    mat.push(setFalseArr(size));
  }
  return mat;
}

/**
 * The function generates an array filled with false
 * @param {number} size the length of the array
 * @returns an array filled with false
 */
function setFalseArr(size) {
  let arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(false);
  }
  return arr;
}

/**
 * The function generates a random number between two numbers
 * @param {number} num1 first number
 * @param {number} num2 second number
 * @returns a random number between num1 and num2
 */
function getRandomNum(num1, num2) {
  if (num1 > num2) {
    let temp = num1;
    num1 = num2;
    num2 = temp;
  }
  let random = Math.random() * (num2 - num1 + 1) + num1;
  return Math.floor(random);
}

/**
 * reset all the auxiliary matrices according to the hidden board
 */
function resetToHidden() {
  setFalse();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let num = hiddenBoard[i][j];
      let blockIndex = getBlockIndex(i, j);
      rowIndexes[i][num - 1] = true;
      colIndexes[j][num - 1] = true;
      blockIndexes[blockIndex][num - 1] = true;
    }
  }
}

/**
 * The function resets all the auxiliary variables
 */
function reset() {
  setFalse();
  generatedSudokuBoard = [];
  gameOver = false;
}

/**
 * The function resets all the auxiliary matrices
 */
function setFalse() {
  rowIndexes = setFalseMat(size);
  colIndexes = setFalseMat(size);
  blockIndexes = setFalseMat(size);
}

/**
 * The function generates an array filled with zeros
 * @param {Number} size the length of the array
 * @returns an array filled with zeros
 */
function setZero(size) {
  let arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(0);
  }
  return arr;
}

/**
 * The function generates an empty matrix
 * @param {Number} size the size of the matrix
 * @returns an empty matrix
 */
function getEmptyMat(size) {
  let mat = [];
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
}

/**
 * The function copies a given matrix
 * @param {Array[]} board a matrix
 * @returns a copied matrix
 */
function copyMatrix(board) {
  let mat = [];
  let arr;
  for (let i = 0; i < board.length; i++) {
    arr = [];
    for (let j = 0; j < board[i].length; j++) {
      arr.push(board[i][j]);
    }
    mat.push(arr);
  }
  return mat;
}

/**
 * The function redirects to the level change page
 */
function changeLevel() {
  window.location.href = './ChooseLevel.html';
}

/**
 * @returns the selected cell row index
 */
function getSelectedCellRow() {
  let id = selectedCell.id;
  return Number(id.charAt(0));
}

/**
 * @returns the selected cell column index
 */
function getSelectedCellCol() {
  let id = selectedCell.id;
  return Number(id.charAt(2));
}

/**
 * The function disables a specific hint according to the given index
 * @param {number} hintNum the hint index
 */
function disableHint(hintNum) {
  const hintElement = document.getElementById(`hint-${hintNum}`);
  hintElement.setAttribute('class', `${hintElement.className} disable`);
}

/**
 * The function checks if there is an incorrect full row
 * If so, she marks that row
 */
function findAWrongRow() {
  removeAllSelections();

  for (let i = 0; i < size; i++) {
    if (playBoard[i].indexOf('') != -1) continue;
    for (let j = 0; j < size; j++) {
      if (hiddenBoard[i][j] != '') continue;
      if (playBoard[i][j] != generatedSudokuBoard[i][j]) {
        MakeARowIncorrect(i);
        disableHint(1);
        return;
      }
    }
  }

  alert('All the full rows are correct!');
  disableHint(1);
}

/**
 * The function checks if there is an incorrect full column
 * If so, she marks that column
 */
function findAWrongCol() {
  removeAllSelections();

  for (let j = 0; j < size; j++) {
    if (!isFullCol(j)) continue;
    for (let i = 0; i < size; i++) {
      if (hiddenBoard[i][j] != '') continue;
      if (playBoard[i][j] != generatedSudokuBoard[i][j]) {
        MakeAColIncorrect(j);
        disableHint(2);
        return;
      }
    }
  }

  alert('All the full columns are correct!');
  disableHint(2);
}

/**
 * The function checks if there is an incorrect full block
 * If so, she marks that block
 */
function findAWrongBlock() {
  removeAllSelections();

  for (let i = 0; i < size; i += 3) {
    for (let j = 0; j < size; j += 3) {
      if (!isFullBlock(i, j)) continue;
      if (!isCorrectBlock(i, j)) {
        MakeABlockIncorrect(i, j);
        disableHint(3);
        return;
      }
    }
  }

  alert('All the full blocks are correct!');
  disableHint(3);
}

/**
 * The function checks if there is an incorrect inserted digit
 * If so, she marks that block
 */
function findAWrongDigit() {
  removeAllSelections();

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (playBoard[i][j] == '') continue;
      if (playBoard[i][j] != generatedSudokuBoard[i][j]) {
        const element = document.getElementById(`${i}-${j}`);
        element.setAttribute('class', `${element.className} error`);
        disableHint(4);
        return;
      }
    }
  }

  alert('All the inserted numbers are correct!');
  disableHint(4);
}

/**
 * The function generates a random number from the 'generatedSudokuBoard'
 */
function discoverDigit() {
  removeAllSelections();
  while (true) {
    let row = getRandomNum(0, 8);
    let col = getRandomNum(0, 8);

    if (playBoard[row][col] != '') continue;

    playBoard[row][col] = generatedSudokuBoard[row][col];
    const element = document.getElementById(`${row}-${col}`);
    element.innerHTML = playBoard[row][col];

    updateSelectedCell(element);
    removeAnotherSelection();
    break;
  }
  disableHint(5);
}

/**
 * The function marks a row as an incorrect row
 * @param {number} rowIndex a specific row index
 */
function MakeARowIncorrect(rowIndex) {
  for (let col = 0; col < size; col++) {
    const element = document.getElementById(`${rowIndex}-${col}`);
    element.setAttribute('class', `${element.className} error`);
  }
}

/**
 * The function marks a column as an incorrect column
 * @param {number} colIndex a specific column index
 */
function MakeAColIncorrect(colIndex) {
  for (let row = 0; row < size; row++) {
    const element = document.getElementById(`${row}-${colIndex}`);
    element.setAttribute('class', `${element.className} error`);
  }
}

/**
 * The function marks a block as an incorrect block
 * @param {number} row a row index
 * @param {number} col a column index
 */
function MakeABlockIncorrect(row, col) {
  for (let i = row; i < row + 3; i++) {
    for (let j = col; j < col + 3; j++) {
      const element = document.getElementById(`${i}-${j}`);
      element.setAttribute('class', `${element.className} error`);
    }
  }
}

/**
 * @param {number} col a column index
 * @returns if the specific column is entire, according to a given index
 */
function isFullCol(col) {
  for (let i = 0; i < size; i++) {
    if (playBoard[i][col] == '') return false;
  }
  return true;
}

/**
 * @param {number} row a top row index
 * @param {number} col a left column index
 * @returns if the specific block is entire, according to the given indexes
 */
function isFullBlock(row, col) {
  for (let i = row; i < row + 3; i++) {
    for (let j = col; j < col + 3; j++) {
      if (playBoard[i][j] == '') return false;
    }
  }
  return true;
}

/**
 * @param {number} row a row index
 * @param {number} col a column index
 * @returns if the specific block is correct, according to the given indexes
 */
function isCorrectBlock(row, col) {
  for (let i = row; i < row + 3; i++) {
    for (let j = col; j < col + 3; j++) {
      if (hiddenBoard[i][j] != '') continue;
      if (playBoard[i][j] != generatedSudokuBoard[i][j]) return false;
    }
  }
  return true;
}
