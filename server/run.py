import os

from flaskapp import app #, db
from config import Config
# from models import user

from blueprints.web import web_bp
from blueprints.api import api_bp

rootdir = Config.DL_ROOT_DIR

'''
databse
# cur_dir = os.path.abspath(os.path.dirname(__file__))
# if not os.path.exists(os.path.join(cur_dir, "db")):
#     os.mkdir(os.path.join(cur_dir,"db"))

# db.create_all()
'''

app.register_blueprint(web_bp)
app.register_blueprint(api_bp)

'''
database
if user.User.query.filter_by(**Config.ROOT_USER).first() is None:
	user = user.User(**Config.ROOT_USER)
	db.session.add(user)
	db.session.commit()
'''


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)
