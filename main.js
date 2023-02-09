const canvas = document.querySelector('#game')
const game = canvas.getContext('2d')
const btnUp = document.querySelector('#up')
const btnLeft = document.querySelector('#left')
const btnRight = document.querySelector('#right')
const btnDown = document.querySelector('#down')
const spanLives = document.querySelector('#lives')
const spanTime = document.querySelector('#time')
const spanRecord = document.querySelector('#record')
const pResult = document.querySelector('#result')
const ocultarJuego = document.querySelector('.game-container')
const ocultarWinSection = document.querySelector('.win-container')
const btnReiniciar = document.querySelector('#reiniciar')


window.addEventListener('load', setCanvasSize)  //esto indica que despues que todo el contenido html y css carguen, entonces inicie la funcion indicada
window.addEventListener('resize', setCanvasSize)  //para que ejecute una funcion mientras se hace el resize

// game.fillRect(0,0,100,100)     //indica en donde comienza a dibujar y en donde termina (xInicio, yInicio, xFinal, yFinal)
// game.clearRect(50,50,100,100)               //indica de que ejes X,Y a que ejes X,Y queremos borrar lo que este dibujado
// game.font = '25px Verdana'                  //Se le asigna el valor del tamaño de la fuente y el tipo de fuente
// game.style = 'purple'                   //Se le puede asignar color al elemento
// game.textAlign = 'center'               //Ubica el elemento teniendo en cuenta a los ejes X,Y
// game.fillText('Platzi')                 //Permite insertar texto

let canvasSize;
let elementsSize;
let level = 0
let lives = 3

let timeStart
let timePlayer
let timeInterval


const playerPosition = {
    x: undefined,
    y: undefined,
}

const giftPosition = {
    x: undefined,
    y: undefined,
}

let enemiesPositions = []


function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.8;
    } else {
        canvasSize = window.innerHeight * 0.8;
    }

    canvasSize = Number(canvasSize.toFixed(0))

    ocultarWinSection.style.display = "none"

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    btnReiniciar.addEventListener('click', gameReload)
    
    elementsSize = canvasSize / 10   //para definir el tamaño de los elementos dentro del canvas

    playerPosition.x = undefined
    playerPosition.y = undefined
    startGame()
}


function startGame() {
    game.font = elementsSize + 'px Verdana';  
    game.textAlign = 'end';

    const map = maps[level]

    if (!map) {
        gameWin()
        return
    }

    if (!timeStart) {
        timeStart = Date.now()
        timeInterval = setInterval(showTime, 100)
        showRecord()
    }

    const mapRows = map.trim().split('\n')    //split divide el array en distintos elementos dependiendo del valor entre parentesis, en este caso sera cada un salto de linea
    const mapRowCols = mapRows.map(row => row.trim().split(''))   //arreglo bidimensional

    showLives()

    enemiesPositions = []                 //para limpiar el array enemiesPositions cada vez que se reincie el codigo
    game.clearRect(0, 0, canvasSize, canvasSize)

    mapRowCols.forEach((row, rowI) => {   //forEach recibe el elemento que recorremos, y el Index
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);
      
            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                    console.log({playerPosition});
                }
            } else if (col == 'I') {
                giftPosition.x = posX;
                giftPosition.y = posY;
            } else if (col == 'X') {
                enemiesPositions.push({
                    x: posX,
                    y: posY,
                })
            }
            
            game.fillText(emoji, posX, posY);
        })
    })

    movePlayer()
    // for (let row = 1; row <= 10; row++) {
    //     for (let col = 1; col <= 10; col++) {
    //         game.fillText(emojis[mapRowCols[row - 1][col - 1]], elementsSize * col, elementsSize * row);
    //     }
    // } 
}


function movePlayer() {
    const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
    const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
    const giftCollision = giftCollisionX && giftCollisionY;
    
    if (giftCollision) {
      levelWin()
    }

    const enemyCollision = enemiesPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3)
        const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3)
        return enemyCollisionX && enemyCollisionY              //si ambos son true se cumple la funcion
    });
    
    if (enemyCollision) {
      levelFail()
    }
    
    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}


function levelWin() {
    console.log('Subiste de nivel!');
    level++
    startGame() 
}


function gameWin() {
    console.log('Terminaste el juego')
    clearInterval(timeInterval)

    ocultarJuego.style.display = "none"
    ocultarWinSection.style.display = "block"

    const recordTime = localStorage.getItem('record_time')  //getItem es para leer alguna informacion que tengamos dentro de localStorage
    const playerTime = Date.now() - timeStart

    if (recordTime) {
        if (recordTime >= playerTime) {
            localStorage.setItem('record_time', playerTime)  //setItem es para guardar una variable dentro del localStorage
            pResult.innerText = 'Superaste el record'
        } else {
            pResult.innerText = 'Lo siento, no superaste el record.\n Tu tiempo: ' + playerTime
        }
    } else {
        localStorage.setItem('record_time', playerTime)
        pResult.innerText = 'Primer juego para definir el record'
    }
    console.log({recordTime, playerTime})
}


function levelFail() {
    lives--
    console.log('Chocaste con una bomba! ' + lives)
    
    if (lives <= 0) {
        level = 0   
        lives = 3
        console.log('PERDISTE!')
        timeStart = undefined
    } 

    playerPosition.x = undefined
    playerPosition.y = undefined
    startGame()
}


//MOSTRAR los corazones
function showLives() {
    const heartsArray = Array(lives).fill(emojis['HEART'])  // Crea un array con las posiciones que tenga la variable lives, entonces con el metodo fill le insertamos en esas posiciones al valor HEART dentro del objeto emojis

    //spanLives.innerText = heartsArray.join(' ')
    spanLives.innerText = ''
    heartsArray.forEach(heart => spanLives.append(heart))
}


//MOstrar tiempo
function showTime() {
    spanTime.innerText = Date.now() - timeStart
}

function showRecord() {
    spanRecord.innerText = localStorage.getItem('record_time')
}

//Detectando movimiento
btnUp.addEventListener('click', moveUp)
btnLeft.addEventListener('click', moveLeft)
btnRight.addEventListener('click', moveRight)
btnDown.addEventListener('click', moveDown)

window.addEventListener('keydown', moveByKeys)


function moveUp() {
    console.log('Arriba')

    if ((playerPosition.y - elementsSize) < elementsSize) {
        console.log('OUT')
    } else {
        playerPosition.y -= elementsSize
        startGame()
    }
}

function moveLeft() {
    console.log('Izquierda')
    
    if ((playerPosition.x - elementsSize) < elementsSize) {
        console.log('OUT')
    } else {
        playerPosition.x -= elementsSize
        startGame()
    }
}

function moveRight() {
    console.log('Derecha')

    if ((playerPosition.x + elementsSize) > canvasSize) {
        console.log('OUT')
    } else {
        playerPosition.x += elementsSize
        startGame()
    }
}

function moveDown() {
    console.log('Abajo')

    if ((playerPosition.y + elementsSize) > canvasSize) {
        console.log('OUT')
    } else {
        playerPosition.y += elementsSize
        startGame()
    }
}


function moveByKeys(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveUp()
            break;
        case 'ArrowLeft':
            moveLeft()
            break
        case 'ArrowRight':
            moveRight()
            break
        case 'ArrowDown':
            moveDown()
            break
    }
}


function gameReload() {
    location.reload()     //esto es para reinciar el programa
}