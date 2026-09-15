namespace DeviceManagement.Models
{
    public class AddCameraRequest
    {
        public int DeviceId { get; set; }
        public string CameraName { get; set; }
        public string IpAddress { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
