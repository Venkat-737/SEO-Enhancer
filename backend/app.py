from flask import Flask
from flask_cors import CORS
from routes.upload import upload_bp
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["TEMP_FOLDER"] = "temp"
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024  # 500MB

app.register_blueprint(upload_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)