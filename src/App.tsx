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
import Collapsible from 'react-collapsible';
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";

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
  const [limit, setLimit] = useState({ values: [10] });
  const [firstGetGeolocation, setFirstGetGeolocation] = useState(false);

  async function requestPlaceAPI(map:google.maps.Map) {
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
    let center = new google.maps.LatLng(curCrd.latitude, curCrd.longitude);
    const request = {
      // required parameters
      fields: ['displayName', 'location', 'businessStatus', 'googleMapsURI'],
      locationRestriction: {
          center: center,
          radius: 500, 
      },
      // optional parameters
      includedPrimaryTypes: ['restaurant'],
      maxResultCount: 10,
      rankPreference: SearchNearbyRankPreference.POPULARITY,
      language: 'en-US',
      region: 'us',
    };

    const { places } = await Place.searchNearby(request);
    
    if (places.length) {
      console.log(places);
      const { LatLngBounds } = await google.maps.importLibrary("core") as google.maps.CoreLibrary;
      const bounds = new LatLngBounds();
      bounds.extend(center as google.maps.LatLng);
      const rndInt = Math.floor(Math.random() * (places.length - 0 + 1) + 0);
      const gachaPlace = places[rndInt];
      console.log(gachaPlace);
      //Loop through and get all the results.
      //places.forEach((place) => {
      //    new google.maps.Marker({
      //      position: place.location,
      //      map,
      //      label: {
      //        text: "\ue56c", // codepoint from https://fonts.google.com/icons
      //        fontFamily: "Material Icons",
      //        color: "#ffffff",
      //        fontSize: "18px",
      //      },
      //    });
      //    bounds.extend(place.location as google.maps.LatLng);
      //});
      const gachaMaker = new google.maps.Marker({
        position: gachaPlace.location,
        map,
        label: {
          text: "\ue56c", // codepoint from https://fonts.google.com/icons
          fontFamily: "Material Icons",
          color: "#ffffff",
          fontSize: "18px",
        },
        title: gachaPlace.displayName
      });

      const infowindow = new google.maps.InfoWindow({
        content: `${gachaPlace?.displayName || ""} <br> <a href=${gachaPlace?.googleMapsURI || ""}>${gachaPlace?.googleMapsURI || ""}</a>`
      });

      gachaMaker.addListener("click", () => {
        infowindow.open(gachaMaker.getMap(), gachaMaker);
      });

      bounds.extend(gachaPlace.location as google.maps.LatLng);
      map.fitBounds(bounds);
    } else {
        console.log("No results");
    }
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
    //Set current location
    new google.maps.Marker({
      position: { lat: curCrd.latitude, lng: curCrd.longitude },
      map,
      label: {
        text: "\ue566", // codepoint from https://fonts.google.com/icons
        fontFamily: "Material Icons",
        color: "#ffffff",
        fontSize: "18px",
      },
    });
    requestPlaceAPI(map);
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
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <div 
          className='mx-3 my-3'
          style={ { height:"500px", width: "250px", position: "fixed", left: "40px", zIndex: "999"}}
        >
          <Collapsible 
            trigger={
              <div className='w-5 h-5 rounded bg-slate-900/[.8] grid grid-cols-1 place-items-center'>
                <FaCaretRight fill='#f8fafc' className='content-center'/>
              </div>
            }
            triggerWhenOpen={
              <div>
                <FaCaretDown />
              </div>
            }
            onClick={() => {

            }}
          >
            <div className='rounded bg-slate-900/[.8] grid grid-cols-1 gap-3 justify-items-center' >              
              <div className='mt-3 w-10/12'>
                <div className='text-white'>搜索範圍: {radius.values[0]}</div>
                <Range
                  step={1}
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
              </div>
              <div className='mt-3 w-10/12'>
                <div className='text-white'>搜索數量限制: {limit.values[0]}</div>
                <Range
                  step={1}
                  min={10}
                  max={100}
                  values={limit.values}
                  onChange={(values) => setLimit({values})} 
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
              </div>
              <button
                className='mb-3 w-9/12 h-8'
                onClick={() => getUserLocation()}
              >
                食咩好
              </button>         
            </div>
          </Collapsible>
        </div>
        <br/>
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