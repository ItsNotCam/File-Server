from flask import Blueprint, abort, render_template, url_for, redirect, session, request, before_render_template, flash
from config import Config

from blueprints import api

from datetime import datetime, timedelta
from pathlib import Path
import base64
import requests
import os

web_bp = Blueprint("web", __name__, template_folder="../templates")


@web_bp.route("/")
@web_bp.route("/home")
def home():
    return render_template("index.html")

@web_bp.route("/chgdir/<string:path>")
def chgdir(path):
    data, status_code = api.validate_path(path)
    if status_code == 200:
        print("success changing dirs")
        session["path"] = path
        return api.get_files(path)
    
    return (data, status_code)

@web_bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" in request.files and len(request.files["file"].filename) > 0:
        print(api.b64d(session["path"]))
        data, status_code = api.upload_file(
            api.b64e(session["path"]), 
            request.files["file"]
        )
        return (data, status_code)
        
    return redirect(url_for("web.home"))