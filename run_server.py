#!/usr/bin/env python

from fitbit_modules.app import app
import os


if __name__ == "__main__":
    app.secret_key = "super secret key"
    UPLOAD_FOLDER = 'uploads/'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.run(debug=True)
    # port = int(os.environ.get("PORT", 80))
    # app.run(host='0.0.0.0', port=port)
