using DeviceManagement.Interfaces;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;

namespace DeviceManagement.ONVIF
{
    /// <summary>
    /// ONVIF camera service.
    ///
    /// This follows the standard ONVIF discovery sequence, where each
    /// step depends on the result of the previous one and is NOT
    /// something you can skip or reorder:
    ///
    ///   1. GetCapabilities   -> resolve the Media service XAddr
    ///   2. GetProfiles       -> resolve a media profile token
    ///   3. GetStreamUri      -> resolve the RTSP URL for that profile
    ///
    /// Each step is its own method so the flow reads top-to-bottom as
    /// a series of stages instead of one long procedural block.
    /// </summary>
    public class OnvifCameraService : IOnvifService
    {
        private readonly HttpClient _httpClient;

        public OnvifCameraService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        // =========================================================
        // PUBLIC ENTRY POINT — ORCHESTRATES THE SEQUENCE
        // =========================================================

        public async Task<string?> GetRtspUrlAsync(
            string ipAddress,
            int port,
            string username,
            string password)
        {
            string deviceUrl = $"http://{ipAddress}:{port}/onvif/device_service";

            // ---- STEP 1: CAPABILITIES ---------------------------
            string mediaUrl = await Step1_GetMediaServiceUrlAsync(
                deviceUrl,
                username,
                password);

            // ---- STEP 2: PROFILES --------------------------------
            string profileToken = await Step2_GetProfileTokenAsync(
                mediaUrl,
                username,
                password);

            // ---- STEP 3: STREAM URI ------------------------------
            string rtspUrl = await Step3_GetStreamUriAsync(
                mediaUrl,
                profileToken,
                username,
                password);

            return rtspUrl;
        }

        // =========================================================
        // STEP 1 — GET CAPABILITIES -> RESOLVE MEDIA SERVICE URL
        // =========================================================

        private async Task<string> Step1_GetMediaServiceUrlAsync(
            string deviceUrl,
            string username,
            string password)
        {
            string request = CreateGetCapabilitiesRequest();

            string response = await SendSoapRequestAsync(
                deviceUrl,
                request,
                username,
                password,
                "http://www.onvif.org/ver10/device/wsdl/GetCapabilities");

            LogStep("GET CAPABILITIES RESPONSE", response);

            string? mediaUrl = GetMediaXAddrFromCapabilities(response);

            if (string.IsNullOrEmpty(mediaUrl))
            {
                throw new Exception(
                    "Media service XAddr was not found in GetCapabilities response.");
            }

            LogStep("MEDIA SERVICE URL", mediaUrl);

            return mediaUrl;
        }

        // =========================================================
        // STEP 2 — GET PROFILES -> RESOLVE PROFILE TOKEN
        // =========================================================

        private async Task<string> Step2_GetProfileTokenAsync(
            string mediaUrl,
            string username,
            string password)
        {
            string request = CreateGetProfilesRequest();

            string response = await SendSoapRequestAsync(
                mediaUrl,
                request,
                username,
                password,
                "http://www.onvif.org/ver10/media/wsdl/GetProfiles");

            LogStep("GET PROFILES RESPONSE", response, useDebug: true);

            string? profileToken = GetAttributeValue(
                response,
                "Profiles",
                "token");

            if (string.IsNullOrEmpty(profileToken))
            {
                throw new Exception(
                    "No ONVIF media profile was found.");
            }

            LogStep("PROFILE TOKEN", profileToken);

            return profileToken;
        }

        // =========================================================
        // STEP 3 — GET STREAM URI -> RESOLVE RTSP URL
        // =========================================================

        private async Task<string> Step3_GetStreamUriAsync(
            string mediaUrl,
            string profileToken,
            string username,
            string password)
        {
            string request = CreateGetStreamUriRequest(profileToken);

            string response = await SendSoapRequestAsync(
                mediaUrl,
                request,
                username,
                password,
                "http://www.onvif.org/ver10/media/wsdl/GetStreamUri");

            LogStep("GET STREAM URI RESPONSE", response);

            string? rtspUrl = GetElementValue(response, "Uri");

            if (string.IsNullOrEmpty(rtspUrl))
            {
                throw new Exception(
                    "RTSP URL was not found in GetStreamUri response.");
            }

            LogStep("RTSP URL", rtspUrl);

            return rtspUrl;
        }

        // =========================================================
        // REQUEST BUILDERS
        // =========================================================

        private string CreateGetCapabilitiesRequest()
        {
            return """
                <?xml version="1.0" encoding="utf-8"?>
                <s:Envelope
                    xmlns:s="http://www.w3.org/2003/05/soap-envelope"
                    xmlns:tds="http://www.onvif.org/ver10/device/wsdl"
                    xmlns:tt="http://www.onvif.org/ver10/schema">
                    <s:Header />
                    <s:Body>
                        <tds:GetCapabilities>
                            <tds:Category>All</tds:Category>
                        </tds:GetCapabilities>
                    </s:Body>
                </s:Envelope>
                """;
        }

        private string CreateGetProfilesRequest()
        {
            return """
                <?xml version="1.0" encoding="utf-8"?>
                <s:Envelope
                    xmlns:s="http://www.w3.org/2003/05/soap-envelope"
                    xmlns:trt="http://www.onvif.org/ver10/media/wsdl">
                    <s:Header />
                    <s:Body>
                        <trt:GetProfiles />
                    </s:Body>
                </s:Envelope>
                """;
        }

        private string CreateGetStreamUriRequest(string profileToken)
        {
            return $"""
                <?xml version="1.0" encoding="utf-8"?>
                <s:Envelope
                    xmlns:s="http://www.w3.org/2003/05/soap-envelope"
                    xmlns:trt="http://www.onvif.org/ver10/media/wsdl"
                    xmlns:tt="http://www.onvif.org/ver10/schema">
                    <s:Header />
                    <s:Body>
                        <trt:GetStreamUri>
                            <trt:StreamSetup>
                                <tt:Stream>RTP-Unicast</tt:Stream>
                                <tt:Transport>
                                    <tt:Protocol>RTSP</tt:Protocol>
                                </tt:Transport>
                            </trt:StreamSetup>
                            <trt:ProfileToken>{profileToken}</trt:ProfileToken>
                        </trt:GetStreamUri>
                    </s:Body>
                </s:Envelope>
                """;
        }

        // =========================================================
        // SOAP TRANSPORT
        // =========================================================

        private async Task<string> SendSoapRequestAsync(
            string url,
            string soapRequest,
            string username,
            string password,
            string soapAction)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, url);

            request.Content = new StringContent(
                soapRequest,
                Encoding.UTF8,
                "application/soap+xml");

            // SOAP 1.2 carries the action in the Content-Type "action"
            // parameter instead of a SOAPAction header.
            request.Content.Headers.ContentType!.Parameters.Add(
                new NameValueHeaderValue("action", $"\"{soapAction}\""));

            string credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{username}:{password}"));

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Basic", credentials);

            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine("ONVIF REQUEST");
            Console.WriteLine("URL: " + url);
            Console.WriteLine("ACTION: " + soapAction);
            Console.WriteLine("==========================================");
            Console.WriteLine(soapRequest);

            HttpResponseMessage response = await _httpClient.SendAsync(request);

            string responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine();
            Console.WriteLine("==========================================");
            Console.WriteLine("ONVIF RESPONSE");
            Console.WriteLine("STATUS: " + response.StatusCode);
            Console.WriteLine("==========================================");
            Console.WriteLine(responseBody);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(
                    $"ONVIF request failed.\n" +
                    $"URL: {url}\n" +
                    $"Action: {soapAction}\n" +
                    $"Status: {response.StatusCode}\n" +
                    $"Response: {responseBody}");
            }

            return responseBody;
        }

        // =========================================================
        // XML PARSING HELPERS
        // =========================================================

        /// <summary>
        /// Extracts the Media service XAddr from a GetCapabilities
        /// response: Capabilities/Media/XAddr.
        /// </summary>
        private string? GetMediaXAddrFromCapabilities(string xml)
        {
            XDocument document = XDocument.Parse(xml);

            XElement? mediaElement = document
                .Descendants()
                .FirstOrDefault(x => x.Name.LocalName == "Media");

            if (mediaElement == null)
            {
                return null;
            }

            XElement? xAddr = mediaElement
                .Elements()
                .FirstOrDefault(x => x.Name.LocalName == "XAddr");

            return xAddr?.Value.Trim();
        }

        private string? GetElementValue(string xml, string elementName)
        {
            XDocument document = XDocument.Parse(xml);

            XElement? element = document
                .Descendants()
                .FirstOrDefault(x => x.Name.LocalName == elementName);

            return element?.Value.Trim();
        }

        private string? GetAttributeValue(
            string xml,
            string elementName,
            string attributeName)
        {
            XDocument document = XDocument.Parse(xml);

            XElement? element = document
                .Descendants()
                .FirstOrDefault(x => x.Name.LocalName == elementName);

            return element?.Attribute(attributeName)?.Value;
        }

        // =========================================================
        // LOGGING HELPER
        // =========================================================

        private void LogStep(string label, string content, bool useDebug = false)
        {
            if (useDebug)
            {
                Debug.WriteLine("");
                Debug.WriteLine($"========== {label} ==========");
                Debug.WriteLine(content);
            }
            else
            {
                Console.WriteLine();
                Console.WriteLine($"========== {label} ==========");
                Console.WriteLine(content);
            }
        }
    }
}