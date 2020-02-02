import os

class Config:
    SECRET_KEY = "skrt skrt"

    SQLALCHEMY_DATABASE_URI = "sqlite:///db/fileserver.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DL_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "files"))
    SESSION_TIMEOUT = 99

    ROOT_USER = {
    	"username": "axiiom",
    	"access_code": "password"
    }
