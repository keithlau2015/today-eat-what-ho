import React, { SetStateAction, useEffect, useState } from 'react';
import './App.css';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  MapCameraProps,
  Marker,
} from '@vis.gl/react-google-maps';
import { Range } from 'react-range';
import { IRenderThumbParams, IRenderTrackParams } from 'react-range/lib/types';
import { createRoot } from 'react-dom/client';

// TODO: Get a Google Maps Platform API key:
/*
 * 1. Open the Project IDX view by pressing Ctrl+Shift+P / Cmd+Shift+P and type "IDX focus", then select "IDX: Focus on Project IDX View"
 * 2. Click on the "Google Maps Platform" integration.
 * 3. Click "Enable APIs" to enable the Google Maps Platform APIs.
 * 4. Click "Get API Key" to get an API key.
 * 5. Create a file named .env.local in the root directory. The .local suffix keeps secrets out of source control.
 * 6. In the file, add the line: VITE_MAPS_API_KEY=YOUR_API_KEY.
 * 7. Replace YOUR_API_KEY with the API key you got in step 4. */
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY as string;

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};


function App() {
  //const [cameraState, setCameraState] = useState<MapCameraProps>();
  const [radius, setRadius] = useState({ values: [1] });
  const [curCrd, setCurCrd] = useState({ latitude: 0, longitude: 0 });
  const [firstGetGeolocation, setFirstGetGeolocation] = useState(false);

  async function requestPlaceAPI() {
    const response = await fetch(`https://places.googleapis.com/v1/places:searchNearby`, {
      mode: "cors",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.displayName'
      },
      body: JSON.stringify({
        'includedTypes': ["restaurant"],
        "maxResultCount": 10,
        "locationRestriction": {
          "circle": {
            "center": {
              "latitude": curCrd.latitude,
              "longitude": curCrd.longitude},
            "radius": radius.values[0]
          }
        }
      })
    });
    const jsonObj = await response.json();
    console.log(jsonObj);
    const places = jsonObj.places;
    console.log(places);
  }

  function errors(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  
  async function success(pos) {
    var crd = pos.coords;
    //setCameraState({
    //  center: { lat: crd.latitude, lng: crd.longitude },
    //  zoom: 16,
    //});
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const map = new Map(document.getElementById('map') as HTMLElement);
    map.setCenter(new google.maps.LatLng(crd.latitude, crd.longitude));
    map.setZoom(16);
    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    console.log(`Current radius ${radius.values[0]}.`);
    setCurCrd(crd);
    requestPlaceAPI();
  }

  useEffect(() => {
    if (navigator.geolocation && !firstGetGeolocation) {
      getUserLocation();
      setFirstGetGeolocation(true);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
  });

  async function getUserLocation() {
    navigator.permissions
    .query({ name: "geolocation" })
    .then(function (result) {
        console.log(result);
        if (result.state === "granted") {
          //If granted then you can directly call your function here
          navigator.geolocation.getCurrentPosition(success, errors, options);
        } else if (result.state === "prompt") {
          //If prompt then the user will be asked to give permission
          navigator.geolocation.getCurrentPosition(success, errors, options);
        } else if (result.state === "denied") {
          //If denied then you have to show instructions to enable location
        }
    });
  }

  return (
    <>
      {/* Be sure to wrap the Map component in a container that has a width and height >0px in order for the map to be visible. */}
      <APIProvider 
        apiKey={MAPS_API_KEY} 
        onLoad={() => console.log('Maps API has loaded.')}
        solutionChannel="GMP_idx_templates_v0_reactts"
        >
          <button
            style={ { height:"50px", width: "50px", backgroundColor: "black", position: "fixed", left: "40px", zIndex: "999"}}
            onClick={() => {}}
          >
            
          </button>

          <button 
            onClick={() => getUserLocation()}
          >
            Refresh Current location
          </button>
          <br />
          Searching Radius
          <Range            
            step={0.1}
            min={1}
            max={1000}
            values={radius.values}
            onChange={(values) => setRadius({values})} 
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ccc'
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '12px',
                  width: '12px',
                  backgroundColor: '#999'
                }}
              />
            )}   
          />
        <br/>
        <Map
            id='map'
            mapId={'MAP'}
            //disableDefaultUI={true}
            defaultZoom={16}
            //defaultCenter={ { lat: crd.latitude, lng: crd.longitude } }
            //{...cameraState}
            gestureHandling={"greedy"}
            onCameraChanged={ (ev: MapCameraChangedEvent) =>
              console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }>
        </Map>
      </APIProvider>
    </>
  );
}

export default App;