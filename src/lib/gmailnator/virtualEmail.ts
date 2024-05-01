import { InjectAxios } from "../inject";
import type { Email, EmailOption } from "./model/generate.model";
import type { InboxParams, Message, MessageParams } from "./model/email.model";

export class VirtualEmail extends InjectAxios {
  generateEmail(options: EmailOption[]) {
    return this.axios.post<Email>("generate-email", { options });
  }

  getInbox(params: InboxParams) {
    return this.axios.post<Omit<Message, "content">[]>("inbox", params);
  }

  getMessage(params: MessageParams) {
    return this.axios.get<Message>(this.buildPathQueryString("messageid", params));
  }
}
