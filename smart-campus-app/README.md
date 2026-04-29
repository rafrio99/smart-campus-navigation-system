# Smart Campus Navigation Mobile App

## Overview

This mobile app is the Expo based application segment of the Smart Campus Navigation and Service Recommendation System developed for UESTC. It provides mobile access to the campus navigation platform through a React Native and WebView based interface.

The app is intended to make the campus navigation system more accessible on smartphones for students and visitors.

## Main Features

1. Mobile access to the smart campus navigation system
2. Integration of the web based navigation interface through React Native WebView
3. Support for route generation and route preview
4. Access to landmark browsing and recommended services
5. Mobile friendly interface for on the move campus access

## Technologies Used

Expo  
React Native  
React Native WebView  
TypeScript

## Project Structure

```text
App/
app/
assets/
components/
constants/
hooks/
scripts/
app.json
package.json
tsconfig.json
README.md
```

## How to Run the App

1. Open the app project folder
2. Install dependencies

```bash
npm install
```

3. Start the Expo development server

```bash
npx expo start
```

4. Open the app using Expo Go on your mobile device or run it through an emulator

## Current Status

The mobile app currently provides access to the web based smart campus navigation system through WebView. It supports mobile viewing of route generation, route preview, landmark access, and service recommendation.

## Limitation

Reliable native GPS integration is not fully implemented yet in the current Expo mobile app version. The web based system is functional, while stronger native location handling is considered as a future development step for the mobile app.

## Future Work

1. Native GPS integration
2. Improved mobile interaction
3. Better performance optimization
4. Offline support for mobile usage
5. Stronger integration between mobile app and navigation logic

## Academic Context

This app segment is part of the Smart Campus Navigation and Service Recommendation System developed for the Mobile Computing course at UESTC.
