using DeviceManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceManagement.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Camera> Cameras { get; set; }
    }
}