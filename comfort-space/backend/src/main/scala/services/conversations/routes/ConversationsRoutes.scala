package services.conversations.routes
import services.conversations.api.*
import services.conversations.objects.*
import services.conversations.objects.apiTypes.*
import services.system.api.ApiEndpoint
import services.system.objects.apiTypes.Acknowledgement
object ConversationsRoutes:
  def apiMessages(minimumTurns: Int): Vector[ApiEndpoint] = Vector(
    ApiEndpoint[CreateConversationInput, Conversation]("CreateConversationMessage")(
      (owner, input) => CreateConversationMessage(owner, input.id)
    ),
    ApiEndpoint[SendMessageInput, Conversation]("SendMessageMessage")((owner, input) =>
      SendMessageMessage(owner, input.conversationId, input.requestId, input.content, minimumTurns)
    ),
    ApiEndpoint[ConversationIdInput, Conversation]("GetConversationMessage")((owner, input) =>
      GetConversationMessage(owner, input.id)
    ),
    ApiEndpoint.noRequest[Vector[Conversation]]("ListConversationsMessage")(
      ListConversationsMessage.apply
    ),
    ApiEndpoint[ConversationIdInput, Acknowledgement]("DeleteConversationMessage")((owner, input) =>
      DeleteConversationMessage(owner, input.id)
    )
  )
