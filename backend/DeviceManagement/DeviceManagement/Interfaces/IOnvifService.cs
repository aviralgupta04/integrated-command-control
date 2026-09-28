namespace DeviceManagement.Interfaces
{
    public interface IOnvifService
    {
        Task<string?> GetRtspUrlAsync(
            string ipAddress,
            int port,
            string username,
            string password);
    }
}