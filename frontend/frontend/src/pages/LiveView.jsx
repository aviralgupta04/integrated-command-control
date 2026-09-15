
import { useState } from "react";
import "./LiveView.css";
import CameraPlayer from "../components/CameraPlayer";


function LiveView() {

    const [activeCameras, setActiveCameras] = useState([]);

    const cameras = [
        {
            id: 1,
            name: "webcam Camera",
            location: "Head Office",
            status: "online",
            streamUrl: "http://192.168.0.105:8889/my_camera/whep"
        },

        {
            id: 2,
            name: "Reception Camera",
            location: "Head Office",
            status: "online",
            streamUrl: "http://localhost:8889/test/whep"
        },

        {
            id: 3,
            name: "Parking Camera",
            location: "Head Office",
            status: "offline",
            streamUrl: null
        },

        {
            id: 4,
            name: "Warehouse Camera 1",
            location: "Warehouse",
            status: "online",
            streamUrl: "http://localhost:8889/test/whep"
        },

        {
            id: 5,
            name: "Warehouse Camera 2",
            location: "Warehouse",
            status: "offline",
            streamUrl: null
        }
    ];


    // Double click camera
    const openCamera = (camera) => {

        if (camera.status !== "online") {
            return;
        }

        // Don't add same camera twice
        if (
            activeCameras.some(
                function(cam){
                     return cam.id === camera.id
                }
            )
        ) {
            return;
        }

        setActiveCameras(prev => [
            ...prev,
            camera
        ]);

    };


    // Remove camera from grid
    const closeCamera = (cameraId) => {

        setActiveCameras(prev =>
            prev.filter(
                camera => camera.id !== cameraId
            )
        );

    };


    return (

        <div className="live-view">

            {/* =========================
                LEFT PANEL
            ========================= */}

            <div className="left-panel">

                <h3>Cameras</h3>

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Search Camera..."
                    />

                </div>


                <div className="camera-list">

                    {/* HEAD OFFICE */}

                    <div className="camera-group">

                        <h4>📁 Head Office</h4>


                        <div
                            className="camera online"
                            onDoubleClick={() =>
                                openCamera(cameras[0])
                            }
                        >
                            🟢 Entrance Camera
                        </div>


                        <div
                            className="camera online"
                            onDoubleClick={() =>
                                openCamera(cameras[1])
                            }
                        >
                            🟢 Reception Camera
                        </div>


                        <div
                            className="camera offline"
                        >
                            🔴 Parking Camera
                        </div>

                    </div>


                    {/* WAREHOUSE */}

                    <div className="camera-group">

                        <h4>📁 Warehouse</h4>


                        <div
                            className="camera online"
                            onDoubleClick={() =>
                                openCamera(cameras[3])
                            }
                        >
                            🟢 Camera 1
                        </div>


                        <div
                            className="camera offline"
                        >
                            🔴 Camera 2
                        </div>

                    </div>

                </div>

            </div>


            {/* =========================
                MAIN VIEW
            ========================= */}

            <div className="main-view">

                <div className="live-view-header">

                    <h2>Live View</h2>

                </div>


                {/* CAMERA GRID */}

                <div className="camera-grid">

                    {activeCameras.map(camera => (

                        <div
                            className="camera-tile"
                            key={camera.id}
                        >

                            <div className="video-container">

                                <CameraPlayer
                                    streamUrl={camera.streamUrl}
                                />


                                <button
                                    className="close-camera"
                                    onClick={() =>
                                        closeCamera(camera.id)
                                    }
                                >
                                    ✕
                                </button>

                            </div>


                            <div className="camera-info">

                                🟢 {camera.name}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default LiveView;

