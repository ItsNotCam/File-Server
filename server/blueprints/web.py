from flask import Blueprint, abort, render_template, url_for, redirect, session, request, before_render_template, flash
from config import Config

from blueprints import api
from models import user

from datetime import datetime, timedelta
from pathlib import Path
import base64
import requests
import os

web_bp = Blueprint("web", __name__, template_folder="../templates")

@web_bp.route("/")
@web_bp.route("/login", methods=["GET","POST"])
def login():
    if request.method == "GET":
        if "message" in session:
            message = session["message"]
            del session["message"]
            return render_template("login.html", message=message)
        if "timeout" in session and session["timeout"] > datetime.now():
            return redirect(url_for("web.home"))

        return render_template("login.html")
    
    if request.form is None or "access_code" not in request.form:
        session["message"] = {"message": "Invalid form data.", "color": "#F96666"}
        return redirect(url_for("web.login"))
    
    access_code = request.form["access_code"]
    found = user.User.query.filter_by(access_code=access_code).first()
    if found is not None:
        session["username"] = found.username
        session["timeout"] = datetime.now() + timedelta(minutes=Config.SESSION_TIMEOUT)
        if "message" in session:
            del session["message"]

        session["path"] = api.b64e(Config.DL_ROOT_DIR)
        return redirect(url_for("web.home"))

    session["message"] = {"message": "Invalid credentials.", "color": "#F96666"}
    return redirect(url_for("web.login"))


@web_bp.route("/logout")
def logout():
    if "timeout" in session:
        del session["timeout"]
    if "path" in session:
        del session["path"]

    session["message"] = {"message": "You have been logged out.", "color": "#01A4FE"}
    return redirect(url_for("web.login"))


@web_bp.route("/home")
def home():
    _, status_code = api.validate_session()
    if status_code != 200:
        session["message"] = {"message": "invalid session", "color": "#F96666"}
        return redirect(url_for("web.login"))
    
    return render_template("index.html")

@web_bp.route("/chgdir/<string:path>")
def chgdir(path):
    data, status_code = api.validate_path(path)
    if status_code == 200:
        print("success changing dirs")
        session["path"] = path
        return api.get_files(path)
    
    return (data, status_code)

# @web_bp.route("/upload/<string:path>", methods=["POST"])
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

'''
@web_bp.route("/home")
def home():

    b64path = api.b64e(Config.DL_ROOT_DIR) if "path" not in session else session["path"]
    path = Config.DL_ROOT_DIR if "path" not in session else api.b64d(session["path"])

    ref = path.replace(os.path.split(Config.DL_ROOT_DIR)[0], "")
    past_folders = list()
    last_path = ""
    for last in ref.split(os.path.sep)[1:]:
        last_path = os.path.realpath(os.path.join(last_path, last))
        past_folders.append({
            "name": last,
            "path": last_path,
            "hash": api.b64e(last_path)
        })

    parent = api.b64e(str(Path(path).parent))
    display_path = path.replace(os.path.split(Config.DL_ROOT_DIR)[0],"")
    data, status_code = api.get_files(b64path)
    return render_template(
        "index.html", 
        path=display_path, 
        files=[] if status_code != 200 else data["files"], 
        parent_path=parent, 
        hash=b64path,
        username=session["username"],
        past_folders=past_folders
    )

@web_bp.route("/files/<string:path>")
def change_path(path):
    data, status_code = api.validate_session()
    if status_code != 200:
        session["message"] = {"message": data["message"], "color": "#F96666"}
        return redirect(url_for("web.login"))

    data, status_code = api.get_files(path)
    if status_code == 200:
        session["path"] = path
    
    print(api.b64d(session["path"]))

    return redirect(url_for("web.home"))

@web_bp.route("/files/del/<string:path>")
def delete_file(path):
    data, status_code = api.validate_session()
    if status_code != 200:
        session["message"] = {"message": data["message"], "color": "#F96666"}
        return redirect(url_for("web.login"))

    data, status_code = api.delete_file(path)
    return redirect(url_for("web.home"))

@web_bp.route("/folder/del/<string:path>")
def delete_folder(path):
    data, status_code = api.delete_folder(path)
    return redirect(url_for("web.home"))

@web_bp.route("/files/zip/<string:path>")
def zip_dir(path):
    data, status_code = api.zip_dir(path)
    print(data, status_code)
    return redirect(url_for("web.home"))
    # data, status_code = api.validate_session()
    # if status_code != 200:
    #     session["messaage"] = {"message": data["message"], "color": "#F96666"}
    #     return redirect(url_for("web.login"))

    # return api.zip_dir(path)



@web_bp.route("/mkdir/<string:path>", methods=["POST"])
def new_folder(path):
    if "filename" in request.form and len(request.form["filename"]) > 0:
        api.create_directory(path, request.form["filename"])

    return redirect(url_for("web.home"))
'''
'''
@web_bp.route("/files/unzip/<string:path>")
def unzip(path):
    data, status_code = api.unzip(path)
    print(data, status_code)
    return redirect(url_for("web.home"))
    '''