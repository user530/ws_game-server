import { Injectable } from '@nestjs/common';
import { ChatLogicService } from '../chat_logic/chat_logic.service';
import { GameChatEventsService } from '../game_chat_events/game_chat_events.service';
import { ChatEventNewMessage, ChatEventNewMsgData } from '@user530/ws_game_shared/interfaces/ws-events';
import { LayerMessage, TargetedEvent } from '../../interfaces';

interface IGameChatService {
    handleHubConnection(connectionData: { userId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent>;

    handleLobbyConnection(connectionData: { userId: string, lobbyRoomId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent>;

    handleGameConnection(connectionData: { userId: string, gameRoomId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent>;

    handleSendMsgMessage(payload: LayerMessage): Promise<ChatEventNewMessage | TargetedEvent>;
}

@Injectable()
export class GameChatService implements IGameChatService {

    constructor(
        private readonly chatLogicService: ChatLogicService,
        private readonly eventCreatorService: GameChatEventsService,
    ) { }

    async handleHubConnection(connectionData: { userId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent> {
        try {
            const hubMessages = await this.chatLogicService.getHubMessages();
            const directMessages = await this.chatLogicService.getDirectMessages(connectionData.userId);

            const hubEventsData = hubMessages.map(msg => this.chatLogicService.generalMsgToEventData(msg));
            const directEventsData = directMessages.map(msg => this.chatLogicService.directMsgToEventData(msg))

            // Combine layer messages, direct messages and sort them all 
            const allUserMsgs = hubEventsData.concat(directEventsData).sort(
                (msg1, msg2) => {
                    const time1 = this.chatLogicService.chatstampToMins(msg1.timestamp);
                    const time2 = this.chatLogicService.chatstampToMins(msg2.timestamp);

                    return (time1 - time2);
                }
            )

            const allMessagesEvents = allUserMsgs.map(
                eventData => this.eventCreatorService.prepareNewMessageEvent(eventData));

            return allMessagesEvents;

        } catch (error) {
            const errText = error.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN LATER!';
            const eventData: ChatEventNewMsgData = this.chatLogicService.errTxtToEventData(errText);
            const targetedEvent: TargetedEvent = {
                event: this.eventCreatorService.prepareNewMessageEvent(eventData),
                targets: [connectionData.userId],
            }

            return targetedEvent;
        }
    }

    async handleLobbyConnection(connectionData: { userId: string, lobbyRoomId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent> {
        try {
            const { lobbyRoomId } = connectionData;
            const lobbyMessages = await this.chatLogicService.getLobbyMessages(lobbyRoomId);
            const directMessages = await this.chatLogicService.getDirectMessages(connectionData.userId);

            const lobbyEventsData = lobbyMessages.map(msg => this.chatLogicService.generalMsgToEventData(msg));
            const directEventsData = directMessages.map(msg => this.chatLogicService.directMsgToEventData(msg))

            // Combine layer messages, direct messages and sort them all 
            const allUserMsgs = lobbyEventsData.concat(directEventsData).sort(
                (msg1, msg2) => {
                    const time1 = this.chatLogicService.chatstampToMins(msg1.timestamp);
                    const time2 = this.chatLogicService.chatstampToMins(msg2.timestamp);

                    return (time1 - time2);
                }
            )

            const allMessagesEvents = allUserMsgs.map(
                eventData => this.eventCreatorService.prepareNewMessageEvent(eventData));

            return allMessagesEvents;

        } catch (error) {
            const errText = error.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN LATER!';
            const eventData: ChatEventNewMsgData = this.chatLogicService.errTxtToEventData(errText);
            const targetedEvent: TargetedEvent = {
                event: this.eventCreatorService.prepareNewMessageEvent(eventData),
                targets: [connectionData.userId],
            }

            return targetedEvent;
        }
    }

    async handleGameConnection(connectionData: { userId: string, gameRoomId: string })
        : Promise<ChatEventNewMessage[] | TargetedEvent> {
        try {
            const { gameRoomId } = connectionData;
            const gameMessages = await this.chatLogicService.getGameMessages(gameRoomId);
            const directMessages = await this.chatLogicService.getDirectMessages(connectionData.userId);

            const gameEventsData = gameMessages.map(msg => this.chatLogicService.generalMsgToEventData(msg));
            const directEventsData = directMessages.map(msg => this.chatLogicService.directMsgToEventData(msg))

            // Combine layer messages, direct messages and sort them all 
            const allUserMsgs = gameEventsData.concat(directEventsData).sort(
                (msg1, msg2) => {
                    const time1 = this.chatLogicService.chatstampToMins(msg1.timestamp);
                    const time2 = this.chatLogicService.chatstampToMins(msg2.timestamp);

                    return (time1 - time2);
                }
            )

            const allMessagesEvents = allUserMsgs.map(
                eventData => this.eventCreatorService.prepareNewMessageEvent(eventData));

            return allMessagesEvents;

        } catch (error) {
            const errText = error.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN LATER!';
            const eventData: ChatEventNewMsgData = this.chatLogicService.errTxtToEventData(errText);
            const targetedEvent: TargetedEvent = {
                event: this.eventCreatorService.prepareNewMessageEvent(eventData),
                targets: [connectionData.userId],
            }

            return targetedEvent;
        }
    }

    async handleSendMsgMessage(payload: LayerMessage): Promise<ChatEventNewMessage | TargetedEvent> {
        try {
            const { msgData: { message, user }, contextData: { layer, roomId } } = payload;

            let resEvent: ChatEventNewMessage | TargetedEvent;

            const isDm = this.chatLogicService.isDirectMessage(message);

            if (isDm) {
                // Parse a direct message
                const { target, messageTxt } = this.chatLogicService.parseDirectMessage(message);

                // Create new direct message from the parsed message
                const newDm = await this.chatLogicService.addDirectMessage(
                    { authorId: user, message: messageTxt, targetName: target });

                // Prepare event data
                const eventData = this.chatLogicService.directMsgToEventData(newDm);

                // Targeted result event
                resEvent = {
                    event: this.eventCreatorService.prepareNewMessageEvent(eventData),
                    targets: [newDm.author.id, newDm.target.id],
                } as TargetedEvent;

            }
            else {
                // Create new general message tied to the layer and the room
                const newGeneralMessage = await this.chatLogicService.addGeneralMessage(
                    {
                        authorId: user,
                        message,
                        layer,
                        roomId,
                    }
                )

                // Prepare event data
                const eventData = this.chatLogicService.generalMsgToEventData(newGeneralMessage);

                // Prepare normal message event
                resEvent = this.eventCreatorService.prepareNewMessageEvent(eventData);
            }

            return resEvent;

        } catch (error) {
            const errText = error.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN LATER!';
            const eventData: ChatEventNewMsgData = this.chatLogicService.errTxtToEventData(errText);
            const targetedEvent: TargetedEvent = {
                event: this.eventCreatorService.prepareNewMessageEvent(eventData),
                targets: [payload.msgData.user],
            }

            return targetedEvent;
        }
    }

}
