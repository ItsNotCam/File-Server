from flaskapp import db

class User(db.Model):
    access_code = db.Column(db.String, primary_key=True, nullable=True)
    username = db.Column(db.String, unique=True, nullable=True)

    def __repr__(self):
        return self.username + " - " + self.access_code