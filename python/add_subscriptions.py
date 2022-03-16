import os
import json

from utils import get_authenticated_service


def add_subscriptions(subscriptions_path="subscriptions.json"):
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    youtube = get_authenticated_service("DESTINATION")

    json_file = open(subscriptions_path, "r")
    subscriptions = json.load(json_file)

    # Get the destination user's id.
    request = youtube.channels().list(part="id", mine=True)
    response = request.execute()
    id = response["items"][0]["id"]

    insert_request_body = {
        "kind": "youtube#subscription",
        "snippet": {"channelId": "", "resourceId": {"channelId": ""}},
    }

    for item in subscriptions:
        # Set the id for the destination channel.
        insert_request_body["snippet"]["channelId"] = id

        # Set the id for the wanted subscription.
        wanted_id = item["snippet"]["resourceId"]["channelId"]
        insert_request_body["snippet"]["resourceId"]["channelId"] = wanted_id

        request = youtube.subscriptions().insert(
            part="snippet", body=insert_request_body
        )
        _ = request.execute()


if __name__ == "__main__":
    add_subscriptions()
