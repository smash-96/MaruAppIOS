import { Dimensions, Platform } from "react-native";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import RNCallKeep from "react-native-callkeep";

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

export default class IMWebRTCStreamManager {
  constructor(
    userID,
    callID,
    localStream,
    callType,
    apiManager,
    ntsToken,
    onRemoteStreamsUpdateCallback
  ) {
    this.userID = userID;
    this.callID = callID;
    this.localStream = localStream;
    this.callType = callType;
    this.apiManager = apiManager;
    this.ntsToken = ntsToken;
    this.onRemoteStreamsUpdateCallback = onRemoteStreamsUpdateCallback;

    // Subscribe user to call connection data updates for this channel, but we make sure we created a local stream first
    this.callConnectionDataUnsubscribe =
      this.apiManager.subscribeToCallConnectionData(
        callID,
        userID,
        this.onCallConnectionDataUpdate
      );

    this.remoteStreams = null; // the list of remote WebRTC streams (so streams from the remote call participants)
    this.peerConnections = {};
    this.activeParticipants = []; // array of all the active participants in the current call
    this.sentOfferIDs = []; // array of user IDs to whom we've already sent an WebRTC offer
    this.processedCallConnectionDataIDs = []; // array of call connection data item IDs that were already processed by the streamer
  }

  updateMicStatusForLocalStream = (isMuted) => {
    Platform.OS === "ios" && RNCallKeep.setMutedCall(this.callID, isMuted);
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  };

  updateSpeakerStatusForLocalStream = (speakerEnabled) => {
    InCallManager.setSpeakerphoneOn(speakerEnabled);
    InCallManager.setForceSpeakerphoneOn(speakerEnabled);
  };

  handleChangesInActiveParticipants = async (activeParticipants) => {
    try {
      // We've received the full array of the currently active participants in the chat, so we initiate all the new needed connections
      // We also close all the connections for those who exited the chat
      // We also update this.activeParticipants to reflect the new list of active participants

      const userID = this.userID;
      let sentOfferIDs = [...this.sentOfferIDs];
      const sortedParticipants = activeParticipants
        .slice()
        .sort((user1, user2) => {
          let value =
            user1.uid > user2.uid ? -1 : user1.uid < user2.uid ? 1 : 0;
          return value;
        });

      const userIndexAfterSorting = sortedParticipants.findIndex(
        (participant) => participant.uid === userID
      );

      if (userIndexAfterSorting > -1) {
        // If current user is still active in the call
        let offerRecipients = sortedParticipants.slice(
          0,
          userIndexAfterSorting
        );
        // We send WebRTC offers to all the active participants in the call, who have an userID that is lexicografically smaller than the current user's ID
        for (var i = 0; i < offerRecipients.length; ++i) {
          const recipient = offerRecipients[i];
          await this.sendOffer(recipient.uid);
        }
      }

      const remoteStreams = this.remoteStreams;
      if (remoteStreams?.length > 0) {
        // We figure out which participants exited the call since the last change in the call channel table, and we close those connections
        const previouslyActiveParticipants = [...this.activeParticipants];
        const exitedParticipants = [];
        previouslyActiveParticipants.forEach((activeParticipant) => {
          const stillActiveParticipant = activeParticipants.find(
            (updatedParticipant) =>
              activeParticipant.uid === updatedParticipant.uid
          );
          if (!stillActiveParticipant && activeParticipant) {
            exitedParticipants.push(activeParticipant);
          }
        });

        exitedParticipants.forEach((exitedParticipant) => {
          if (this.peerConnections[exitedParticipant.uid]) {
            this.peerConnections[exitedParticipant.uid].close();
            delete this.peerConnections[exitedParticipant.uid];
          }
          if (remoteStreams && remoteStreams[exitedParticipant.uid]) {
            delete remoteStreams[exitedParticipant.uid];
          }
          sentOfferIDs = sentOfferIDs.filter(
            (connectionId) => connectionId !== exitedParticipant.uid
          ); // Since we closed a connection to a remote user, we also remove that sentOfferID for that user, so the connection can be restablished if that user joins the chat again
        });
        this.remoteStreams = remoteStreams; // Since we potentially closed some connections, we also update the remoteStreams array
        this.onRemoteStreamsUpdateCallback &&
          this.onRemoteStreamsUpdateCallback(this.remoteStreams);
      }

      this.activeParticipants = [...sortedParticipants];
      this.sentOfferIDs = sentOfferIDs;
    } catch (err) {
      console.log("ERROR1", err);
    }
  };

  onCallConnectionDataUpdate = async (callConnectionDataArray) => {
    try {
      for (var i = 0; i < callConnectionDataArray.length; ++i) {
        let dataItem = callConnectionDataArray[i];
        await this.processCallConnectionData(dataItem);
      }
    } catch (err) {
      console.log("ERROR2", err);
    }
  };

  processCallConnectionData = async (callConnectionData) => {
    try {
      const { message, senderID, dataID } = callConnectionData;
      if (this.processedCallConnectionDataIDs.includes(dataID)) {
        return;
      }
      this.processedCallConnectionDataIDs = [
        ...this.processedCallConnectionDataIDs,
        dataID,
      ];

      try {
        const pc = this.getPeerConnection(senderID);
        if (message.ice) {
          await pc.addIceCandidate(new RTCIceCandidate(message.ice));
        } else if (message.sdp.type === "offer") {
          console.log(this.userID + " received an offer from " + senderID);
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await this.apiManager.addCallConnectionData(this.callID, {
            senderID: this.userID,
            recipientID: senderID,
            callType: this.callType,
            callID: this.callID,
            message: { sdp: JSON.parse(JSON.stringify(pc.localDescription)) },
          });
          console.log(
            this.userID + " sent an answer to the offer to " + senderID
          );
        } else if (message.sdp.type === "answer") {
          console.log(this.userID + " received an answer from  " + senderID);
          await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
        }
      } catch (error) {
        console.log(error);
      }
    } catch (err) {
      console.log("ERROR3", err);
    }
  };

  closeAllConnections = () => {
    try {
      // Current user exits the call, so we close all remote streams
      var remoteStreams = this.remoteStreams;
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream.release();
      }
      Object.keys(this.peerConnections).forEach((key) => {
        if (this.peerConnections[key]) {
          this.peerConnections[key].close();
          delete this.peerConnections[key];
        }
        if (remoteStreams && remoteStreams[key]) {
          delete remoteStreams[key];
        }
      });
      this.remoteStreams = null;
      this.onRemoteStreamsUpdateCallback &&
        this.onRemoteStreamsUpdateCallback(this.remoteStreams);

      // We reset all properties to their original values
      this.peerConnections = {};
      this.activeParticipants = [];
      this.sentOfferIDs = [];
      this.processedCallConnectionDataIDs = [];

      // We also close ths subscription to the signaling server
      this.callConnectionDataUnsubscribe &&
        this.callConnectionDataUnsubscribe();
    } catch (err) {
      console.log("ERROR4", err);
    }
  };

  sendOffer = async (recipientID) => {
    try {
      const alreadySent = this.sentOfferIDs.includes(recipientID);
      if (alreadySent) {
        // Making sure we don't send another WebRTC offer to the same user
        return;
      }
      this.sentOfferIDs = this.sentOfferIDs.concat([recipientID]);

      const pc = this.getPeerConnection(recipientID);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await this.apiManager.addCallConnectionData(this.callID, {
          senderID: this.userID,
          recipientID: recipientID,
          callType: this.callType,
          callID: this.callID,
          message: { sdp: JSON.parse(JSON.stringify(pc.localDescription)) },
        });
        console.log("offer sent from " + this.userID + " to " + recipientID);
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.log("ERROR5", err);
    }
  };

  getPeerConnection = (recipientID) => {
    try {
      if (this.peerConnections[recipientID]) {
        return this.peerConnections[recipientID];
      }
      const pc = new RTCPeerConnection(this.ntsToken);
      //const pc = new RTCPeerConnection(servers);
      pc.addStream(this.localStream);

      pc.onconnectionstatechange = (event) => {
        console.log("onconnectionstatechange");
      };
      pc.onicecandidateerror = (error) => {
        console.log("onicecandidateerror");
        console.log(error);
      };
      pc.onicecandidate = (evnt) => {
        evnt.candidate
          ? this.apiManager.addCallConnectionData(this.callID, {
              senderID: this.userID,
              recipientID: recipientID,
              callType: this.callType,
              callID: this.callID,
              message: { ice: JSON.parse(JSON.stringify(evnt.candidate)) },
            })
          : console.log("Sent All Ice");
      };
      pc.onaddstream = (evnt) => {
        console.log("onaddstream");
        this.remoteStreams = {
          ...this.remoteStreams,
          [recipientID]: evnt.stream,
        };
        this.onRemoteStreamsUpdateCallback &&
          this.onRemoteStreamsUpdateCallback(this.remoteStreams);
      };
      pc.onnegotiationneeded = () => {};
      this.peerConnections[recipientID] = pc;

      return pc;
    } catch (err) {
      console.log("ERROR6", err);
    }
  };

  static getLocalStream = async (callType) => {
    try {
      const isFront = true;
      const devices = await mediaDevices.enumerateDevices();

      const facing = isFront ? "front" : "environment";
      const videoSourceId =
        devices &&
        devices.find(
          (device) => device.kind === "videoinput" && device.facing === facing
        );
      const facingMode = isFront ? "user" : "environment";
      const windowHeight = Dimensions.get("window").height;
      const windowWidth = Dimensions.get("window").width;
      let constraints = {
        audio: true,
        video: {
          mandatory: {
            minWidth: 500,
            minHeight: 300,
            width: windowWidth,
            height: windowHeight,
            minFrameRate: 30,
          },
          facingMode,
          optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
        },
      };
      if (callType === "audio") {
        constraints = {
          audio: true,
          video: false,
        };
      }

      const localStream = await mediaDevices.getUserMedia(constraints);
      return localStream;
    } catch (err) {
      console.log("ERROR7", err);
    }
  };
}
