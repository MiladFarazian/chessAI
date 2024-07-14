from flask import Flask, request, jsonify
from flask_cors import CORS
from engine import ChessEngine
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to the Stockfish engine executable
engine_path = os.path.join("..", "stockfish", "stockfish")
chess_engine = ChessEngine(engine_path)

@app.route('/move', methods=['POST'])
def move():
    data = request.json
    print("Received data:", data)  # Debug incoming data
    board_fen = data.get('board_fen')
    level = data.get('level')
    move = chess_engine.get_ai_move(board_fen, level)
    print("Calculated move:", move)  # Debug calculated move

    response = jsonify({'move': move})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/shutdown', methods=['POST'])
def shutdown():
    chess_engine.close()
    response = jsonify({'message': 'Engine shut down'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
