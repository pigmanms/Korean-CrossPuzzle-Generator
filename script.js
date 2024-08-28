function generateCrossword() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const gridSize = parseInt(document.getElementById('gridSize').value);

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result.trim();
            const lines = content.split('\n').map(line => line.trim());
            const wordsAndHints = lines.map(line => {
                const [word, hint] = line.split(':');
                return { word: word.trim(), hint: hint.trim() };
            });

            let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
            
            placeWordsOptimized(grid, wordsAndHints, gridSize);

            if (validateGrid(grid)) {
                displayGrid(grid, gridSize);
                displayHints(wordsAndHints);
            } else {
                alert('퍼즐을 생성할 수 없습니다. 단어들을 다시 확인해주세요.');
            }
        };
        reader.readAsText(file);
    }
}

function placeWordsOptimized(grid, wordsAndHints, gridSize) {
    wordsAndHints.sort((a, b) => b.word.length - a.word.length); // 단어를 길이 순으로 정렬합니다.

    wordsAndHints.forEach(({ word }, wordIndex) => {
        let placed = false;
        let bestPosition = null;
        let maxIntersections = 0;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                let intersections = countIntersections(grid, word, row, col, true);
                if (intersections > maxIntersections && canPlaceHorizontally(grid, word, row, col, gridSize)) {
                    maxIntersections = intersections;
                    bestPosition = { row, col, horizontal: true };
                }

                intersections = countIntersections(grid, word, row, col, false);
                if (intersections > maxIntersections && canPlaceVertically(grid, word, row, col, gridSize)) {
                    maxIntersections = intersections;
                    bestPosition = { row, col, horizontal: false };
                }
            }
        }

        if (bestPosition) {
            if (bestPosition.horizontal) {
                placeHorizontally(grid, word, bestPosition.row, bestPosition.col);
            } else {
                placeVertically(grid, word, bestPosition.row, bestPosition.col);
            }
            placed = true;
        }
    });
}

function countIntersections(grid, word, row, col, horizontal) {
    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
        const currentChar = word[i];
        const gridChar = horizontal ? grid[row][col + i] : grid[row + i][col];
        
        if (gridChar === currentChar) {
            intersections++;
        } else if (gridChar !== '') {
            return -1; // 충돌 발생 시 교차점 없음
        }
    }
    return intersections;
}

function canPlaceHorizontally(grid, word, row, col, gridSize) {
    // 단어가 그리드를 벗어나는지 확인
    if (col + word.length > gridSize) return false;

    for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
            return false;
        }
    }
    return true;
}

function canPlaceVertically(grid, word, row, col, gridSize) {
    // 단어가 그리드를 벗어나는지 확인
    if (row + word.length > gridSize) return false;

    for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) {
            return false;
        }
    }
    return true;
}

function placeHorizontally(grid, word, row, col) {
    for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = word[i];
    }
}

function placeVertically(grid, word, row, col) {
    for (let i = 0; i < word.length; i++) {
        grid[row + i][col] = word[i];
    }
}

function validateGrid(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === '') {
                continue;
            }
            // 가로로 붙어있는 글자들 확인
            if (j > 0 && grid[i][j - 1] !== '' && j < grid[i].length - 1 && grid[i][j + 1] !== '') {
                if (grid[i][j - 1] !== grid[i][j + 1]) {
                    return false;
                }
            }
            // 세로로 붙어있는 글자들 확인
            if (i > 0 && grid[i - 1][j] !== '' && i < grid.length - 1 && grid[i + 1][j] !== '') {
                if (grid[i - 1][j] !== grid[i + 1][j]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function displayGrid(grid, gridSize) {
    const container = document.getElementById('crosswordContainer');
    container.innerHTML = '';

    const crosswordGrid = document.createElement('div');
    crosswordGrid.className = 'grid';
    crosswordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
    crosswordGrid.style.gridTemplateRows = `repeat(${gridSize}, 30px)`;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            if (grid[y][x] !== '') {
                cell.value = grid[y][x];
            } else {
                cell.className = 'black';
                cell.disabled = true;
            }
            crosswordGrid.appendChild(cell);
        }
    }

    container.appendChild(crosswordGrid);
}

function displayHints(wordsAndHints) {
    const container = document.getElementById('hintsContainer');
    container.innerHTML = '<h2>힌트</h2>';

    wordsAndHints.forEach(({ word, hint }, index) => {
        const hintElement = document.createElement('div');
        hintElement.className = 'hint';
        hintElement.innerText = `${index + 1}. ${hint}`;
        container.appendChild(hintElement);
    });
}
