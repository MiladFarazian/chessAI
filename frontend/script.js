var board;
var game;
var playerColor = 'white';
var capturedPieces = { white: [], black: [] };
var pieceValues = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9
};

document.addEventListener("DOMContentLoaded", function() {
    board = Chessboard('board', {
        draggable: true,
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
        position: 'start',
        onDrop: onDrop
    });
    game = new Chess();

    document.getElementById("startButton").addEventListener("click", startGame);
});

function startGame() {
    playerColor = document.getElementById("color").value;
    var boardConfig = {
        draggable: true,
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
        position: 'start',
        orientation: playerColor,
        onDrop: onDrop
    };

    board = Chessboard('board', boardConfig);
    game.reset();
    capturedPieces = { white: [], black: [] }; // Reset captured pieces
    updateCapturedPieces();
    console.log("Game started as " + playerColor);

    if (playerColor === 'black') {
        // Make the AI move first if the player is black
        window.setTimeout(makeBestMove, 250);
    }
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // always promote to a queen for simplicity
    });

    if (move === null) return 'snapback';

    if (move.captured) {
        if (move.color === 'w') {
            capturedPieces.black.push(move.captured);
        } else {
            capturedPieces.white.push(move.captured);
        }
        updateCapturedPieces();
    }

    console.log("Player move:", move);  // Debug player move
    updateBoard();
    window.setTimeout(makeBestMove, 250);
}

function makeBestMove() {
    var board_fen = game.fen();
    var level = document.getElementById("difficulty").value;
    console.log("Sending FEN to server:", board_fen);  // Debug FEN

    fetch('http://127.0.0.1:5000/move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board_fen: board_fen, level: level }),
    })
    .then(response => {
        console.log("Fetch response:", response);  // Log the fetch response
        return response.json();  // Parse the JSON from the response
    })
    .then(data => {
        console.log("Response from server:", data);  // Log the entire response
        if (data.error) {
            console.error('Error from server:', data.error);
            return;
        }
        console.log("AI move received:", data.move);  // Debug AI move
        var move = game.move(data.move);
        console.log("Move applied to game:", move);  // Debug move application
        updateBoard();

        if (move && move.captured) {
            if (move.color === 'w') {
                capturedPieces.black.push(move.captured);
            } else {
                capturedPieces.white.push(move.captured);
            }
            updateCapturedPieces();
        }
    })
    .catch((error) => {
        console.error('Fetch error:', error);
    });
}

function updateBoard() {
    board.position(game.fen());
    console.log("Board updated to position:", game.fen());  // Debug board position update
}

function updateCapturedPieces() {
    var whiteCaptured = document.getElementById('white-captured');
    var blackCaptured = document.getElementById('black-captured');
    var whiteScore = calculateScore(capturedPieces.white);
    var blackScore = calculateScore(capturedPieces.black);

    whiteCaptured.innerHTML = capturedPieces.white.map(piece => `<img src="img/chesspieces/wikipedia/b${piece.toUpperCase()}.png" alt="${piece}">`).join('');
    blackCaptured.innerHTML = capturedPieces.black.map(piece => `<img src="img/chesspieces/wikipedia/w${piece.toUpperCase()}.png" alt="${piece}">`).join('');

    document.getElementById('white-score').textContent = whiteScore;
    document.getElementById('black-score').textContent = blackScore;
}

function calculateScore(capturedPieces) {
    return capturedPieces.reduce((total, piece) => total + pieceValues[piece.toLowerCase()], 0);
}
