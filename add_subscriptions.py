import os
import json

from utils import get_authenticated_service

def add_subscriptions():
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    youtube = get_authenticated_service("DESTINATION")

    json_file = open("subscriptions.json", "r")
    subscriptions = json.load(json_file)

    for item in subscriptions:
        request = youtube.subscriptions().insert(part="snippet", body=item)
        _ = request.execute()


if __name__ == "__main__":
    add_subscriptions()
