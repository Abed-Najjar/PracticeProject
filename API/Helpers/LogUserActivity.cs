using API.Data.Repositories;
using API.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
  public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
  {
    var resultsContext = await next();

    if(context.HttpContext.User.Identity?.IsAuthenticated != true) return;

    var userId = resultsContext.HttpContext.User.GetUserId();

    var repo = resultsContext.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
    var user = await repo.GetUserByIdAsync(userId);

    if(user == null) return;

    user.LastActive = DateTime.UtcNow;
    await repo.SaveAllAsync();
    

  }
}
