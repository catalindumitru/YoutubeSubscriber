import os
import json

from utils import get_authenticated_service


def get_subscriptions():
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    youtube = get_authenticated_service("SOURCE")

    json_file = open("subscriptions.json", "w")
    subscriptions = []

    request = youtube.subscriptions().list(part="snippet", mine=True)
    response = request.execute()
    while request:
        for item in response["items"]:
            subscriptions.append(item)

        request = youtube.subscriptions().list_next(request, response)
        if request:
            response = request.execute()

    json.dump(subscriptions, json_file)


if __name__ == "__main__":
    get_subscriptions()
