using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;

namespace DeviceManagement.ONVIF
{
    public class OnvifDevice
    {
        public string EndpointReference { get; set; } = string.Empty;
        public string  Types{ get; set; } = string.Empty;
        public List<string> XAddresses { get; set; } = new List<string>();
        public List<string> Scopes { get; set; } = new List<string>();
    }

    public class OnvifDiscoveryService
    {
        private const string MulticastAddress = "239.255.255.250";
        private const int MulticastPort = 3702;

        /// <summary>
        /// Discovers ONVIF devices on the local network.
        /// </summary>
        /// <param name="timeout">Time to listen for responses after sending the Probe request.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>A list of discovered ONVIF devices.</returns>
        public async Task<List<OnvifDevice>> DiscoverDevicesAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            var devices = new List<OnvifDevice>();
            var discoveredEndpoints = new HashSet<string>();

            using var udpClient = new UdpClient();
            udpClient.Client.Bind(new IPEndPoint(IPAddress.Any, 0));

            var multicastEndpoint = new IPEndPoint(IPAddress.Parse(MulticastAddress), MulticastPort);
            byte[] probeMessage = Encoding.UTF8.GetBytes(CreateProbeMessage());

            await udpClient.SendAsync(probeMessage, probeMessage.Length, multicastEndpoint);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(timeout);

            try
            {
                while (!cts.IsCancellationRequested)
                {
                    var receiveTask = udpClient.ReceiveAsync();
                    var completedTask = await Task.WhenAny(receiveTask, Task.Delay(-1, cts.Token));

                    if (completedTask != receiveTask)
                    {
                        break; // Timeout or cancellation reached
                    }

                    UdpReceiveResult result = await receiveTask;
                    string xmlResponse = Encoding.UTF8.GetString(result.Buffer);

                    OnvifDevice device = ParseProbeResponse(xmlResponse);
                    if (device != null && !string.IsNullOrEmpty(device.EndpointReference))
                    {
                        if (discoveredEndpoints.Add(device.EndpointReference))
                        {
                            devices.Add(device);
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when timeout is reached
            }

            return devices;
        }

        private static string CreateProbeMessage()
        {
            string messageId = $"urn:uuid:{Guid.NewGuid():D}";

            return $@"<?xml version=""1.0"" encoding=""utf-8""?>
<s:Envelope xmlns:s=""http://www.w3.org/2003/05/soap-envelope"" 
            xmlns:a=""http://schemas.xmlsoap.org/ws/2004/08/addressing"" 
            xmlns:d=""http://schemas.xmlsoap.org/ws/2005/04/discovery"">
  <s:Header>
    <a:Action s:mustUnderstand=""1"">http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</a:Action>
    <a:MessageID>{messageId}</a:MessageID>
    <a:ReplyTo>
      <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>
    </a:ReplyTo>
    <a:To s:mustUnderstand=""1"">urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To>
  </s:Header>
  <s:Body>
    <d:Probe>
      <d:Types xmlns:dp0=""http://www.onvif.org/ver10/network/wsdl"">dp0:NetworkVideoTransmitter</d:Types>
    </d:Probe>
  </s:Body>
</s:Envelope>";
        }

        private static OnvifDevice ParseProbeResponse(string xmlResponse)
        {
            try
            {
                XDocument doc = XDocument.Parse(xmlResponse);
                XNamespace wsa = "http://schemas.xmlsoap.org/ws/2004/08/addressing";
                XNamespace d = "http://schemas.xmlsoap.org/ws/2005/04/discovery";

                XElement probeMatches = doc.Descendants(d + "ProbeMatches").FirstOrDefault();
                if (probeMatches == null) return null;

                XElement probeMatch = probeMatches.Element(d + "ProbeMatch");
                if (probeMatch == null) return null;

                var device = new OnvifDevice();

                // Extract Endpoint Reference
                var addressElement = probeMatch.Element(wsa + "EndpointReference")?.Element(wsa + "Address");
                if (addressElement != null)
                {
                    device.EndpointReference = addressElement.Value.Trim();
                }

                // Extract Types
                var typesElement = probeMatch.Element(d + "Types");
                if (typesElement != null)
                {
                    device.Types = typesElement.Value.Trim();
                }

                // Extract XAddrs (Service URLs)
                var xAddrsElement = probeMatch.Element(d + "XAddrs");
                if (xAddrsElement != null)
                {
                    string[] urls = xAddrsElement.Value.Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    device.XAddresses.AddRange(urls);
                }

                // Extract Scopes
                var scopesElement = probeMatch.Element(d + "Scopes");
                if (scopesElement != null)
                {
                    string[] scopes = scopesElement.Value.Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    device.Scopes.AddRange(scopes);
                }

                return device;
            }
            catch
            {
                return null;
            }
        }
    }
}