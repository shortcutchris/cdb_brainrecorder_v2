# Sharing

_A library that provides implementing sharing files._

Available on platforms android, ios, web

`expo-sharing` allows you to share files directly with other compatible applications.

<ContentSpotlight file="sdk/sharing.mp4" loop={false} />

#### Sharing limitations on web

- `expo-sharing` for web is built on top of the Web Share API, which still has [very limited browser support](https://caniuse.com/#feat=web-share). Be sure to check that the API can be used before calling it by using `Sharing.isAvailableAsync()`.
- **HTTPS required on web**: The Web Share API is only available on web when the page is served over https. Run your app with `npx expo start --tunnel` to enable it.
- **No local file sharing on web**: Sharing local files by URI works on Android and iOS, but not on web. You cannot share local files on web by URI &mdash; you will need to upload them somewhere and share that URI.

#### Sharing to your app from other apps

Currently `expo-sharing` only supports sharing _from your app to other apps_ and you cannot register to your app to have content shared to it through the native share dialog on native platforms. You can read more [in the related feature request](https://expo.canny.io/feature-requests/p/share-extension-ios-share-intent-android). You can setup this functionality manually in Xcode and Android Studio and create an [Expo Config Plugin](https://docs.expo.dev/config-plugins/introduction/) to continue using [Expo Prebuild](https://docs.expo.dev/workflow/prebuild).

## Installation

```bash
$ npx expo install expo-sharing
```

If you are installing this in an existing React Native app, make sure to install `expo` in your project.

## API

```js
import * as Sharing from 'expo-sharing';
```

## API: expo-sharing

### Sharing Methods

#### isAvailableAsync (*Function*)
- `isAvailableAsync(): Promise<boolean>`
  Determine if the sharing API can be used in this app.
  Returns: A promise that fulfills with `true` if the sharing API can be used, and `false` otherwise.

#### shareAsync (*Function*)
- `shareAsync(url: string, options: SharingOptions): Promise<void>`
  Opens action sheet to share file to different applications which can handle this type of file.
  | Parameter | Type | Description |
  | --- | --- | --- |
  | `url` | string | Local file URL to share. |
  | `options` | SharingOptions | A map of share options. |

### Types

#### SharingOptions (*Type*)
| Property | Type | Description |
| --- | --- | --- |
| `anchor` *(optional)* | { height: number; width: number; x: number; y: number } | set the anchor point for iPad Available on platform: ios |
| `dialogTitle` *(optional)* | string | Sets share dialog title. Available on platforms: android, web |
| `mimeType` *(optional)* | string | Sets `mimeType` for `Intent`. Available on platform: android |
| `UTI` *(optional)* | string | [Uniform Type Identifier](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/understanding_utis/understand_utis_conc/understand_utis_conc.html)<br> - the type of the target file. Available on platform: ios |