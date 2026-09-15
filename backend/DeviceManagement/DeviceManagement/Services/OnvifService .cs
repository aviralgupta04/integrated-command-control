using DeviceManagement.Interfaces;

namespace DeviceManagement.Services
{
    public class OnvifService : IOnvifService
    {
        public async Task<bool> ConnectAsync(
            string ipAddress,
            int port,
            string username,
            string password)
        {
            string url =
                $"http://{ipAddress}:{port}/onvif/device_service";

            // ONVIF communication will happen here

            return true;
        }
    }
}
