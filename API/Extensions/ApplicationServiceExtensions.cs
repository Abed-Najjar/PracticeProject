using API.Data;
using API.Data.Repositories;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
  public static IServiceCollection AddApplicationServices(
    this IServiceCollection services,
         IConfiguration config)
  {
    services.AddControllers();
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
        { 
            Title = "Dating App API", 
            Version = "v1" 
        });
        
        // Add JWT Authentication
        c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
            Name = "Authorization",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                },
                new List<string>()
            }
        });
    });
    services.AddDbContext<DataContext>(opt =>
    {

      opt.UseSqlite(config.GetConnectionString("DefaultConnection"));

    }
    );

    services.AddCors();
    services.AddScoped<ITokenService, TokenService>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<ILikesRepository, LikesRepository>();
    services.AddScoped<IMessageRepository, MessageRepository>();
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddScoped<IPhotoService, PhotoService>(); // added CloudinaryDotNet package
    services.AddScoped<LogUserActivity>();
    services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
    services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings")); // CloudName , ApiKey , ApiSecret configuration
    services.AddSignalR();
    services.AddSingleton<PresenceTracker>();

    return services;
  }
}
