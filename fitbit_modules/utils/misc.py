from datetime import datetime

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'tcx'])


def get_datetime_string():
    datetime_now_string = datetime.now().strftime("%Y%m%d_%H%M%S")
    return datetime_now_string


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
