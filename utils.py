import os
import pickle

import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors

scopes = ["https://www.googleapis.com/auth/youtube.readonly"]
client_secrets_file = "YOUR_CLIENT_SECRET_FILE.json"
api_service_name = "youtube"
api_version = "v3"


def get_authenticated_service(target):
    credentials_file = "CREDENTIALS_PICKLE_FILE_" + target
    if os.path.exists(credentials_file):
        with open(credentials_file, "rb") as f:
            credentials = pickle.load(f)
    else:
        flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
            client_secrets_file, scopes
        )
        credentials = flow.run_console()
        with open(credentials_file, "wb") as f:
            pickle.dump(credentials, f)
    return googleapiclient.discovery.build(
        api_service_name, api_version, credentials=credentials
    )
