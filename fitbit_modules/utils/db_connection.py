import json
from datetime import datetime

from db import DB


class PostgresConnection:
    def __init__(self, config_db):
        self.db = DB(
            username=config_db.get("user", "postgres"),
            password=config_db.get("password", ""),
            hostname=config_db.get("host", "127.0.0.1"),
            port=config_db.get("port", "5432"),
            dbname=config_db.get("db", "postgres"),
            dbtype="postgres"
        )

    def query(self, query, data):
        return self.db.query(query, data)

    def upload_model_information(self, model_information):
        self.db.cur.execute(
            "insert into model.tracking values (%s, %s)",
            (datetime.now(), json.dumps(model_information))
        )
        self.db.con.commit()

    def update_filename_of_user(self, filename, email):
        self.db.cur.execute(
            "update fitbit.users set filename = (%s) where email = (%s)",
            (filename, email)
        )
        self.db.con.commit()
