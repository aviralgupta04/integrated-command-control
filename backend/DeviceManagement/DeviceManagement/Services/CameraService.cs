using DeviceManagement.Data;
using DeviceManagement.Interfaces;
using DeviceManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Services
{
    public class CameraService : ICameraService
    {
        private readonly IOnvifService _onvifService;
        private readonly ApplicationDbContext _context;

        public CameraService(
            IOnvifService onvifService,
            ApplicationDbContext context)
        {
            _onvifService = onvifService;
            _context = context;
        }

        public async Task<string> AddCameraAsync(
            AddCameraRequest request)
        {
            string? rtspUrl =
                await _onvifService.GetRtspUrlAsync(
                    request.IpAddress,
                    request.Port,
                    request.Username,
                    request.Password);

            if (string.IsNullOrEmpty(rtspUrl))
            {
                return "Camera connection failed";
            }

            var camera = new Camera
            {
                Name = request.CameraName,
                IpAddress = request.IpAddress,
                Port = request.Port,
                Username = request.Username,
                Password = request.Password,
                RtspUrl = rtspUrl,
                Status = "Online"
            };

            _context.Cameras.Add(camera);

            await _context.SaveChangesAsync();

            return "Camera added successfully";
        }

        public async Task<List<CameraResponse>> GetCamerasAsync()
        {
            return await _context.Cameras
                .AsNoTracking()
                .Select(camera => new CameraResponse
                {
                    Id = camera.Id,
                    Name = camera.Name,
                    IpAddress = camera.IpAddress,
                    Port = camera.Port,
                    Username = camera.Username,
                    Status = camera.Status
                })
                .ToListAsync();
        }
    }
}