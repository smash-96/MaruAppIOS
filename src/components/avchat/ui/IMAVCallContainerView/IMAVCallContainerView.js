import React, { useContext, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector, ReactReduxContext } from "react-redux";
import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  Modal,
} from "react-native";
//import Modal from "react-native-modal-patch";
//import RNCallKeep from "react-native-callkeep";
import { selectUserData } from "../../../../slices/userAuthSlice";

import axios from "axios";

// // Twilio imports
// import { TwilioVideo } from "react-native-twilio-video-webrtc";
// import { TWILIO_SERVER_ENDPOINT } from "../../streaming/twilio/config";
// import IMTwilioStreamManager from "../../streaming/twilio/streamManager";
// // End Twilio imports

//const { LaunchManager } = NativeModules;

import {
  setActiveCallData,
  selectActiveCallData,
} from "../../../../slices/callDataSlice";
import { IMAVAudioVideoCallingView } from "../";
//import { IMLocalized } from "../../../localization/IMLocalization";
import { AVTracker, AVAPIManager } from "../../api";
import AVChatCoordinator from "../../avChatCoordinator";
import IMWebRTCStreamManager from "../../streaming/webRTC/streamManager";
import IMAVActiveVideoCallView from "../IMAVActiveVideoCallView/IMAVActiveVideoCallView";
import IMAVActiveAudioCallView from "../IMAVActiveAudioCallView/IMAVActiveAudioCallView";

const API_URL_TEST =
  Platform.OS === "ios" ? "http://localhost:3000" : "http://10.0.2.2:3000";

const API_URL =
  "https://us-central1-volunteerteam-1c46b.cloudfunctions.net/getNTSToken?data=token";

const servers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "beaver",
      username: "webrtc.websitebeaver@gmail.com",
    },
  ],
};

const IMAVCallContainerView = (props) => {
  const { store } = useContext(ReactReduxContext);
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUserData);
  const activeCallData = useSelector(selectActiveCallData);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(null);
  const [ntsToken, setNTStoken] = useState(null);

  const apiManager = useRef(null);
  const avTracker = useRef(null);
  const avChatCoordinator = useRef(null);
  const streamManager = useRef(null);
  const streamManagerConstructorLock = useRef(false); // we need to create a single instance of streamManager per device. We need this lock to avoid a race condition between the signaling server and the getLocalStream method, needed for instantiating a stream manager
  const isSessionCallingPendingRef = useRef(false); // we keep track of whether there's a calling session of any kind or not

  // Twilio variant - turn this to true if you want to use Twilio instead of custom STUN servers
  // If you want to remove Twilio entirely, search for "twilio" in the codebase, and remove all the related code
  const isTwilioEnabled = false;
  // const twilioVideoRef = useRef();
  // const [twilioVideoTracks, setTwilioVideoTracks] = useState(new Map());

  // useEffect(() => {
  //   tearDownActiveCallSession();
  // });

  useEffect(() => {
    if (currentUser?.user) {
      // axios.get(`${API_URL}`).then((res) => {
      //   console.log("Axios NTS TOKEN", res);
      // });
      fetch(`${API_URL}`)
        .then((res) => res.json())
        .then((data) => {
          const value = { iceServers: data.iceServers };
          //console.log("NTS TOKEN", value);
          setNTStoken(value);
        })
        .catch((err) => {
          console.log("NTS FETCH ERROR", err);
          setNTStoken(servers);
        });
    }
  }, [currentUser?.user]);

  useEffect(() => {
    if (currentUser?.user.uid) {
      // processLaunchDataIfNeeded();
      // configureCallKeep();

      apiManager.current = new AVAPIManager();
      avChatCoordinator.current = new AVChatCoordinator(apiManager.current);
      // listening from the receipients side
      avTracker.current = new AVTracker(
        store,
        currentUser?.user.uid,
        apiManager.current
      );
      avTracker.current.subscribeIfNeeded();
      return () => {
        avTracker.current.unsubscribe();
      };
    }
  }, [currentUser?.user]);

  useEffect(() => {
    if (!activeCallData && streamManager.current) {
      // If there's no active call data anymore, but we had a streaming session, we need to tear it down
      tearDownActiveCallSession();
      return;
    }

    if (
      isSessionCallingPendingRef.current === false &&
      (activeCallData?.status === "incoming" ||
        activeCallData?.status === "outgoing" ||
        activeCallData?.status === "active")
    ) {
      // if this is the first time we identify a valid session of any kind
      isSessionCallingPendingRef.current = true;
    }
    if (isSessionCallingPendingRef.current === true && !activeCallData) {
      // If we used to have a valid user session of any kind, but not anymore
      isSessionCallingPendingRef.current = false;
      //RNCallKeep.endAllCalls(); // We end all call keep calls
    }

    if (activeCallData?.status === "active" && streamManager.current) {
      // We have an active call, we already had a streaming session, so we update the WebRTC connections
      streamManager.current.handleChangesInActiveParticipants(
        activeCallData.activeParticipants
      );
    }
    if (
      activeCallData?.status === "active" &&
      !streamManager.current &&
      !streamManagerConstructorLock.current
    ) {
      streamManagerConstructorLock.current = true;
      if (isTwilioEnabled) {
        // The current user just joined the call, so we start a streaming connection
        streamManager.current = new IMTwilioStreamManager(
          twilioVideoRef,
          activeCallData?.callID
        );
        if (activeCallData?.controlsState.muted === true) {
          streamManager.current.updateMicStatusForLocalStream(true);
          muteTwilioStream(false);
        }
        streamManager.current.updateSpeakerStatusForLocalStream(
          activeCallData?.controlsState?.speaker === true
        );
        startTwilioConnection();
      } else {
        // The current user just joined the call, so we start a streaming session and we update the WebRTC connections
        IMWebRTCStreamManager.getLocalStream(activeCallData?.callType).then(
          (localStream) => {
            streamManager.current = new IMWebRTCStreamManager(
              currentUser?.user.uid,
              activeCallData?.callID,
              localStream,
              activeCallData?.callType,
              apiManager.current,
              ntsToken,
              onRemoteStreamsUpdate
            );
            streamManager.current.handleChangesInActiveParticipants(
              activeCallData.activeParticipants
            );
            if (activeCallData?.controlsState.muted === true) {
              streamManager.current.updateMicStatusForLocalStream(true);
            }
            streamManager.current.updateSpeakerStatusForLocalStream(
              activeCallData?.controlsState?.speaker === true
            );
            setLocalStream(localStream);
          }
        );
      }
    }
  }, [activeCallData]);

  const onRemoteStreamsUpdate = (remoteStreams) => {
    setRemoteStreams(remoteStreams);
  };

  const onAcceptCall = () => {
    //RNCallKeep.answerIncomingCall(activeCallData.callID);
    avChatCoordinator.current.acceptCall(
      activeCallData.callID,
      currentUser?.user
    );
  };

  const onRejectCall = () => {
    if (isTwilioEnabled) {
      tearDownTwilioConnections();
    }

    //RNCallKeep.rejectCall(activeCallData?.callID);

    avChatCoordinator.current.rejectCall(
      activeCallData,
      currentUser?.user,
      dispatch
    );
  };

  const onCallExit = () => {
    // The current user was in a call, and they exited it

    avChatCoordinator.current.rejectCall(
      activeCallData,
      currentUser?.user,
      dispatch
    );

    tearDownActiveCallSession();
  };

  const onToggleMute = () => {
    const newMutedStatus =
      activeCallData?.controlsState?.muted === true ? false : true;
    const updatedActiveCallData = {
      ...activeCallData,
      controlsState: {
        speaker: activeCallData.controlsState.speaker,
        muted: newMutedStatus,
      },
    };
    if (streamManager.current) {
      streamManager.current.updateMicStatusForLocalStream(newMutedStatus);
    }
    if (isTwilioEnabled) {
      muteTwilioStream(!newMutedStatus);
    }
    dispatch(setActiveCallData(updatedActiveCallData));
  };

  const onToggleSpeaker = () => {
    const newSpeakerStatus =
      activeCallData?.controlsState?.speaker === true ? false : true;

    const updatedActiveCallData = {
      ...activeCallData,
      controlsState: {
        speaker: newSpeakerStatus,
        muted: activeCallData.controlsState.muted,
      },
    };
    if (streamManager.current) {
      streamManager.current.updateSpeakerStatusForLocalStream(newSpeakerStatus);
    }
    dispatch(setActiveCallData(updatedActiveCallData));
  };

  const tearDownActiveCallSession = () => {
    console.log("tearDownActiveCallSession for user " + currentUser?.user.uid);
    if (streamManager.current) {
      streamManager.current.closeAllConnections();
      streamManager.current = null;
      streamManagerConstructorLock.current = false;
    }
    // RNCallKeep.endAllCalls();
    // if (isTwilioEnabled) {
    //   tearDownTwilioConnections();
    // }
  };

  // const configureCallKeep = () => {
  //   console.log("configureCallKeep");
  //   RNCallKeep.addEventListener("answerCall", (body) => {
  //     console.log(
  //       "RNCallKeep - answered call from native UI " + JSON.stringify(body)
  //     );
  //     const callID = body.callUUID;
  //     if (callID && currentUser) {
  //       avChatCoordinator.current.acceptCall(callID, currentUser);
  //     }
  //   });
  //   RNCallKeep.addEventListener("endCall", (body) => {
  //     console.log(
  //       "RNCallKeep - ended call from native UI " + JSON.stringify(body)
  //     );
  //     const callID = body.callUUID;
  //     if (callID && currentUser) {
  //       if (isTwilioEnabled) {
  //         tearDownTwilioConnections();
  //       }
  //       avChatCoordinator.current.rejectCallByCallID(
  //         callID,
  //         currentUser,
  //         dispatch
  //       );
  //     }
  //   });
  // };

  /*
   * On Android, the app is woken up when a remote message is received (background push notification), and it presents
   * the native calling screen. Once user accepts the native calling screen, the app becomes active, and we place the user
   * in the call directly. This is what this method does.
   * This method basically enables calls when screen is locked on Android.
   */
  // const processLaunchDataIfNeeded = () => {
  //   if (Platform.OS !== "android") {
  //     return;
  //   }
  //   console.log("processLaunchDataIfNeeded");

  //   LaunchManager.getLaunchManagerData((callID) => {
  //     console.log(" android app awake with data: ");
  //     console.log(callID);
  //     if (callID) {
  //       avChatCoordinator.current.acceptCall(callID, currentUser);
  //     }
  //   });
  // };

  // Rendering the views
  if (!activeCallData) {
    // No calls were requested
    return null;
  }
  /*
  activeCallData : {
    status: incoming | outgoing | active | ending
    callType: audio | video
    channelID,
    channelTitle,
    allChannelParticipants,
    activeParticipants,
    controlsState: {
      muted: true | false,
      speaker: true | false
    }
*/
  if (
    activeCallData?.status === "incoming" ||
    activeCallData?.status === "outgoing"
  ) {
    // Call hasn't started yet, but it was requested by someone
    const allChannelParticipants = activeCallData?.allChannelParticipants;

    const otherParticipants = allChannelParticipants?.filter(
      (user) => user?.uid !== currentUser?.user.uid
    );
    const callStatusLabelTitle =
      activeCallData.callType == "video"
        ? activeCallData?.status == "incoming"
          ? "Incoming Video Call..."
          : "Video Calling..."
        : activeCallData?.status == "incoming"
        ? "Incoming Audio Call..."
        : "Audio Calling...";

    return (
      <Modal
        visible={true}
        animationType={"fade"}
        presentationStyle={"fullScreen"}
      >
        <IMAVAudioVideoCallingView
          channelTitle={activeCallData.channelName}
          callType={activeCallData.callType}
          otherParticipants={otherParticipants}
          shouldDisplayAcceptButton={activeCallData.status === "incoming"}
          shouldStartRingtone={activeCallData.status === "incoming"}
          callStatusLabelTitle={callStatusLabelTitle}
          isSpeaker={activeCallData?.controlsState?.speaker}
          isMuted={activeCallData?.controlsState?.muted}
          onToggleSpeaker={onToggleSpeaker}
          onToggleMute={onToggleMute}
          onAcceptCall={onAcceptCall}
          onRejectCall={onRejectCall}
        />
        {/* {renderTwilioVideoIfNeeded()} */}
      </Modal>
    );
  }

  if (
    activeCallData?.status === "active" &&
    activeCallData?.callType === "video"
  ) {
    // Video call already started yet, and current user status is "active" in the call, so we land them directly in the call
    return (
      <Modal
        visible={true}
        animationType={"fade"}
        presentationStyle={"fullScreen"}
      >
        <IMAVActiveVideoCallView
          localStream={localStream}
          remoteStreams={remoteStreams}
          isTwilioEnabled={isTwilioEnabled}
          //twilioVideoTracksMap={twilioVideoTracks}
          isSpeaker={activeCallData?.controlsState.speaker}
          isMuted={activeCallData?.controlsState.muted}
          onToggleSpeaker={onToggleSpeaker}
          onToggleMute={onToggleMute}
          onCallExit={onCallExit}
        />
        {/* {renderTwilioVideoIfNeeded()} */}
      </Modal>
    );
  }

  if (
    activeCallData?.status === "active" &&
    activeCallData?.callType === "audio"
  ) {
    // Audio call already started yet, and current user status is "active" in the call, so we land them directly in the call
    const allChannelParticipants = activeCallData?.allChannelParticipants;
    const otherParticipants = allChannelParticipants?.filter(
      (user) => user?.uid !== currentUser?.user.uid
    );
    return (
      <Modal
        visible={true}
        animationType={"fade"}
        presentationStyle={"fullScreen"}
      >
        <IMAVActiveAudioCallView
          callStartTimestamp={activeCallData?.callStartTimestamp}
          channelTitle={activeCallData.channelName}
          otherParticipants={otherParticipants}
          isSpeaker={activeCallData?.controlsState.speaker}
          isMuted={activeCallData?.controlsState.muted}
          onToggleSpeaker={onToggleSpeaker}
          onToggleMute={onToggleMute}
          onEndCall={onCallExit}
        />
        {/* {renderTwilioVideoIfNeeded()} */}
      </Modal>
    );
  }

  return null;
};

export default IMAVCallContainerView;
