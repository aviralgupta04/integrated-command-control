using DeviceManagement.Models;

namespace DeviceManagement.Interfaces
{
    
        public interface ICameraService
        {
            Task<string> AddCameraAsync(AddCameraRequest request);
        Task<List<CameraResponse>> GetCamerasAsync();
    }

    
}
