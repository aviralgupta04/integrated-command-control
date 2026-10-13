namespace DeviceManagement.Services;

using DeviceManagement.Data;
using DeviceManagement.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore;

public class GetCamera
{
    private readonly ApplicationDbContext _context;
    public GetCamera(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CameraResponse>> GetCamerasAsync()
    {
        var cameras = await _context.Cameras
            .Select(c => new CameraResponse
            {
                Id = c.Id,
                Name = c.Name,
                IpAddress = c.IpAddress,
                Port = c.Port,
                Username = c.Username,
                Status = c.Status
            })
            .ToListAsync();
        return cameras;
    }
}
