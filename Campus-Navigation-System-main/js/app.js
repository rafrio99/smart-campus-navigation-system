document.addEventListener("DOMContentLoaded", function () {
  var map = L.map("map", {
    zoomControl: false,
    preferCanvas: true,
    fadeAnimation: false,
    zoomAnimation: false,
    markerZoomAnimation: false
  }).setView([30.7457, 103.9249], 17);

  L.control.zoom({
    position: "topright"
  }).addTo(map);

  let baseLayer;
  let fallbackUsed = false;
  let currentPathLayer;
  let currentCustomRouteLayer;
  let currentStartMarker;
  let currentEndMarker;
  let currentUserLocationMarker = null;
  let currentAccuracyCircle = null;
  let markerLookup = {};

  const homeScreen = document.getElementById("homeScreen");
  const landmarksScreen = document.getElementById("landmarksScreen");
  const controls = document.getElementById("controls");
  const routeInfoPanel = document.getElementById("routeInfoPanel");
  const recommendationPanel = document.getElementById("recommendationPanel");
  const landmarkList = document.getElementById("landmarkList");

  const gpsStatusText = document.getElementById("gpsStatusText");
  const selectedRouteDistance = document.getElementById("selectedRouteDistance");
  const bfsDistance = document.getElementById("bfsDistance");
  const dfsDistance = document.getElementById("dfsDistance");
  const dijkstraDistance = document.getElementById("dijkstraDistance");

  function refreshMap() {
    setTimeout(() => {
      map.invalidateSize(true);
    }, 300);

    setTimeout(() => {
      map.invalidateSize(true);
    }, 900);

    setTimeout(() => {
      map.invalidateSize(true);
    }, 1600);
  }

  function loadTiles() {
    if (baseLayer) {
      map.removeLayer(baseLayer);
    }

    baseLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
      }
    );

    baseLayer.on("tileerror", function () {
      if (fallbackUsed) return;
      fallbackUsed = true;

      if (baseLayer) {
        map.removeLayer(baseLayer);
      }

      baseLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          subdomains: ["a", "b", "c"],
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors"
        }
      ).addTo(map);

      refreshMap();
    });

    baseLayer.addTo(map);
  }

  function createEndpointIcon(color, labelText) {
    return L.divIcon({
      className: "custom-endpoint-icon",
      html: `
        <div style="
          display:flex;
          flex-direction:column;
          align-items:center;
          transform: translateY(-4px);
        ">
          <div style="
            background:${color};
            color:white;
            font-size:8px;
            font-weight:700;
            padding:2px 5px;
            border-radius:8px;
            margin-bottom:3px;
            box-shadow:0 2px 6px rgba(0,0,0,0.22);
            white-space:nowrap;
            line-height:1;
          ">
            ${labelText}
          </div>
          <div style="
            width:14px;
            height:14px;
            border-radius:50%;
            background:${color};
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 24],
      popupAnchor: [0, -20]
    });
  }

  function createUserLocationIcon() {
    return L.divIcon({
      className: "custom-user-location-icon",
      html: `
        <div style="
          display:flex;
          flex-direction:column;
          align-items:center;
        ">
          <div style="
            background:#dc3545;
            color:white;
            font-size:8px;
            font-weight:700;
            padding:2px 6px;
            border-radius:8px;
            margin-bottom:3px;
            white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.22);
          ">
            YOU
          </div>
          <div style="
            width:14px;
            height:14px;
            border-radius:50%;
            background:#dc3545;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.28);
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 24],
      popupAnchor: [0, -20]
    });
  }

  function clearEndpointMarkers() {
    if (currentStartMarker) {
      map.removeLayer(currentStartMarker);
      currentStartMarker = null;
    }

    if (currentEndMarker) {
      map.removeLayer(currentEndMarker);
      currentEndMarker = null;
    }
  }

  function addEndpointMarkers(startMarker, endMarker) {
    clearEndpointMarkers();

    if (startMarker) {
      currentStartMarker = L.marker([startMarker.lat, startMarker.lng], {
        icon: createEndpointIcon("#16a34a", "START")
      })
        .bindPopup(`<b>Start Point</b><br>${startMarker.name}`)
        .addTo(map);
    }

    if (endMarker) {
      currentEndMarker = L.marker([endMarker.lat, endMarker.lng], {
        icon: createEndpointIcon("#2563eb", "END")
      })
        .bindPopup(`<b>End Point</b><br>${endMarker.name}`)
        .addTo(map);
    }
  }

  function showHomeScreen() {
    homeScreen.style.display = "flex";
    landmarksScreen.style.display = "none";
    controls.style.display = "none";
    routeInfoPanel.style.display = "none";
    recommendationPanel.style.display = "none";
  }

  function showNavigationScreen() {
    homeScreen.style.display = "none";
    landmarksScreen.style.display = "none";
    controls.style.display = "block";
    refreshMap();
  }

  function showLandmarksScreen() {
    homeScreen.style.display = "none";
    landmarksScreen.style.display = "flex";
    controls.style.display = "none";
    routeInfoPanel.style.display = "none";
    recommendationPanel.style.display = "none";
  }

  function populateLandmarkList() {
    if (!landmarkList) return;

    landmarkList.innerHTML = "";

    if (typeof uestcLocations !== "undefined" && Array.isArray(uestcLocations)) {
      uestcLocations.forEach((locationName) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = locationName;

        btn.addEventListener("click", function () {
          showNavigationScreen();

          const selectedMarkerData =
            typeof uestcMarkers !== "undefined" && Array.isArray(uestcMarkers)
              ? uestcMarkers.find((marker) => marker.name === locationName)
              : null;

          if (selectedMarkerData) {
            map.setView([selectedMarkerData.lat, selectedMarkerData.lng], 18);
          }

          if (markerLookup[locationName]) {
            markerLookup[locationName].openPopup();
          }

          refreshMap();
        });

        li.appendChild(btn);
        landmarkList.appendChild(li);
      });
    }
  }

  function formatDistance(meters) {
    if (meters == null || Number.isNaN(meters)) {
      return "Not available";
    }

    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    }

    return `${(meters / 1000).toFixed(2)} km`;
  }

  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculatePathDistance(latlngs) {
    if (!Array.isArray(latlngs) || latlngs.length < 2) {
      return null;
    }

    let totalDistance = 0;

    for (let i = 0; i < latlngs.length - 1; i++) {
      const currentPoint = latlngs[i];
      const nextPoint = latlngs[i + 1];

      totalDistance += haversineDistance(
        Number(currentPoint[0]),
        Number(currentPoint[1]),
        Number(nextPoint[0]),
        Number(nextPoint[1])
      );
    }

    return totalDistance;
  }

  function updateDistanceDisplay(selectedMeters, bfsMeters, dfsMeters, dijkstraMeters) {
    if (selectedRouteDistance) {
      selectedRouteDistance.textContent = `Selected route distance: ${formatDistance(selectedMeters)}`;
    }

    if (bfsDistance) {
      bfsDistance.textContent = `BFS distance: ${formatDistance(bfsMeters)}`;
    }

    if (dfsDistance) {
      dfsDistance.textContent = `DFS distance: ${formatDistance(dfsMeters)}`;
    }

    if (dijkstraDistance) {
      dijkstraDistance.textContent = `Dijkstra distance: ${formatDistance(dijkstraMeters)}`;
    }
  }

  function getRouteDistanceFromNodeIds(nodeIds) {
    if (!nodeIds || !nodeIds.length) {
      return null;
    }

    const latlngs = nodeIds.map((nodeId) => {
      const node = graph.nodes.get(nodeId);
      return [node.lat, node.lng];
    });

    return calculatePathDistance(latlngs);
  }

  function getRouteDistanceFromCustomPath(path) {
    const normalizedPath = normalizeLatLngPath(path);
    return calculatePathDistance(normalizedPath);
  }

  function getMatchedRoute(startName, endName) {
    if (typeof uestcRoutes === "undefined" || !Array.isArray(uestcRoutes)) {
      return null;
    }

    return uestcRoutes.find(
      (route) =>
        (route.start === startName && route.end === endName) ||
        (route.start === endName && route.end === startName)
    );
  }

  function getAlgorithmDistances(startName, endName, startMarker, endMarker) {
    const distances = {
      bfs: null,
      dfs: null,
      dijkstra: null
    };

    const matchedRoute = getMatchedRoute(startName, endName);

    if (matchedRoute && matchedRoute.demoPaths) {
      ["bfs", "dfs", "dijkstra"].forEach((algoName) => {
        if (matchedRoute.demoPaths[algoName]) {
          let path = normalizeLatLngPath(matchedRoute.demoPaths[algoName]);

          if (matchedRoute.start === endName && matchedRoute.end === startName) {
            path = [...path].reverse();
          }

          distances[algoName] = calculatePathDistance(path);
        }
      });

      return distances;
    }

    const startNodeId = findNearestNodeId(startMarker.lat, startMarker.lng);
    const endNodeId = findNearestNodeId(endMarker.lat, endMarker.lng);

    if (startNodeId == null || endNodeId == null) {
      return distances;
    }

    const bfsPath = bfs(graph, startNodeId, endNodeId);
    const dfsPath = dfs(graph, startNodeId, endNodeId);
    const dijkstraPath = dijkstra(graph, startNodeId, endNodeId, "distance", false);

    distances.bfs = getRouteDistanceFromNodeIds(bfsPath);
    distances.dfs = getRouteDistanceFromNodeIds(dfsPath);
    distances.dijkstra = getRouteDistanceFromNodeIds(dijkstraPath);

    return distances;
  }

  function showCurrentLocation() {
    if (!navigator.geolocation) {
      if (gpsStatusText) {
        gpsStatusText.textContent = "Geolocation is not supported on this device or browser.";
      }
      alert("Geolocation is not supported by your browser.");
      return;
    }

    if (gpsStatusText) {
      gpsStatusText.textContent = "Fetching current location...";
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (currentUserLocationMarker) {
          map.removeLayer(currentUserLocationMarker);
        }

        if (currentAccuracyCircle) {
          map.removeLayer(currentAccuracyCircle);
        }

        currentUserLocationMarker = L.marker([lat, lng], {
          icon: createUserLocationIcon()
        })
          .bindPopup(
            `<b>Your Current Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`
          )
          .addTo(map);

        currentAccuracyCircle = L.circle([lat, lng], {
          radius: accuracy || 20,
          color: "#dc3545",
          fillColor: "#dc3545",
          fillOpacity: 0.12,
          weight: 1
        }).addTo(map);

        map.setView([lat, lng], 17);
        currentUserLocationMarker.openPopup();

        if (gpsStatusText) {
          gpsStatusText.textContent = `Current location loaded successfully: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        refreshMap();
      },
      function (error) {
        let message = "Unable to get current location.";

        if (error.code === 1) {
          message = "Location permission denied by the user.";
        } else if (error.code === 2) {
          message = "Location information is unavailable.";
        } else if (error.code === 3) {
          message = "Location request timed out.";
        }

        if (gpsStatusText) {
          gpsStatusText.textContent = message;
        }

        alert(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  loadTiles();

  map.whenReady(() => {
    refreshMap();
  });

  window.addEventListener("load", () => {
    refreshMap();
  });

  window.addEventListener("resize", () => {
    refreshMap();
  });

  window.addEventListener("pageshow", () => {
    refreshMap();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshMap();
    }
  });

  const goToFindRoute = document.getElementById("goToFindRoute");
  const goToLandmarks = document.getElementById("goToLandmarks");
  const backToHomeFromNavigation = document.getElementById("backToHomeFromNavigation");
  const backToHomeFromLandmarks = document.getElementById("backToHomeFromLandmarks");
  const showCurrentLocationBtn = document.getElementById("showCurrentLocation");

  if (goToFindRoute) {
    goToFindRoute.addEventListener("click", function () {
      showNavigationScreen();
    });
  }

  if (goToLandmarks) {
    goToLandmarks.addEventListener("click", function () {
      showLandmarksScreen();
    });
  }

  if (backToHomeFromNavigation) {
    backToHomeFromNavigation.addEventListener("click", function () {
      showHomeScreen();
    });
  }

  if (backToHomeFromLandmarks) {
    backToHomeFromLandmarks.addEventListener("click", function () {
      showHomeScreen();
    });
  }

  if (showCurrentLocationBtn) {
    showCurrentLocationBtn.addEventListener("click", function () {
      showCurrentLocation();
    });
  }

  fetch("campus_nodes_edges.json")
    .then((response) => response.json())
    .then((data) => {
      data.nodes.forEach((node) => {
        graph.addNode(node);
      });

      data.edges.forEach((edge) => {
        graph.addEdge(edge);
      });

      const startSelect = document.getElementById("start");
      const endSelect = document.getElementById("end");

      startSelect.innerHTML = '<option value="">Select a start location</option>';
      endSelect.innerHTML = '<option value="">Select an end location</option>';

      if (typeof uestcLocations !== "undefined" && Array.isArray(uestcLocations)) {
        uestcLocations.forEach((locationName) => {
          const startOption = document.createElement("option");
          startOption.value = locationName;
          startOption.textContent = locationName;

          const endOption = document.createElement("option");
          endOption.value = locationName;
          endOption.textContent = locationName;

          startSelect.appendChild(startOption);
          endSelect.appendChild(endOption);
        });

        populateLandmarkList();
      } else {
        console.error("UESTC locations data not loaded.");
      }

      if (typeof uestcMarkers !== "undefined" && Array.isArray(uestcMarkers)) {
        uestcMarkers.forEach((location) => {
          let popupImageHtml = "";

          if (
            typeof getLocationImage === "function" &&
            getLocationImage(location.name)
          ) {
            popupImageHtml = `
              <br>
              <img
                src="${getLocationImage(location.name)}"
                alt="${location.name}"
                style="width: 180px; height: 110px; object-fit: cover; border-radius: 8px; margin-top: 8px;"
              >
            `;
          }

          const leafletMarker = L.marker([location.lat, location.lng])
            .bindPopup(`
              <b>${location.name}</b><br>
              Category: ${location.category}<br>
              Description: ${location.description}
              ${popupImageHtml}
            `)
            .addTo(map);

          markerLookup[location.name] = leafletMarker;
        });
      } else {
        console.error("UESTC marker data not loaded.");
      }

      const closeRecommendationBtn = document.getElementById("closeRecommendation");

      if (closeRecommendationBtn && recommendationPanel) {
        closeRecommendationBtn.addEventListener("click", () => {
          recommendationPanel.style.display = "none";
        });
      }

      const closeRoutePreviewBtn = document.getElementById("closeRoutePreview");

      if (closeRoutePreviewBtn && routeInfoPanel) {
        closeRoutePreviewBtn.addEventListener("click", () => {
          routeInfoPanel.style.display = "none";
        });
      }

      setupClickableImages();

      document.getElementById("findRoute").addEventListener("click", () => {
        const startName = document.getElementById("start").value;
        const endName = document.getElementById("end").value;
        const algorithm = document.getElementById("algorithm").value;

        if (!startName || !endName || !algorithm) {
          alert("Please select start location, end location, and algorithm.");
          return;
        }

        if (startName === endName) {
          alert("Start and end locations cannot be the same. Please select different locations.");
          return;
        }

        if (typeof uestcMarkers === "undefined" || !Array.isArray(uestcMarkers)) {
          alert("Marker data is not loaded.");
          return;
        }

        const startMarker = uestcMarkers.find((marker) => marker.name === startName);
        const endMarker = uestcMarkers.find((marker) => marker.name === endName);

        if (!startMarker || !endMarker) {
          alert("Start or end location marker not found.");
          return;
        }

        const allAlgorithmDistances = getAlgorithmDistances(
          startName,
          endName,
          startMarker,
          endMarker
        );

        if (typeof uestcRoutes !== "undefined" && Array.isArray(uestcRoutes)) {
          const matchedRoute = getMatchedRoute(startName, endName);

          if (matchedRoute) {
            let selectedPath = null;

            if (matchedRoute.demoPaths && matchedRoute.demoPaths[algorithm]) {
              selectedPath = matchedRoute.demoPaths[algorithm];
            } else if (matchedRoute.path) {
              selectedPath = matchedRoute.path;
            }

            if (selectedPath && selectedPath.length > 0) {
              let normalizedPath = normalizeLatLngPath(selectedPath);

              if (matchedRoute.start === endName && matchedRoute.end === startName) {
                normalizedPath = [...normalizedPath].reverse();
              }

              if (normalizedPath.length < 2) {
                console.error("Custom route path format is invalid:", selectedPath);
                alert("Route data format is invalid. Please check the route file.");
                return;
              }

              const selectedDistanceMeters = calculatePathDistance(normalizedPath);

              drawCustomRoute(normalizedPath, startMarker, endMarker);
              updateRoutePreview(startName, endName);
              showServiceRecommendations(endName);
              updateDistanceDisplay(
                selectedDistanceMeters,
                allAlgorithmDistances.bfs,
                allAlgorithmDistances.dfs,
                allAlgorithmDistances.dijkstra
              );
              return;
            }
          }
        }

        const startNodeId = findNearestNodeId(startMarker.lat, startMarker.lng);
        const endNodeId = findNearestNodeId(endMarker.lat, endMarker.lng);

        if (startNodeId == null || endNodeId == null) {
          alert("Could not map the selected locations to graph nodes.");
          return;
        }

        let pathNodeIds = [];

        if (algorithm === "bfs") {
          pathNodeIds = bfs(graph, startNodeId, endNodeId);
        } else if (algorithm === "dfs") {
          pathNodeIds = dfs(graph, startNodeId, endNodeId);
        } else if (algorithm === "dijkstra") {
          pathNodeIds = dijkstra(graph, startNodeId, endNodeId, "distance", false);
        } else {
          alert("Invalid algorithm selected.");
          return;
        }

        if (!pathNodeIds || pathNodeIds.length === 0) {
          alert("No route found by the selected algorithm.");
          return;
        }

        const selectedDistanceMeters = getRouteDistanceFromNodeIds(pathNodeIds);

        drawPath(pathNodeIds, startMarker, endMarker);
        updateRoutePreview(startName, endName);
        showServiceRecommendations(endName);
        updateDistanceDisplay(
          selectedDistanceMeters,
          allAlgorithmDistances.bfs,
          allAlgorithmDistances.dfs,
          allAlgorithmDistances.dijkstra
        );
      });
    })
    .catch((error) => {
      console.error("Error loading campus data:", error);
    });

  function updateRoutePreview(startName, endName) {
    const startLocationImage = document.getElementById("startLocationImage");
    const endLocationImage = document.getElementById("endLocationImage");
    const startLocationName = document.getElementById("startLocationName");
    const endLocationName = document.getElementById("endLocationName");

    if (
      !routeInfoPanel ||
      !startLocationImage ||
      !endLocationImage ||
      !startLocationName ||
      !endLocationName
    ) {
      return;
    }

    routeInfoPanel.style.display = "block";

    startLocationName.textContent = startName;
    endLocationName.textContent = endName;

    const startImagePath =
      typeof getLocationImage === "function" ? getLocationImage(startName) : "";
    const endImagePath =
      typeof getLocationImage === "function" ? getLocationImage(endName) : "";

    if (startImagePath) {
      startLocationImage.src = startImagePath;
      startLocationImage.style.display = "block";
    } else {
      startLocationImage.src = "";
      startLocationImage.style.display = "none";
    }

    if (endImagePath) {
      endLocationImage.src = endImagePath;
      endLocationImage.style.display = "block";
    } else {
      endLocationImage.src = "";
      endLocationImage.style.display = "none";
    }
  }

  function normalizeLatLngPath(path) {
    if (!Array.isArray(path)) {
      return [];
    }

    return path
      .map((point) => {
        if (Array.isArray(point) && point.length >= 2) {
          return [Number(point[0]), Number(point[1])];
        }

        if (point && typeof point === "object") {
          if ("lat" in point && "lng" in point) {
            return [Number(point.lat), Number(point.lng)];
          }

          if ("latitude" in point && "longitude" in point) {
            return [Number(point.latitude), Number(point.longitude)];
          }
        }

        return null;
      })
      .filter(
        (point) =>
          Array.isArray(point) &&
          point.length === 2 &&
          !Number.isNaN(point[0]) &&
          !Number.isNaN(point[1])
      );
  }

  function drawPath(nodeIds, startMarker, endMarker) {
    if (currentPathLayer) {
      map.removeLayer(currentPathLayer);
    }

    if (currentCustomRouteLayer) {
      map.removeLayer(currentCustomRouteLayer);
      currentCustomRouteLayer = null;
    }

    const latlngs = nodeIds.map((nodeId) => {
      const node = graph.nodes.get(nodeId);
      return [node.lat, node.lng];
    });

    currentPathLayer = L.polyline(latlngs, {
      color: "#38bdf8",
      weight: 5
    }).addTo(map);

    addEndpointMarkers(startMarker, endMarker);
    map.fitBounds(currentPathLayer.getBounds());
    refreshMap();
  }

  function drawCustomRoute(latlngs, startMarker, endMarker) {
    if (currentCustomRouteLayer) {
      map.removeLayer(currentCustomRouteLayer);
    }

    if (currentPathLayer) {
      map.removeLayer(currentPathLayer);
      currentPathLayer = null;
    }

    currentCustomRouteLayer = L.polyline(latlngs, {
      color: "#38bdf8",
      weight: 5
    }).addTo(map);

    addEndpointMarkers(startMarker, endMarker);
    map.fitBounds(currentCustomRouteLayer.getBounds());
    refreshMap();
  }

  function showServiceRecommendations(destinationName) {
    const locationText = document.getElementById("recommendationLocation");
    const list = document.getElementById("recommendationList");
    const recommendationImage = document.getElementById("recommendationImage");

    if (!recommendationPanel || !locationText || !list || !recommendationImage) {
      console.error("Recommendation panel elements not found.");
      return;
    }

    locationText.textContent = `Destination: ${destinationName}`;
    list.innerHTML = "";

    const destinationImagePath =
      typeof getLocationImage === "function" ? getLocationImage(destinationName) : "";

    if (destinationImagePath) {
      recommendationImage.src = destinationImagePath;
      recommendationImage.style.display = "block";
    } else {
      recommendationImage.src = "";
      recommendationImage.style.display = "none";
    }

    if (
      typeof uestcServices !== "undefined" &&
      uestcServices[destinationName] &&
      Array.isArray(uestcServices[destinationName])
    ) {
      uestcServices[destinationName].forEach((service) => {
        const li = document.createElement("li");
        li.textContent = service;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No recommendations available yet.";
      list.appendChild(li);
    }

    recommendationPanel.style.display = "block";
  }

  function findNearestNodeId(lat, lng) {
    let nearestNodeId = null;
    let minDistance = Infinity;

    graph.nodes.forEach((node, nodeId) => {
      const distance = Math.sqrt(
        Math.pow(node.lat - lat, 2) + Math.pow(node.lng - lng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestNodeId = nodeId;
      }
    });

    return nearestNodeId;
  }

  function openImageModal(imageSrc) {
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");

    if (!imageModal || !modalImage || !imageSrc) {
      return;
    }

    modalImage.src = imageSrc;
    imageModal.style.display = "flex";
  }

  function setupClickableImages() {
    const clickableImages = document.querySelectorAll(
      "#startLocationImage, #endLocationImage, #recommendationImage"
    );

    clickableImages.forEach((img) => {
      img.classList.add("clickable-image");

      img.onclick = function () {
        if (img.src && img.style.display !== "none") {
          openImageModal(img.src);
        }
      };
    });

    const closeImageModal = document.getElementById("closeImageModal");
    const imageModal = document.getElementById("imageModal");

    if (closeImageModal && imageModal) {
      closeImageModal.onclick = function () {
        imageModal.style.display = "none";
      };

      imageModal.onclick = function (event) {
        if (event.target === imageModal) {
          imageModal.style.display = "none";
        }
      };
    }
  }

  showHomeScreen();
});