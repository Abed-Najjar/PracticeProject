using API.Dtos;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Mapper;

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
      CreateMap<memberUpdateDto, AppUser>();
    }

    
}
