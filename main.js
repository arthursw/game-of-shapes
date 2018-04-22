var canvas = document.getElementById('canvas');
paper.setup(canvas);

let parameters = {
    nCells: 250,
    nIterations: 100,
    speed: 500,
    rule: 30
}

var ConvertBase = function (num) {
    return {
        from : function (baseFrom) {
            return {
                to : function (baseTo) {
                    return parseInt(num, baseFrom).toString(baseTo);
                }
            };
        }
    };
};

// binary to decimal
ConvertBase.bin2dec = function (num) {
    return ConvertBase(num).from(2).to(10);
};

// binary to hexadecimal
ConvertBase.bin2hex = function (num) {
    return ConvertBase(num).from(2).to(16);
};

// decimal to binary
ConvertBase.dec2bin = function (num) {
    return ConvertBase(num).from(10).to(2);
};

// decimal to hexadecimal
ConvertBase.dec2hex = function (num) {
    return ConvertBase(num).from(10).to(16);
};

// hexadecimal to binary
ConvertBase.hex2bin = function (num) {
    return ConvertBase(num).from(16).to(2);
};

// hexadecimal to decimal
ConvertBase.hex2dec = function (num) {
    return ConvertBase(num).from(16).to(10);
};


let noteMin = 21
let noteMax = 108
let noteNumber = 88

let cells = []
let n = 1

let rules = {}

let generateRules = ()=> {

    let rulesPatterns = ['000', '001', '010', '011', '100', '101', '110', '111']


    let ruleBinaryNumber = ConvertBase.dec2bin(parameters.rule)
    ruleBinaryNumber = '00000000'.substr(ruleBinaryNumber.length) + ruleBinaryNumber

    rules = {}

    for(let i=0 ; i<rulesPatterns.length ; i++) {
        rules[ rulesPatterns[rulesPatterns.length - 1 - i] ] = ruleBinaryNumber[i]
    }

}

let shapes = {
    '000': (width, height) => {},
    '001': (width, height) => new paper.Path.Rectangle(0, 0, width, height),
    '010': (width, height) => new paper.Path.Circle(width/2, height/2, Math.min(width/2, height/2)),
    '011': (width, height) => new paper.Path({
                                                  segments: [[0, 0], [width, 0], [width/2, height]],
                                                  fillColor: 'black',
                                                  closed: true
                                              }),
    '100': (width, height) => new paper.Path.Rectangle(0, 0, width, height/3),
    '101': (width, height) => new paper.Path.Rectangle(0, 0, width/3, height),
    '110': (width, height) => new paper.Path.Circle(width/2, height/2, Math.min(width/2, height/2)/3),
    '111': (width, height) => new paper.Path({
                                                segments: [[0, height], [width, height], [width/2, 0]],
                                                fillColor: 'black',
                                                closed: true
                                            }),
}



let rectangles = []

// addCell = (i)=> {
//     let size = paper.view.size.width / parameters.nCells
//     let topLeft = paper.view.bounds.topLeft.add(paper.view.size.width * i / parameters.nCells, n*size)
//     let bottomRight = topLeft.add(size)
//     let rectangle = new paper.Path.Rectangle(topLeft, bottomRight)
//     rectangle.fillColor = 'white'
//     rectangles.push(rectangle)

// }

let bg = new paper.Path.Rectangle(paper.view.bounds.topLeft, paper.view.bounds.bottomRight)
bg.fillColor = 'black'

let squares = new paper.Group()
let paused = false

let grid = []

let cellSize = Math.min(paper.view.size.height / 2 / 100, paper.view.size.width / parameters.nCells)
let squaresX = ( paper.view.size.width - parameters.nCells * cellSize ) / 2
let squaresY = ( paper.view.size.height / 2 - cellSize * 100 ) / 2

let text = null
let generateGrid = ()=> {
    squares.clear()
    grid = []
    cells = []

    for(let i=0 ; i<parameters.nCells ; i++ ) {
        cells.push(0)
    }

    cells[parameters.nCells/2] = 1

    grid.push([...cells])

    for(let n=0 ; n<parameters.nIterations ; n++) {

        let cellsString = '' + cells[cells.length-1] + cells.join('') + cells[0]


        for(let i=0 ; i<parameters.nCells ; i++) {

            if(cells[i] == '1') {
                let square = new paper.Path.Rectangle(squaresX + i*cellSize, squaresY + n*cellSize, cellSize, cellSize)
                square.fillColor = 'white'
                squares.addChild(square)
            }

            let pattern = cellsString.substr(i, 3)
            cells[i] = rules[pattern]

        }
        
        grid.push([...cells])
    }

    if(text != null) {
        text.remove()
    }
    text = new paper.PointText(new paper.Point(10, 20));
    text.justification = 'left';
    text.fillColor = 'red';
    text.content = 'Rule n°' + parameters.rule;
}

reset = ()=> {
    generateRules()
    generateGrid()
}

reset()

let group = new paper.Group()

let generateFrame = ()=> {
    draw()
    n++
}

let draw = ()=> {

    if(n >= 0 && n < parameters.nIterations) {

        cells = grid[n]
        let cellsString = '' + cells[cells.length-1] + cells.join('') + cells[0]
        
        group.clear()
        
        let cellSizes = []
        let previousCell = null
        let nCurrentCellX = 1

        for(let i=0 ; i<parameters.nCells ; i++) {
            let cell = cellsString[i+1]
            if(cell != previousCell && previousCell != null) {
                cellSizes.push(nCurrentCellX)
                nCurrentCellX = 1
            } else {
                nCurrentCellX++
            }
            previousCell = cell

        }
        cellSizes.push(nCurrentCellX)

        let nCellsX = cellSizes.length

        let currentX = 0
        let top = paper.view.size.height / 2
        let currentY = 0
        let currentNCellsX = 0
        previousCell = null

        // let background = new paper.Path.Rectangle(10, top, paper.view.size.width - 10, paper.view.size.height / 2)
        // background.fillColor = 'yellow'

        let stepX = paper.view.size.width / nCellsX
        let stepY = (paper.view.size.height / 2) / cellSizes[0]
        for(let i=0 ; i<parameters.nCells ; i++) {
            let pattern = cellsString.substr(i, 3)
            
            let cell = cellsString[i+1]
            if(cell != previousCell && previousCell != null) {
                currentNCellsX++
                currentX += stepX
                currentY = 0
                stepY = (paper.view.size.height / 2) / cellSizes[currentNCellsX]
            }

            previousCell = cell

            let width = stepX * 0.8
            let height = stepY * 0.8
            let path = shapes[pattern](width, height)
            if(path) {
                path.bounds.center.x = currentX + width / 2
                path.bounds.center.y = top + currentY + height / 2
                path.pivot = path.bounds.center
                path.fillColor = 'white'
                group.addChild(path)
            }
            currentY += stepY
        }

        let highlight = new paper.Path.Rectangle(squaresX, squaresY + n * cellSize, cellSize * parameters.nCells, cellSize)
        highlight.fillColor = 'red'
        highlight.fillColor.alpha = 0.50
        group.addChild(highlight)

        let mask = new paper.Path.Rectangle(squaresX, squaresY + (n + 1) * cellSize, cellSize * parameters.nCells, cellSize * (parameters.nIterations - 1 - n))
        mask.fillColor = 'black'
        group.addChild(mask)
    }

    text.bringToFront()
}

let intervalID = setInterval(generateFrame, parameters.speed)

let tool = new paper.Tool()

tool.onKeyDown = function(event) {

    if (event.key == 'left') {
        if(parameters.rule > 0) {
            parameters.rule--
        }
        reset()
        draw()
    } else if(event.key == 'right') {
        if(parameters.rule < 256) {
            parameters.rule++
        }
        reset()
        draw()
    }

    if (event.key == 'up') {
        if(n > 0) {
            n--
            draw()
        }
    } else if(event.key == 'down') {
        if(n < parameters.nIterations) {
            n++
            draw()
        }
    } else if(event.key == 'space') {
        if(!paused) {
            clearInterval(intervalID)
        } else {
            intervalID = setInterval(generateFrame, parameters.speed)
        }
        paused = !paused
    }
}

let drawFromMouse = (event)=> {
    n = Math.floor(Math.max(0, Math.min(event.point.y / cellSize, parameters.nIterations)))
    draw()
}

tool.onMouseDown = drawFromMouse
tool.onMouseDrag = drawFromMouse

let noteOn = function(e) {
    for(let r of rectangles) {
        r.remove()
    }
    for(let i=0 ; i<parameters.nCells ; i++ ) {
        cells[i]=0
    }
    n = 1
    let i = Math.floor(parameters.nCells * (e.note.number - noteMin) / noteNumber)
    cells[i] = 1
    addCell(i)
}
