namespace API.Dtos;

public class EditMessageDto
{
    public int MessageId { get; set; }
    public required string NewContent { get; set; }
}
