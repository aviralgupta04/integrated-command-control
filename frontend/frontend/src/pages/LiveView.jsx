import { useEffect, useState } from "react";
import "./LiveView.css";
import CameraPlayer from "../components/CameraPlayer";

const API_URL = "https://localhost:7068/api/CameraDbRegister";

function LiveView() {
    const [cameras, setCameras] = useState([]);
    const [activeCameras, setActiveCameras] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = (true);
    const [error, setError] = useState("");

    // Load registered cameras from the database through the API
    useEffect(() => {
        const controller = new AbortController();

        async function fetchCameras() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to load cameras: HTTP ${response.status}`
                    );
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "The GET API must return a JSON array of cameras."
                    );
                }

                // Convert API response properties into the UI format.
                const formattedCameras = data.map((camera) => ({
                    id: camera.id ?? camera.Id ?? camera.deviceId ?? camera.DeviceId,
                    name:
                        camera.name ??
                        camera.Name ??
                        camera.cameraName ??
                        camera.CameraName ??
                        "Unnamed Camera",
                    location:
                        camera.location ??
                        camera.Location ??
                        "Unassigned",
                    status:
                        camera.status ??
                        camera.Status ??
                        "Offline",

                    // This must be a browser-accessible WHEP URL,
                    // not the camera's RTSP URL.
                    streamUrl:
                        camera.streamUrl ??
                        camera.StreamUrl ??
                        camera.whepUrl ??
                        camera.WhepUrl ??
                        null
                }));

                setCameras(formattedCameras);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchCameras();

        return () => controller.abort();
    }, []);

    // Open a camera on double-click
    const openCamera = (camera) => {
        if (
            String(camera.status).toLowerCase() !== "online" ||
            !camera.streamUrl
        ) {
            return;
        }

        setActiveCameras((previous) => {
            if (previous.some((cam) => cam.id === camera.id)) {
                return previous;
            }

            return [...previous, camera];
        });
    };

    // Remove a camera from the live grid
    const closeCamera = (cameraId) => {
        setActiveCameras((previous) =>
            previous.filter((camera) => camera.id !== cameraId)
        );
    };

    // Search by camera name or location
    const filteredCameras = cameras.filter((camera) => {
        const query = search.toLowerCase();

        return (
            camera.name.toLowerCase().includes(query) ||
            camera.location.toLowerCase().includes(query)
        );
    });

    // Group cameras according to their location
    const groupedCameras = filteredCameras.reduce((groups, camera) => {
        const location = camera.location || "Unassigned";

        if (!groups[location]) {
            groups[location] = [];
        }

        groups[location].push(camera);
        return groups;
    }, {});

    return (
        <div className="live-view">
            <div className="left-panel">
                <h3>Cameras</h3>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search Camera..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="camera-list">
                    {loading && <p>Loading cameras...</p>}

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    {!loading && !error && cameras.length === 0 && (
                        <p>No cameras registered.</p>
                    )}

                    {!loading &&
                        !error &&
                        Object.entries(groupedCameras).map(
                            ([location, locationCameras]) => (
                                <div className="camera-group" key={location}>
                                    <h4>📁 {location}</h4>

                                    {locationCameras.map((camera) => {
                                        const online =
                                            String(camera.status).toLowerCase() ===
                                            "online";

                                        return (
                                            <div
                                                key={camera.id}
                                                className={`camera ${
                                                    online ? "online" : "offline"
                                                }`}
                                                title={
                                                    online
                                                        ? "Double-click to open"
                                                        : "Camera is offline"
                                                }
                                                onDoubleClick={() =>
                                                    openCamera(camera)
                                                }
                                            >
                                                {online ? "🟢" : "🔴"}{" "}
                                                {camera.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}
                </div>
            </div>

            <div className="main-view">
                <div className="live-view-header">
                    <h2>Live View</h2>
                    <span>
                        {activeCameras.length} active stream(s)
                    </span>
                </div>

                <div className="camera-grid">
                    {activeCameras.map((camera) => (
                        <div className="camera-tile" key={camera.id}>
                            <div className="video-container">
                                <CameraPlayer
                                    streamUrl={camera.streamUrl}
                                />

                                <button
                                    className="close-camera"
                                    onClick={() => closeCamera(camera.id)}
                                    title="Close camera"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="camera-info">
                                🟢 {camera.name}
                            </div>
                        </div>
                    ))}

                    {!loading &&
                        !error &&
                        activeCameras.length === 0 && (
                            <div className="empty-live-view">
                                <p>No camera selected.</p>
                                <p>
                                    Double-click an online camera to start
                                    live viewing.
                                </p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}

export default LiveView;