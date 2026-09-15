import { useState } from "react";
import "./Devices.css";

function Devices() {

    const [showModal, setShowModal] = useState(false);

    const [devices, setDevices] = useState([
        {
            id: 1,
            devicename: "Front Camera",
            ip: "192.168.0.12",
            port: "554",
            username: "admin",
            password: "********",
            status: "Online"
        }
    ]);

    return (
        <div className="devices-page">

            {/* Header */}
            <div className="devices-header">

                <div>
                    <h1>Devices</h1>
                    <p>Manage cameras connected to your system</p>
                </div>

                <button
                    className="add-device-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Add Device
                </button>

            </div>


            {/* Device Table */}
            <div className="devices-container">

                <table className="devices-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Camera Name</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {devices.map((device) => (

                            <tr key={device.id}>

                                <td>{device.id}</td>

                                <td>{device.devicename}</td>

                                <td>{device.ip}</td>

                                <td>{device.port}</td>

                                <td>{device.username}</td>

                                <td>{device.password}</td>

                                <td>
                                    <span
                                        className={
                                            device.status === "Online"
                                                ? "status online"
                                                : "status offline"
                                        }
                                    >
                                        {device.status}
                                    </span>
                                </td>

                                <td>
                                    <button className="action-btn">
                                        Edit
                                    </button>

                                    <button className="delete-btn">
                                        Delete
                                    </button>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* Add Device Modal */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="add-device-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Add Device</h2>
                                <p>Add camera details to your VMS</p>
                            </div>

                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>

                        </div>


                        {/* Camera Form */}

                        <div className="camera-form">

                            <div className="form-group">
                                <label>Camera Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter camera name"
                                />
                            </div>

                            <div className="form-group">
                                <label>IP Address</label>
                                <input
                                    type="text"
                                    placeholder="192.168.0.12"
                                />
                            </div>

                            <div className="form-group">
                                <label>Port</label>
                                <input
                                    type="number"
                                    placeholder="80"
                                />
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                />
                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div className="modal-footer">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button className="save-device-btn">
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