using DeviceManagement.Interfaces;
using Microsoft.AspNetCore.Mvc;
using DeviceManagement.Models;


namespace DeviceManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CamerasController: ControllerBase
    {
        private readonly ICameraService _cameraService;

        public CamerasController(ICameraService cameraService)
        {
            _cameraService = cameraService;
        }

        [HttpPost]
        public async Task<IActionResult> AddCamera(AddCameraRequest request)
        
        {
            var result = await _cameraService.AddCameraAsync(request);

            return Ok(result);
        }
    }
}
