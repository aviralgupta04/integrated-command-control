using DeviceManagement.Data;
using DeviceManagement.Interfaces;
using DeviceManagement.ONVIF;
using DeviceManagement.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(
            builder.Configuration.GetConnectionString("DefaultConnection")
        )
    )
);


// ONVIF
builder.Services.AddHttpClient<
    IOnvifService,
    OnvifCameraService>();


// Camera Service
builder.Services.AddScoped<
    ICameraService,
    CameraService>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


// CORS MUST be before Authorization/Controllers
app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();