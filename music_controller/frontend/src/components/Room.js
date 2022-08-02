import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Grid } from "@mui/material";
import CreateRoom from "./CreateRoom";
import MusicPlayer from "./MusicPlayer";

export default function Room(props) {
  //Variable array with 3 values
  const initialState = {
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  };

  const initialSong = {
    title: "",
    artist: "",
    duration: 0,
    time: 0,
    image_url: "",
    is_playing: false,
    votes: 0,
    id: "",
  };

  const [roomData, setRoomData] = useState(initialState);
  const { roomCode } = useParams();
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [song, setSong] = useState(initialSong);

  let useInterval = (callback, delay) => {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    getRoomDetails();

    //  getCurrentSong();
  }, [showSettings]);

  useEffect(() => {
    if (roomData.isHost){
      authenticateSpotify();
    }

    //  getCurrentSong();
  }, [roomData.isHost]);

  useInterval(() => {getCurrentSong()}, 1000);

  // var interval;
  // useEffect(() => {
  //   let didCancel = false;
  //   if (!didCancel){
  //     interval = setInterval(getCurrentSong, 1000);

  //   }

  //   return () => {
  //     didCancel = true;
  //     clearInterval(interval)
  //   }
  // }, [])

  let navigate = useNavigate();

  // fetch python room class from backend, convert to json, use json data to update current state
  let getRoomDetails = () => {
    console.log("get room details rerendered");
    fetch("/api/get-room" + "?code=" + roomCode)
      .then((res) => {
        if (!res.ok) {
          props.leaveRoomCallback();
          navigate("/");
        }
        return res.json();
      })
      .then((data) => {
        setRoomData({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });

        // if (roomData.isHost) {
        //   authenticateSpotify();
        // }
      });
  };

  let authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setIsAuthenticated({ isAuthenticated: data.status });
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  };

  //It renders when the object changes .If we use roomData and/or roomCode then it rerenders infinite times

  let getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSong({ song: data });
        console.log(song.song);
      });
  };


  let leaveButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      props.leaveRoomCallback();
      navigate("/");
    });
  };

  let renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoom
            update={true}
            votesToSkip={roomData.votesToSkip}
            guestCanPause={roomData.guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  let renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  if (showSettings) {
    return renderSettings();
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...song.song} />
      {roomData.isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
}
