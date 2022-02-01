export class RoutingService {
  chat: JSON;

  getChat() {
    return this.chat;
  }

  setChat(chat: JSON) {
    this.chat = chat;
  }
}
