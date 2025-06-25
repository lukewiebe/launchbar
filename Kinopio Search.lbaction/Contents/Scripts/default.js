function run() {
  const apiKey = Action.preferences.apiKey || setApiKey();
  if (!apiKey) return;

  const result = HTTP.getJSON("https://api.kinopio.club/user/spaces", {
    headerFields: {
      Authorization: apiKey,
    },
  });

  if (!result.data) return;

  return result.data
    .filter((space) => !space.isRemoved && !space.isHidden)
    .map((space) => ({
      title: space.name,
      url: "https://kinopio.club/" + space.url,
    }));
}

// API key validation borrowed and modified from https://github.com/Ptujec/LaunchBar/tree/master/Writing-Tools
function setApiKey() {
  // API Key dialog
  const response = LaunchBar.alert(
    "API key required",
    'To get your Kinopio API key, go to kinopio.club and navigate to User -> Settings -> General -> Developer and click "Copy API Key", then come back here and click "Set API Key".',
    "Open kinopio.club",
    "Set API Key",
    "Cancel",
  );

  switch (response) {
    case 0:
      LaunchBar.openURL("https://kinopio.club");
      LaunchBar.hide();
      break;
    case 1:
      const clipboardContent = LaunchBar.getClipboardString()?.trim();
      const isValidAPIKey = checkAPIKey(clipboardContent);

      if (!isValidAPIKey) return;

      Action.preferences.apiKey = clipboardContent;

      LaunchBar.alert(
        "Success!",
        "API key set to: " + Action.preferences.apiKey,
      );
      break;
    case 2:
      break;
  }
}

function checkAPIKey(apiKey) {
  if (apiKey) {
    const result = HTTP.getJSON("https://api.kinopio.club/user", {
      headerFields: {
        Authorization: apiKey,
      },
    });

    if (result.response.status === 200) return true;
  }

  LaunchBar.alert(
    "Invalid API key",
    `Error ${result.response.status}: ${result.response.localizedStatus}`,
  );

  return false;
}
