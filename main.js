import './style.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlLPhfzdVMCTBO1GeSUX_Dkcmb5z75Va8",
  authDomain: "vc-2-da5e3.firebaseapp.com",
  projectId: "vc-2-da5e3",
  storageBucket: "vc-2-da5e3.appspot.com",
  messagingSenderId: "519675806328",
  appId: "1:519675806328:web:6f8e3f1ad42cd2cf5a638d",
  measurementId: "G-0B5CSK35FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

const webcamButton = document.getElementById('webcamButton');
const webcamVideo = document.getElementById('webcamVideo');
const callButton = document.getElementById('callButton');
const callInput = document.getElementById('callInput');
const answerButton = document.getElementById('answerButton');
const remoteVideo = document.getElementById('remoteVideo');
const hangupButton = document.getElementById('hangupButton');

document.getElementById('muteButton').addEventListener('click', () => {
    const videoElement = document.getElementById('webcamVideo');
    if (!videoElement.srcObject) return;

    const audioTracks = videoElement.srcObject.getAudioTracks();
    if (audioTracks.length === 0) return;

    const isMuted = audioTracks[0].enabled;
    audioTracks[0].enabled = !isMuted;

   document.getElementById('muteButton').innerHTML = isMuted ? '<svg fill="#000000" width="40px" height="40px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805a.75.75 0 01.808-.13zM10.5 5.445l-4.245 3.86a.75.75 0 01-.505.195h-3a.25.25 0 00-.25.25v4.5c0 .138.112.25.25.25h3a.75.75 0 01.505.195l4.245 3.86V5.445z"/><path d="M18.718 4.222a.75.75 0 011.06 0c4.296 4.296 4.296 11.26 0 15.556a.75.75 0 01-1.06-1.06 9.5 9.5 0 000-13.436.75.75 0 010-1.06z"/><path d="M16.243 7.757a.75.75 0 10-1.061 1.061 4.5 4.5 0 010 6.364.75.75 0 001.06 1.06 6 6 0 000-8.485z"/></svg>' : '<svg width="40px" height="40px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#000000" d="m412.16 592.128-45.44 45.44A191.232 191.232 0 0 1 320 512V256a192 192 0 1 1 384 0v44.352l-64 64V256a128 128 0 1 0-256 0v256c0 30.336 10.56 58.24 28.16 80.128zm51.968 38.592A128 128 0 0 0 640 512v-57.152l64-64V512a192 192 0 0 1-287.68 166.528l47.808-47.808zM314.88 779.968l46.144-46.08A222.976 222.976 0 0 0 480 768h64a224 224 0 0 0 224-224v-32a32 32 0 1 1 64 0v32a288 288 0 0 1-288 288v64h64a32 32 0 1 1 0 64H416a32 32 0 1 1 0-64h64v-64c-61.44 0-118.4-19.2-165.12-52.032zM266.752 737.6A286.976 286.976 0 0 1 192 544v-32a32 32 0 0 1 64 0v32c0 56.832 21.184 108.8 56.064 148.288L266.752 737.6z"/><path fill="#000000" d="M150.72 859.072a32 32 0 0 1-45.44-45.056l704-708.544a32 32 0 0 1 45.44 45.056l-704 708.544z"/></svg>';
});
// Check if the device is a phone
const isPhone = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

let currentCamera = 'user'; // Default camera

// Assuming the rest of the code is unchanged and focusing on the camera flip functionality
if (isPhone) {
  document.getElementById('flipCameraButton').addEventListener('click', async () => {
    currentCamera = currentCamera === 'user' ? 'environment' : 'user';

    // Stop all video tracks before switching
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Switch the camera
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentCamera },
        audio: true
      });

      // Update the local video stream
      webcamVideo.srcObject = localStream;

      // Update the peer connection with the new video track
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
    } catch (error) {
      console.error('Error flipping the camera', error);
    }
  });
}else {
  document.getElementById('flipCameraButton').style.display = 'none';
}
function reinitializeCallOnRefresh() {
  const storedCallId = localStorage.getItem('callId');
  if (storedCallId) {
    // Logic to reinitialize the call setup with the stored call ID
    console.log("Reinitializing call with ID:", storedCallId);
    // You might need to fetch call details from Firestore and set up the peer connection again
  }
}
// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
    reinitializeCallOnRefresh();  
    webcamButton.onclick = async () => {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      remoteStream = new MediaStream();
    
      // Add tracks from local stream to the peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

    
      // When a remote track is added, add it to the remote stream
      pc.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
      };
    
      webcamVideo.srcObject = localStream;
      remoteVideo.srcObject = remoteStream;
      callButton.disabled = false;
      answerButton.disabled = false;
      webcamButton.disabled = true;
    };

    callButton.onclick = async () => {
      const callsCollection = collection(firestore, 'calls');
      const callDoc = doc(callsCollection); // Creates a new document reference
      localStorage.setItem('callId', callDoc.id);
      const offerCandidates = collection(callDoc, 'offerCandidates');
      const answerCandidates = collection(callDoc, 'answerCandidates');
    
      callInput.value = callDoc.id;
    
      // Get candidates for caller, save to db
      pc.onicecandidate = (event) => {
        event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
      };
    
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);
    
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
    
      await setDoc(callDoc, { offer });
    
      // Listen for remote answer
      onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      // When answered, add candidate to peer connection
      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });

      hangupButton.disabled = false;
    };
    
    answerButton.onclick = async () => {
      const callId = callInput.value;
      const callDoc = doc(firestore, 'calls', callId);
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const offerCandidates = collection(callDoc, 'offerCandidates');

      pc.onicecandidate = (event) => {
        event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
      };

      const callSnap = await getDoc(callDoc);
      const callData = callSnap.data();

      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDoc, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    };
    hangupButton.onclick = () => {
  // Close the peer connection
  if (pc) {
    pc.close();
  }

  // Stop all local media tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  // Stop all remote media tracks
  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  // Reset the UI state and disable buttons as needed
  webcamButton.disabled = false; // Enable the webcam button to allow starting a new call
  callButton.disabled = true; // Disable the call button until the webcam is started again
  answerButton.disabled = true; // Disable the answer button as there's no ongoing call
  hangupButton.disabled = true; // Disable the hangup button as the call has ended

  // Optionally, clear the video elements
  webcamVideo.srcObject = null;
  remoteVideo.srcObject = null;

  // Log the hangup action
  console.log("Call ended.");
};
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // Handle errors here, such as displaying a message to the user.
  });