using DeviceManagement.Interfaces;
using DeviceManagement.Models;

public class CameraService : ICameraService
{
    private readonly IOnvifService _onvifService;

    public CameraService(IOnvifService onvifService)
    {
        _onvifService = onvifService;
    }

    public async Task<string> AddCameraAsync(AddCameraRequest request)
    {
        var result = await _onvifService.ConnectAsync(
            request.IpAddress,
            request.Port,
            request.Username,
            request.Password
        );

        if (!result)
        {
            return "Camera connection failed";
        }

        return "Camera connected successfully";
    }
}