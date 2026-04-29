# Smart Campus Navigation Website

## Overview

This website is the main segment of the Smart Campus Navigation and Service Recommendation System developed for UESTC. It provides an interactive campus navigation platform that helps users find locations, preview routes, browse landmarks, access recommended services, and compare routing results using multiple algorithms.

The website is designed to support students and visitors, especially new and international students who may face difficulties in navigating the campus during their first days.

## Main Features

1. Interactive campus map using Leaflet and OpenStreetMap
2. Route generation between selected start and end locations
3. Support for BFS, DFS, and Dijkstra algorithms
4. Route preview with start and end point images
5. Landmark browsing and campus location access
6. Recommended services based on selected destination
7. Distance calculation between two selected campus locations
8. Mobile friendly web interface

## Technologies Used

HTML  
CSS  
JavaScript  
Leaflet  
OpenStreetMap

## Project Structure

```text
Website/
index.html
css/
js/
images/
campus_nodes_edges.json
uestc_locations.js
uestc_markers.js
uestc_routes.js
uestc_services.js
uestc_location_images.js
README.md
```

## Files Description

### `index.html`
Main user interface for the campus navigation website.

### `css/styles.css`
Contains the layout, design, responsive style, and route preview panel styling.

### `js/app.js`
Main application logic for map initialization, route generation, recommendation display, and distance calculation.

### `js/algorithms.js`
Contains the BFS, DFS, and Dijkstra algorithm implementations.

### `js/graph.js`
Handles the graph data structure and node edge relationships.

### `campus_nodes_edges.json`
Stores processed graph data used for pathfinding.

### `uestc_locations.js`
Contains the available campus locations used in the selection lists.

### `uestc_markers.js`
Contains marker coordinates, categories, and descriptions.

### `uestc_routes.js`
Contains route path data and demo paths for different algorithms.

### `uestc_services.js`
Contains destination based service recommendation data.

### `uestc_location_images.js`
Contains image paths for selected campus locations.

## How to Run the Website

1. Open the website project folder
2. Start a local server
3. Open the generated local or network URL in a browser

Example:

```bash
npx serve
```

## Usage

1. Select a start location
2. Select an end location
3. Choose an algorithm
4. Click **Find Route**
5. View the route preview, recommendation panel, and distance information

## Screenshots

You can add screenshots of the website inside the main project `Screenshots` folder.

Suggested screenshots:

1. Home screen
2. Landmarks screen
3. Route preview
4. Recommended services
5. Distance result
6. Algorithm comparison

## Future Improvements

1. Offline navigation support
2. Real time navigation support
3. Improved service recommendation system
4. Native GPS integration through the mobile application
5. More campus locations and enriched metadata

## Acknowledgment

This website segment was developed as part of the Mobile Computing course project at UESTC.
