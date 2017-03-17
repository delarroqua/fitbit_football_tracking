def check_if_email_exists(connection, email):
    query = """ SELECT EXISTS(
            select * from {{table}}
            where email = '{{email}}'
            ) as boolean
            """
    config_query = {
        "table": "fitbit.users",
        "email": email
    }

    exist = connection.query(query, config_query)
    return exist['boolean'][0]


def get_password_from_email(connection, email):
    query = """
            select * from {{table}}
            where email = '{{email}}'
             """
    config_query = {
        "table": "fitbit.users",
        "email": email
    }

    df_user = connection.query(query, config_query)
    return df_user['password'][0]


def get_filename_from_email(connection, email):
    query = """
            select * from {{table}}
            where email = '{{email}}'
             """
    config_query = {
        "table": "fitbit.users",
        "email": email
    }

    df_user = connection.query(query, config_query)
    return df_user['filename'][0]
