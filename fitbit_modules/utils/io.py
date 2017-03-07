import json
import os


def make_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)


def load_json(path):
    with open(path) as f:
        return json.load(f)
