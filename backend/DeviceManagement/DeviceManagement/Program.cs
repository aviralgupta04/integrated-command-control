using DeviceManagement.Data;
using DeviceManagement.Interfaces;
using DeviceManagement.ONVIF;
using DeviceManagement.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();


// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection")
        )
    )
);


// ONVIF service
builder.Services.AddHttpClient<
    IOnvifService,
    OnvifCameraService>();


// Camera service
builder.Services.AddScoped<
    ICameraService,
    CameraService>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();