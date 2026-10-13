
import { useEffect, useState } from "react";
import "./Devices.css";

function Devices() {

    // Controls whether Add Device modal is visible
    const [showModal, setShowModal] = useState(false);

    // Stores cameras received from backend
    const [devices, setDevices] = useState([]);

    // Stores Add Camera form data
    const [camera, setCamera] = useState({
        deviceId: 0,
        cameraName: "",
        ipAddress: "",
        port: 80,
        username: "",
        password: ""
    });


    // =========================================================
    // GET CAMERAS
    // =========================================================

    
useEffect(() => {
    const fetchCameras = async () => {
        try {
            const response = await fetch(
                "https://localhost:7068/api/CameraDbRegister"
            );

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            console.log("Cameras received:", data);
            setDevices(data);
        } catch (error) {
            console.error("Error loading cameras:", error);
        }
    };

    fetchCameras();
}, []);



    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setCamera({
            ...camera,
            [name]: value
        });

    };


    // =========================================================
    // ADD CAMERA
    // =========================================================

    const handleAddCamera = async () => {

        try {

            const response = await fetch(
                "https://localhost:7068/api/CameraDbRegister",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(camera)
                }
            );


            // If backend returns 400 / 500 etc.
            if (!response.ok) {

                const error = await response.text();

                console.error(
                    "Camera could not be added:",
                    error
                );

                return;
            }


            // Read successful response
            const result = await response.text();

            console.log(
                "Camera added successfully:",
                result
            );


            // Close modal
            setShowModal(false);


            // Clear form
            setCamera({
                deviceId: 0,
                cameraName: "",
                ipAddress: "",
                port: 80,
                username: "",
                password: ""
            });


            // =================================================
            // GET UPDATED CAMERA LIST
            // =================================================

            const camerasResponse = await fetch(
                "https://localhost:7068/api/CameraDbRegister"
            );


            if (!camerasResponse.ok) {

                throw new Error(
                    "Failed to reload cameras"
                );

            }


            const cameras =
                await camerasResponse.json();


            setDevices(cameras);

        }
        catch (error) {

            console.error(
                "Error adding camera:",
                error
            );

        }

    };


    // =========================================================
    // JSX
    // =========================================================

    return (

        <div className="devices-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="devices-header">

                <div>

                    <h1>
                        Devices
                    </h1>

                    <p>
                        Manage cameras connected to your system
                    </p>

                </div>


                <button
                    className="add-device-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Add Device
                </button>

            </div>



            {/* =================================================
                DEVICE TABLE
            ================================================= */}

            <div className="devices-container">

                <table className="devices-table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Camera Name
                            </th>

                            <th>
                                IP Address
                            </th>

                            <th>
                                Port
                            </th>

                            <th>
                                Username
                            </th>

                            <th>
                                Password
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                   <tbody>
    {devices.length === 0 ? (
        <tr>
            <td colSpan="8">No cameras found.</td>
        </tr>
    ) : (
        devices.map((device) => (
            <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.name}</td>
                <td>{device.ipAddress}</td>
                <td>{device.port}</td>
                <td>{device.username}</td>
                <td>••••••••</td>
                <td>{device.status}</td>
                <td>
                    <button className="action-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                </td>
            </tr>
        ))
    )}
</tbody>

                </table>

            </div>



            {/* =================================================
                ADD DEVICE MODAL
            ================================================= */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="add-device-modal">


                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Add Device
                                </h2>

                                <p>
                                    Add camera details to your VMS
                                </p>

                            </div>


                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>

                        </div>



                        {/* =================================================
                            CAMERA FORM
                        ================================================= */}

                        <div className="camera-form">


                            {/* Camera Name */}

                            <div className="form-group">

                                <label>
                                    Camera Name
                                </label>

                                <input
                                    type="text"
                                    name="cameraName"
                                    value={camera.cameraName}
                                    onChange={handleChange}
                                    placeholder="Enter camera name"
                                />

                            </div>



                            {/* IP Address */}

                            <div className="form-group">

                                <label>
                                    IP Address
                                </label>

                                <input
                                    type="text"
                                    name="ipAddress"
                                    value={camera.ipAddress}
                                    onChange={handleChange}
                                    placeholder="192.168.0.12"
                                />

                            </div>



                            {/* Port */}

                            <div className="form-group">

                                <label>
                                    Port
                                </label>

                                <input
                                    type="number"
                                    name="port"
                                    value={camera.port}
                                    onChange={handleChange}
                                />

                            </div>



                            {/* Username */}

                            <div className="form-group">

                                <label>
                                    Username
                                </label>

                                <input
                                    type="text"
                                    name="username"
                                    value={camera.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                />

                            </div>



                            {/* Password */}

                            <div className="form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={camera.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                />

                            </div>

                        </div>



                        {/* =================================================
                            MODAL FOOTER
                        ================================================= */}

                        <div className="modal-footer">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>


                            <button
                                className="save-device-btn"
                                onClick={handleAddCamera}
                            >
                                Add Camera
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}

export default Devices;

