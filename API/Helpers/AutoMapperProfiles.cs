using API.Dtos;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
      CreateMap<AppUser, MemberDto>()
        .ForMember(
          d => d.Age,
          o => o.MapFrom(s => s.DateOfBirth.CalculateAge())
          )
        
        .ForMember(
          // property inside out MemberDto
          d => d.PhotoUrl,

          // this maps from the Photo property inside AppUser,
          // if its null it automatically sets the PhotoUrl property to null.
          o => o.MapFrom(s => s.Photos.FirstOrDefault(x => x.IsMain)!.Url)
          
          );

      CreateMap<Photo, PhotoDto>();
      CreateMap<MemberUpdateDto, AppUser>();
      CreateMap<RegisterDto, AppUser>();
      CreateMap<string, DateOnly>().ConvertUsing(s => DateOnly.Parse(s));
      CreateMap<Message, MessageDto>()
        .ForMember(d => d.SenderPhotoUrl,
                    o => o.MapFrom(s => s.Sender.Photos.FirstOrDefault(x => x.IsMain)!.Url))
        .ForMember(d => d.RecipientPhotoUrl,
                    o => o.MapFrom(s => s.Recipient.Photos.FirstOrDefault(x => x.IsMain)!.Url));
      CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
      CreateMap<DateTime?, DateTime?>().ConvertUsing(d => d.HasValue 
        ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null);
    }

    
}
