using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace API.Dtos;

public class RegisterDto
{
  [Required]
  [StringLength(8, MinimumLength = 4)]
  public string Username { get; set; } = string.Empty;
  [Required]
  public string Password { get; set; } = string.Empty;
}
