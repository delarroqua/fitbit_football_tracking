#!/usr/bin/env python

import os
import json
import tinys3
import boto3

from fitbit_modules.app import app
from flask import render_template, request
from flask import flash, redirect, url_for, session
from werkzeug.utils import secure_filename

from ..utils.io import load_json
from ..utils.tcx_parser import tcx_to_df
from ..utils.misc import get_datetime_string, allowed_file


# Todo: Improve buttons to regulate opacity and radius
# Todo: Create a session
# Todo: Deploy on Heroku

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


def build_heatmap(coords, center_map):
    return render_template('heatmap.html', coords=json.dumps(coords), center_map=center_map,
                           api_key=google_api_key)


def build_gps(coords, center_map):
    return render_template('gps.html', coords=json.dumps(coords), center_map=center_map,
                           api_key=google_api_key)


@app.route('/choice')
def make_choice():
    # filename = request.args['filename']
    filename = session['filename']
    return render_template('choice.html', filename=filename)


@app.route('/build', methods=['POST'])
def build_stuff():
    filename = request.form['filename']
    choice = request.form['choice']
    tcx_file_path = os.path.join('uploads/', filename)
    s3_client.download_file(BUCKET_NAME, os.path.join('tcx_files/', filename), tcx_file_path)
    df_coords = tcx_to_df(tcx_file_path)
    coords = df_coords[['latitude', 'longitude']].values.tolist()
    coords_center = df_coords.median(axis=0)
    center_map = {"lat": coords_center['latitude'], "lng": coords_center['longitude']}
    if choice == 'heatmap':
        return build_heatmap(coords, center_map)
    elif choice == 'gps':
        return build_gps(coords, center_map)
    else:
        return "Error motherfucker"


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
            session['filename'] = filename_with_date
            return redirect(url_for('make_choice'))
            # return render_template('choice.html', filename=filename_with_date)
    return render_template('index.html')


@app.route('/')
def index():
    return render_template('index.html')
