using System.ComponentModel.DataAnnotations.Schema;

namespace DeviceManagement.Models
{
    [Table("cameras")]
    public class Camera
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("ip_address")]
        public string IpAddress { get; set; } = string.Empty;

        [Column("port")]
        public int Port { get; set; }

        [Column("username")]
        public string Username { get; set; } = string.Empty;

        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Column("rtsp_url")]
        public string? RtspUrl { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Offline";
    }
}