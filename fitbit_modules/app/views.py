#!/usr/bin/env python

import os
import json
import tinys3
import boto3

from fitbit_modules.app import app
from flask import render_template, request
from flask import flash, redirect, url_for, session
from werkzeug.utils import secure_filename
from flask_login import LoginManager, login_user, current_user, logout_user, UserMixin, login_required

from ..utils.io import load_json
from ..utils.tcx_parser import tcx_to_df
from ..utils.misc import get_datetime_string, allowed_file
from ..utils.db_connection import PostgresConnection
from ..utils.database import check_if_email_exists, get_password_from_email, get_filename_from_email

# Todo: faire une page d'accueil un peu sympa est embellir le reste
# Todo: Create new account page
# Todo: Improve buttons to regulate opacity and radius


# Google Map Api
config_google = load_json('config/config_google.json')
google_api_key = config_google['google_api_key']

# AWS S3
config_aws = load_json('config/config_aws.json')
BUCKET_NAME = config_aws['bucket_name']
AWS_ACCESS_KEY_ID = config_aws['access_key_id']
AWS_SECRET_ACCESS_KEY = config_aws['secret_access_key']
s3_conn = tinys3.Connection(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, default_bucket='pedro62360')
s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

# UPLOAD_FOLDER = 'uploads/'

config_db = load_json("config/config_db.json")
connection = PostgresConnection(config_db)

# Flask-login
login_manager = LoginManager()
login_manager.init_app(app)


class User(UserMixin):
    pass


@app.route('/choice')
def make_choice():
    # filename = request.args['filename']
    if session['filename']:
        filename = session['filename']
    else:
        filename = get_filename_from_email(connection, email=current_user.id)

    if filename is None:
        return "You have to load a file first"
    return render_template('choice.html', filename=filename)


@app.route('/build', methods=['POST'])
def build_stuff():
    filename = request.form['filename']
    choice = request.form['choice']
    tcx_file_path = os.path.join('uploads/', filename)
    # Download file from S3
    s3_client.download_file(BUCKET_NAME, os.path.join('tcx_files/', filename), tcx_file_path)
    df_coords = tcx_to_df(tcx_file_path)
    coords = df_coords[['latitude', 'longitude', 'time']].values.tolist()
    coords_center = df_coords.median(axis=0)
    center_map = {"lat": coords_center['latitude'], "lng": coords_center['longitude']}
    if choice == 'heatmap':
        # return build_heatmap(coords, center_map)
        return render_template('heatmap.html', coords=json.dumps(coords), center_map=center_map,
                               api_key=google_api_key)
    elif choice == 'gps':
        # return build_gps(coords, center_map)
        return render_template('gps.html', coords=json.dumps(coords), center_map=center_map,
                               api_key=google_api_key)
    else:
        return "Error: Bad choice"


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # file.save(os.path.join(UPLOAD_FOLDER, filename))
            filename_with_date = get_datetime_string() + '_' + filename
            s3_conn.upload(os.path.join('tcx_files/', filename_with_date), file)  # Upload file to S3
            if current_user.id:
                connection.update_filename_of_user(filename=filename_with_date, email=current_user.id)
            else:
                session['filename'] = filename_with_date
            return redirect(url_for('make_choice'))
            # return render_template('choice.html', filename=filename_with_date)
    return render_template('select_file.html')


@app.route('/')
def index():
    # return render_template('select_file.html')
    return render_template('login.html')


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
    return 'Logged out'
