from flask import Blueprint, abort, request, session, send_file, after_this_request
from config import Config

from pathlib import Path
import subprocess
import shutil

from datetime import datetime
import hashlib
import binascii
import base64
import os

from os import error as oserr

#TODO: IMPLEMENT ALL FUNCTIONS
#TODO: IMPLEMENT AUTH

api_bp = Blueprint('api', __name__)

@api_bp.errorhandler(404)
def handle_fourohfour():
    return {"message": "No Such Resource"}, 404

def b64e(original):
    encoded = base64.urlsafe_b64encode(original.encode("utf-8"))
    return str(encoded, "utf-8")

def b64d(encoded):
    decoded = base64.urlsafe_b64decode(encoded.encode("utf-8"))
    return str(decoded, "utf-8")

def validate_path(path):
    try:
        directory = b64d(path)
        real_directory = os.path.realpath(directory)
    except binascii.Error:
        return {"message": "Invalid Path"}, 400

    if not os.path.exists(real_directory):
        return {"message": "Invalid Path"}, 400

    if Config.DL_ROOT_DIR not in real_directory:
        return {"message": "Path Outside of Scope"}, 400
    
    return {"message": "success", "real_directory": real_directory}, 200

@api_bp.route("/api/files", methods=["GET"])
def get_root_files():
    return get_files(b64e(Config.DL_ROOT_DIR))

@api_bp.route("/api/files/<string:path>", methods=["GET"])
def get_files(path):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)

    real_directory = data["real_directory"]
    abs_parent = str(Path(real_directory).parent)

    files = list()
    for filename in os.listdir(real_directory):
        fullpath = os.path.join(real_directory, filename)

        name, extension = os.path.splitext(filename)
        parent = str(Path(fullpath).parent)
        is_dir = os.path.isdir(fullpath)

        files.append({
            "name": name,
            "extension": extension,
            "filename": filename,
            "parent": b64e(parent),
            "is_dir": is_dir,
            "hash": b64e(fullpath),
        })

    files = sorted(files, key=lambda file: not file["is_dir"])
    return {"message": "success", "files": files, "parent": b64e(abs_parent), "cwd": b64e(real_directory)}, 200

@api_bp.route("/api/file/<string:path>/rename", methods=["PUT"])
def rename(path):
    if "name" not in request.args:
        return {"message": "New Name not Found in Request"}, 400

    newName = request.args["name"]
    if "/" in newName or "\\" in newName or "|" in newName:
        return {"message": "Invalid Name"}, 400 

    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)

    real_dir = data["real_directory"]
    if os.path.isdir(real_dir):
        new_dir = os.path.join(
            os.path.split(real_dir)[0],
            newName
        )
    
    else:
        ext = os.path.splitext(real_dir)[1]
        new_dir = os.path.join(
            os.path.split(real_dir)[0],
            f"{newName}{ext}"
        )

    os.rename(real_dir, new_dir)
    new_hash = b64e(new_dir)
    return {"message": "success", "new_name": newName, "new_hash": new_hash}, 200


@api_bp.route("/api/file/<string:path>", methods=["DELETE"])
def delete(path):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)
    
    try:
        real_directory = data["real_directory"]
        if os.path.isdir(real_directory):
            shutil.rmtree(real_directory)
        else:
            os.remove(real_directory)
    except oserr as e:
        print(e)
        return {"message": "Not Deleted"}, 400

    return {"message": "success"}, 200

@api_bp.route("/api/file/<string:path>/download", methods=["GET"])
def download(path):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)
    
    real_directory = data["real_directory"]
    return send_file(
        real_directory, 
        as_attachment=True, 
        attachment_filename=os.path.split(real_directory)[1]
    )

@api_bp.route("/api/file/<string:path>/zip", methods=["POST"])
def zip(path):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)

    real_directory = data["real_directory"]
    name = os.path.split(real_directory)[1]
    filename = f"{name}.zip"
    parent_dir = str(Path(real_directory).parent)
    filepath = os.path.join(parent_dir, filename)

    if os.path.exists(filepath):
        return {"message": "File Already Exists"}, 400

    subprocess.call(["zip","-r", filename, name], cwd=parent_dir)
    file = {
        "name": os.path.split(real_directory)[1],
        "extension": ".zip",
        "filename": filename,
        "parent": b64e(parent_dir),
        "is_dir": False,
        "hash": b64e(filepath),
    }

    return {"message": "success", "file": file}, 200

@api_bp.route("/api/file/<string:path>/unzip", methods=["POST"])
def unzip(path):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)
    
    real_directory = data['real_directory']
    filename = os.path.splitext(os.path.split(real_directory)[1])[0]
    parent_dir = str(Path(real_directory).parent)
    filepath = os.path.join(parent_dir, filename)

    if os.path.exists(filepath):
        return {"message": "File Already Exists"}, 400

    try:
        subprocess.call(["unzip", "-o", filename], cwd=parent_dir)
        file = {
            "name": filename,
            "extension": "",
            "filename": filename,
            "parent": b64e(parent_dir),
            "is_dir": True,
            "hash": b64e(filepath),
        }
        return {"message": "success", "file": file}, 200

    except Exception as e:
        print(e)

    return {"message": "Internal Server Error: " + e}, 500
    

@api_bp.route("/api/file/<string:path>/upload", methods=["POST"])
def upload_file(path, file=None):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)
    if "file" not in request.files:
        return {"message": "file not found in request form"}, 400

    file = request.files["file"] if file is None else file
    filepath = os.path.join(data["real_directory"], file.filename)
    if not os.path.exists(filepath):
        file.save(filepath) 
        file = {
            "name": os.path.splitext(str(file.filename))[0],
            "extension": os.path.splitext(str(file.filename))[1],
            "filename": str(file.filename),
            "parent": b64e(str(Path(data["real_directory"]).parent)),
            "is_dir": False,
            "hash": b64e(filepath)
        }

        return {"message": "success", "file": file}, 200
    else:
        return {"message": "File Already Exists"}, 400


@api_bp.route("/api/mkdir/<string:path>")
def create_directory(path, dirname=None):
    data, status_code = validate_path(path)
    if status_code != 200:
        return (data, status_code)
    
    dirname = dirname if dirname is not None else request.args["dirname"] 
    filepath = os.path.join(data["real_directory"], dirname) 
    if not os.path.exists(filepath):
        os.mkdir(filepath)
        return {"message": "success"}, 200
    
    return {"message": "folder already exists"}, 400
    
