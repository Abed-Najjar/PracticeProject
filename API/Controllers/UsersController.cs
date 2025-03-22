using System.Security.Claims;
using API.Data;
using API.Data.Repositories;
using API.Dtos;
using API.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository) : BaseApiController
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
  public async Task<ActionResult> UpdateUser(memberUpdateDto memberUpdateDto, IMapper mapper)
  {
    var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if(username == null) return BadRequest("No username found in token");


    // getting a user from our data base via EntityFrameworkCore
    var user = await userRepository.GetUserByNameAsync(username);

    if(user == null) return BadRequest("Could not find user");

    // updating the user using mapper.Map
    // EntityFrameworkCore will update this user object
    mapper.Map(memberUpdateDto, user);

    // this will save the changes into the database.
    if(await userRepository.SaveAllAsync()) return NoContent();

    return BadRequest("Failed to update the user");
  }
} 
