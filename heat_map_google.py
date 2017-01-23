#!/usr/bin/env python

import pandas as pd
from flask import Flask, render_template, json
app = Flask(__name__)

df_coords_pedro = pd.read_csv('input/coords_pedro.csv')

with open('config.json') as f:
		config = json.load(f)
google_api_key = config['google_api_key']

@app.route("/")
def heatmap():
	coords_pedro = df_coords_pedro[['latitude', 'longitude']].values.tolist()
	return render_template('heat_map_google.html', coords_pedro=json.dumps(coords_pedro), api_key=google_api_key)

if __name__ == "__main__":
	app.run(debug=True)