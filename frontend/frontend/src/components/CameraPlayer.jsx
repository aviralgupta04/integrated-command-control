
import { useEffect, useRef } from "react";

function CameraPlayer({ streamUrl }) {

    const videoRef = useRef(null);

    useEffect(() => {

        let peerConnection;

        const startStream = async () => {

            try {

                peerConnection = new RTCPeerConnection();

                // We only receive video/audio
                peerConnection.addTransceiver("video", {
                    direction: "recvonly"
                });

                peerConnection.addTransceiver("audio", {
                    direction: "recvonly"
                });

                // When MediaMTX sends the stream
                peerConnection.ontrack = (event) => {

                    if (videoRef.current) {
                        videoRef.current.srcObject = event.streams[0];
                    }

                };

                // Create WebRTC offer
                const offer = await peerConnection.createOffer();

                await peerConnection.setLocalDescription(offer);

                // Wait for ICE gathering
                await new Promise((resolve) => {

                    if (
                        peerConnection.iceGatheringState === "complete"
                    ) {
                        resolve();
                    }

                    else {

                        const checkState = () => {

                            if (
                                peerConnection.iceGatheringState === "complete"
                            ) {

                                peerConnection.removeEventListener(
                                    "icegatheringstatechange",
                                    checkState
                                );

                                resolve();
                            }

                        };

                        peerConnection.addEventListener(
                            "icegatheringstatechange",
                            checkState
                        );
                    }

                });


                // Send SDP offer to MediaMTX
                const response = await fetch(streamUrl, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/sdp"
                    },

                    body: peerConnection.localDescription.sdp

                });


                if (!response.ok) {
                    throw new Error(
                        `MediaMTX returned ${response.status}`
                    );
                }


                // Get SDP answer
                const answer = await response.text();


                await peerConnection.setRemoteDescription({

                    type: "answer",
                    sdp: answer

                });

            }

            catch (error) {

                console.error(
                    "WebRTC stream error:",
                    error
                );

            }

        };


        startStream();


        // Cleanup when component disappears
        return () => {

            if (peerConnection) {
                peerConnection.close();
            }

        };

    }, [streamUrl]);


    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
        />
    );
}

export default CameraPlayer;

