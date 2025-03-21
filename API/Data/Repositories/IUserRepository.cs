using API.Dtos;
using API.Entities;

namespace API.Data.Repositories;

public interface IUserRepository
{
  void Update(AppUser user);
  Task<bool> SaveAllAsync();
  Task<IEnumerable<AppUser>> GetUsersAsync();
  Task<AppUser?> GetUserByIdAsync(int id);
  Task<AppUser?> GetUserByNameAsync(string username);
  Task<IEnumerable<MemberDto>> GetMembersAsync();
  Task<MemberDto?> GetMemberAsync(string username);
}
