import chess.engine

class ChessEngine:
    def __init__(self, engine_path):
        self.engine = chess.engine.SimpleEngine.popen_uci(engine_path)
        print(f"Stockfish engine loaded from {engine_path}")  # Debug statement

    def get_ai_move(self, board_fen, level):
        print(f"Calculating move for FEN: {board_fen} at level: {level}")  # Debug statement
        board = chess.Board(board_fen)
        with self.engine.analysis(board, chess.engine.Limit(time=float(level))) as analysis:
            for info in analysis:
                print("Analysis info:", info)  # Debug statement
                if "pv" in info:
                    move = info["pv"][0]
                    return move.uci()
        return None

    def close(self):
        self.engine.quit()
