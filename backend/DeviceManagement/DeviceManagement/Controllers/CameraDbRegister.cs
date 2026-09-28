using DeviceManagement.Interfaces;
using DeviceManagement.Models;
using Microsoft.AspNetCore.Mvc;

namespace DeviceManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraDbRegisterController : ControllerBase
    {
        private readonly ICameraService _cameraService;

        public CameraDbRegisterController(ICameraService cameraService)
        {
            _cameraService = cameraService;
        }

        // POST: api/CameraDbRegister
        [HttpPost]
        public async Task<IActionResult> AddCamera(
            AddCameraRequest request)
        {
            var result = await _cameraService.AddCameraAsync(request);

            if (result == "Camera connection failed")
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        // GET: api/CameraDbRegister
        [HttpGet]
        public async Task<IActionResult> GetCameras()
        {
            var cameras = await _cameraService.GetCamerasAsync();

            return Ok(cameras);
        }
    }
}