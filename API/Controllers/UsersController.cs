using System.Security.Claims;
using API.Data.Repositories;
using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository,IMapper mapper, 
  IPhotoService photoService) : BaseApiController
{
  [HttpGet]
  public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
  {
    var users = await userRepository.GetMembersAsync();

    return Ok(users);
  }

  [HttpGet("{username}")] // /api/users/3
  public async Task<ActionResult<MemberDto>> GetUser(string username)
  {
    var user = await userRepository.GetMemberAsync(username);

    if (user == null) return NotFound();
    
    return user;

  }

  [HttpPut]
  public async Task<ActionResult> UpdateUser(memberUpdateDto memberUpdateDto)
  {

    // getting a user from our data base via EntityFrameworkCore
    var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

    if(user == null) return BadRequest("Could not find user");

    // updating the user using mapper.Map
    // EntityFrameworkCore will update this user object
    mapper.Map(memberUpdateDto, user);

    // this will save the changes into the database.
    if(await userRepository.SaveAllAsync()) return NoContent();

    return BadRequest("Failed to update the user");
  }


  [HttpPost("add-photo")]
  public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
  {
    var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

    if(user == null) return BadRequest("Cannot update user");

    var results = await photoService.AddPhotoAsync(file);

    if(results.Error != null) return BadRequest(results.Error.Message);

    var photo = new Photo
    {
      Url = results.SecureUrl.AbsoluteUri,
      PublicId = results.PublicId,
    };

    if(user.Photos.Count == 0) photo.IsMain = true;


    user.Photos.Add(photo);

    if(await userRepository.SaveAllAsync()) 
      return CreatedAtAction(nameof(GetUser),
       new {username = user.UserName}, mapper.Map<PhotoDto>(photo));

    return BadRequest("Problem adding photo");

  }

  [HttpPut("set-main-photo/{photoId:int}")]
  public async Task<ActionResult> SetMainPhoto(int photoId)
  {
    var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());

    if(user == null) return BadRequest("Could not find user");

    var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

    if(photo == null || photo.IsMain) return BadRequest("Cannot use this as main photo");

    var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
    if(currentMain != null) currentMain.IsMain = false;
    photo.IsMain = true;

    if(await userRepository.SaveAllAsync()) return NoContent();
    return BadRequest("Problem setting main photo");

  }


  [HttpDelete("delete-photo/{photoId:int}")]
  public async Task<ActionResult> DeletePhoto(int photoId)
  {
    var user = await userRepository.GetUserByUsernameAsync(User.GetUsername());
    
    if(user == null) return BadRequest("User not found");

    var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

    if(photo == null || photo.IsMain) return BadRequest("This photo cannot be deleted");

    if(photo.PublicId != null)
    {
      var result = await photoService.DeletionPhotoAsync(photo.PublicId);

      if(result.Error != null) return BadRequest(result.Error.Message);
      
    }

      user.Photos.Remove(photo);

      if(await userRepository.SaveAllAsync()) return Ok();

      return BadRequest("Problem deleting photo");
    
  }

} 
