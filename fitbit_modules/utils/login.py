from fitbit_modules.app import app
from flask import render_template, request
from flask import redirect, url_for
from flask_login import LoginManager, login_user, logout_user, UserMixin, login_required, current_user

from ..utils.io import load_json
from ..utils.db_connection import PostgresConnection
from ..utils.database import check_if_email_exists, get_password_from_email


# PSQL connection
config_db = load_json("config/config_db_local.json")
connection = PostgresConnection(config_db)

# Flask-login
login_manager = LoginManager()
login_manager.init_app(app)


class User(UserMixin):
    pass


# Callback is used to reload the user object from the user email stored in the session
@login_manager.user_loader
def user_loader(email):
    # if email not in users:
    if check_if_email_exists(connection, email) is False:
        return

    user = User()
    user.id = email
    return user


@login_manager.request_loader
def request_loader(request):
    email = request.form.get('email')
    # if email not in users:
    if check_if_email_exists(connection, email) is False:
        return
    user = User()
    user.id = email
    # password = request.form['pw']
    # user.is_authenticated = password == get_password_from_email(connection, email)
    return user


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    email = request.form['email']
    password = request.form['pw']

    if check_if_email_exists(connection, email):
        if password == get_password_from_email(connection, email):
            user = User()
            user.id = email
            login_user(user)
            return redirect(url_for('logged'))
        return 'Bad login'
    return "Email does not exist in database"


@app.route('/logged')
@login_required
def logged():
    # return render_template('select_file.html', current_user_id=current_user.id)
    return render_template('select_file.html')


@app.route('/logout')
def logout():
    logout_user()
    return render_template('index.html')
    # return 'Logged out'
