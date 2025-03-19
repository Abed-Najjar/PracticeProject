using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace API.Dtos;

public class RegisterDto
{
  [Required]
  [MaxLength(100)]
  public required string Username { get; set; }
  [Required]
  public required string Password { get; set; }
}
